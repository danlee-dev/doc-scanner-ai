import os
import re
import json
from elasticsearch import Elasticsearch, helpers
from sentence_transformers import SentenceTransformer

# --- 설정 ---
# 1. 쿼리 임베딩 모델 로드
print("임베딩 모델 로드 중... (KURE-v1)")
MODEL_NAME = "nlpai-lab/KURE-v1" # search.py에서 확인한 모델 이름
try:
    model = SentenceTransformer(MODEL_NAME)
    model.max_seq_length = 512 # 원본 search.py와 동일하게 설정
except Exception as e:
    print(f"모델 로드 실패! '{MODEL_NAME}'이 맞는지 확인하세요. (오류: {e})")
    print("인터넷 연결을 확인하거나, 모델 이름을 다시 확인하세요.")
    exit()

# 2. Elasticsearch 연결
# (터미널에서 set NO_PROXY=localhost를 실행해야 함)
es = Elasticsearch("http://localhost:9200") 

# 3. 인덱스 이름
INDEX_NAME = "docscanner_chunks"

# 4. 문서 타입 매핑 (로그 출력용)
DOC_TYPE_MAP = {
    'interpretation': '법령해석례',
    'precedent': '판례',
    'labor_ministry': '고용노동부',
    'manual': '매뉴얼(PDF)',
    'employment_rules': '취업규칙(PDF)',
    'guide': '안내서(PDF)',
    'leaflet': '리플릿(PDF)',
    'question': '질의(법률)',
    'answer': '답변(법률)',
}
# -----------------

def search_es(query: str, top_k: int = 5, filter_source: str = None):
    """Elasticsearch에 벡터 검색(KNN) 실행 (필터 포함)"""
    
    # 1. 사용자 쿼리를 벡터로 변환
    print("\n쿼리 임베딩 중...")
    try:
        query_vector = model.encode(query, normalize_embeddings=True).tolist()
    except Exception as e:
        print(f"쿼리 임베딩 실패: {e}")
        return []
        
    print("Elasticsearch로 검색 실행 중...")

    # 2. Elasticsearch KNN 쿼리 생성
    knn_query = {
        "field": "embedding",
        "query_vector": query_vector,
        "k": top_k,
        "num_candidates": 100 
    }

    # 3. 필터가 있다면 KNN 쿼리 내부에 'filter' 블록 추가
    if filter_source:
        knn_query["filter"] = {
            "term": {
                "source": filter_source 
            }
        }
        print(f"(필터 적용: source == '{filter_source}')")


    try:
        response = es.search(
            index=INDEX_NAME,
            knn=knn_query, 
            size=top_k,
            request_timeout=30
        )
        return response['hits']['hits']
        
    except Exception as e:
        print(f"ES 검색 중 오류 발생: {e}")
        return []

def main():
    """사용자 입력을 받아 검색을 수행하는 메인 루프"""
    if not es.indices.exists(index=INDEX_NAME):
        print(f"오류: '{INDEX_NAME}' 인덱스를 찾을 수 없습니다.")
        print("4_index.py를 먼저 실행했는지 확인하세요.")
        return

    print("\n" + "="*70)
    print("🎉 Elasticsearch 임베딩 검색 테스트 (대화형 모드)")
    print("="*70)
    print("\n사용법:")
    print("  - 검색: 쿼리 입력")
    print("  - 필터: @필터명 추가 (예: 최저임금 @precedent)")
    print("  - 상위 결과: #숫자 추가 (예: 연차 #10)")
    print("  - 종료: 'q' 또는 'exit' 입력")
    print("\n사용 가능한 필터 예시:")
    print("  - @precedent (판례만)")
    print("  - @interpretation (법령해석례만)")
    print("  - @manual (매뉴얼만)")
    print("  - @employment_rules (취업규칙만)")
    print("="*70 + "\n")

    while True:
        try:
            user_input = input("검색 쿼리: ").strip()

            if user_input.lower() in ['q', 'exit', 'quit', '종료']:
                print("\n테스트를 종료합니다.")
                break
            
            if not user_input:
                continue

            # --- 파라미터 파싱 ---
            query = user_input
            filter_source = None
            top_k = 5 # 기본 5개

            # 1. @ 필터 파싱
            if '@' in query:
                parts = query.split('@')
                query = parts[0].strip()
                filter_str = parts[1].strip().split()[0]
                filter_source = filter_str 
            
            # 2. # top_k 파싱
            if '#' in query:
                parts = query.split('#')
                query = parts[0].strip()
                try:
                    top_k = int(parts[1].strip().split()[0])
                    top_k = min(max(top_k, 1), 20) # 1~20개로 제한
                except ValueError:
                    print("잘못된 숫자 형식. 기본 5개로 검색합니다.")
                    top_k = 5
            
            if not query:
                print("검색어가 없습니다.")
                continue

            # --- ES 검색 실행 ---
            results = search_es(query, top_k=top_k, filter_source=filter_source)

            if not results:
                print("\n-> 검색 결과가 없습니다.")
                print("="*70)
                continue

            # --- 결과 로그 출력 ---
            print(f"\n--- '{query}' 검색 결과 (Top {len(results)}) ---")
            for i, hit in enumerate(results):
                source_data = hit['_source']
                source_type = source_data.get('source', 'unknown')
                
                print(f"\n[{i+1}] 유사도: {hit['_score']:.4f}")
                print(f"  (출처 타입: {DOC_TYPE_MAP.get(source_type, source_type)})") # 맵핑된 이름 출력
                
                # 내용 미리보기
                content = source_data.get('text', '').replace('\n', ' ')[:200]
                print(f"  내용: {content}...")
                print("-"*20)
            print("="*70)
                
        except KeyboardInterrupt:
            print("\n테스트를 종료합니다.")
            break
        except Exception as e:
            print(f"!!! 전체 루프 오류 발생: {e}")

if __name__ == "__main__":
    main()