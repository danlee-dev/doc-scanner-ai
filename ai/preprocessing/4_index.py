import os
import json
from elasticsearch import Elasticsearch, helpers
from tqdm import tqdm # 진행률 표시

# --- 설정 ---
# 1. Elasticsearch 연결
es = Elasticsearch("http://localhost:9200")

# 2. 인덱스 이름 정의
INDEX_NAME = "docscanner_chunks"

# 3. 인덱싱할 데이터 파일 경로
DATA_FILES = [
    "../data/processed/embeddings/legal_chunks_with_embeddings_20251027.json",
    "../data/processed/embeddings/chunks_with_embeddings.json"
]
# -----------------

def create_index():
    """Elasticsearch 인덱스 생성. (테이블 스키마 정의)"""
    
    # BM25(nori) 및 벡터 검색(1024차원)을 위한 매핑 설정
    index_settings = {
        "mappings": {
            "properties": {
                "text": {  # (중요!) ES에 저장될 필드 이름은 'text'
                    "type": "text",
                    "analyzer": "nori"  # 한국어 형태소 분석기
                },
                "embedding": {
                    "type": "dense_vector",
                    "dims": 1024  # KURE-v1 벡터 차원
                },
                "source": {
                    "type": "keyword" # 필터링용 출처
                }
            }
        }
    }

    if not es.indices.exists(index=INDEX_NAME):
        print(f"'{INDEX_NAME}' 인덱스 생성 시도...")
        es.indices.create(index=INDEX_NAME, body=index_settings)
        print("인덱스 생성 완료.")
    else:
        print(f"'{INDEX_NAME}' 인덱스가 이미 존재함.")


def load_data():
    """DATA_FILES 목록의 JSON 파일 로드"""
    all_data = []
    for file_path in DATA_FILES:
        # 파일 존재 여부 확인
        if not os.path.exists(file_path):
            print(f"경고: {file_path} 파일을 찾을 수 없음. 건너뜀.")
            continue
            
        print(f"{file_path} 로드 중...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                all_data.extend(data) # 단일 리스트로 병합
        except Exception as e:
            print(f"파일 로드 오류: {e}")

    print(f"총 {len(all_data)}개 데이터 로드 완료.")
    return all_data

def generate_actions(data):
    """(!!! 핵심 수정 !!!) Elasticsearch Bulk API용 데이터 형식 생성 (yield)"""
    print("Bulk API 형식으로 데이터 변환...")
    
    # (!!! 수정됨 !!!) 'content' 키를 사용하고 'source' 키는 파일 구조에 맞게 처리
    for item in tqdm(data):
        # 1. 필수 키('content', 'embedding') 확인
        if 'content' not in item or 'embedding' not in item:
            print(f"경고: 데이터 형식 오류 (필수 키 'content' 또는 'embedding' 누락). 건너뜀.")
            continue
        
        # 2. 'source' 키 확인 (파일마다 구조가 다름)
        source_value = "unknown" # 기본값
        if 'source' in item:
            source_value = item['source']      # chunks_...json 파일용
        elif 'doc_type' in item:
            source_value = item['doc_type']  # legal_...json 파일용
            
        yield {
            "_index": INDEX_NAME,
            "_source": {
                "text": item["content"],     # JSON의 'content'를 ES의 'text' 필드로 매핑
                "embedding": item["embedding"],
                "source": source_value       # 찾은 'source' 또는 'doc_type' 값을 사용
            }
        }

def main():
    """메인 인덱싱 파이프라인 실행"""
    
    # 0. ES 연결 상태 확인
    # if not es.ping():
    #     print("Elasticsearch 연결 실패. Docker 및 localhost:9200 확인 필요.")
    #     return

    # 1. 인덱스 생성 (또는 확인)
    create_index()

    # 2. JSON 데이터 로드
    all_chunks = load_data()
    if not all_chunks:
        print("인덱싱할 데이터 없음. 종료.")
        return

    # 3. 데이터 인덱싱 (Bulk API)
    print("Elasticsearch 데이터 인덱싱 시작...")
    try:
        success, failed = helpers.bulk(
            es,
            generate_actions(all_chunks),
            chunk_size=500,  # 500개씩 묶어서 전송
            request_timeout=60
        )
        print("="*30)
        print(f"🎉 인덱싱 완료! 🎉")
        print(f"성공: {success}개")
        print(f"실패: {failed}개")
        print("="*30)
    except Exception as e:
        print(f"인덱싱 중 오류 발생: {e}")

if __name__ == "__main__":
    main()