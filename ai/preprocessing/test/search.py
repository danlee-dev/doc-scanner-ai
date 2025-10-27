import json
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer
from datetime import datetime


class EmbeddingTester:
    def __init__(self, embeddings_dir: str, load_legal: bool = True):
        self.embeddings_dir = Path(embeddings_dir)
        self.chunks = []
        self.embeddings = None

        # PDF 데이터 로드
        pdf_file = self.embeddings_dir / "chunks_with_embeddings.json"
        if pdf_file.exists():
            print(f"PDF 데이터 로딩: {pdf_file.name}")
            with open(pdf_file, 'r', encoding='utf-8') as f:
                pdf_chunks = json.load(f)

            # source_type 메타데이터 추가
            for chunk in pdf_chunks:
                chunk['source_type'] = 'pdf'

            self.chunks.extend(pdf_chunks)
            print(f"  - PDF 청크: {len(pdf_chunks):,}개")

        # 법률 데이터 로드
        if load_legal:
            # 가장 최신 법률 데이터 파일 찾기
            legal_files = sorted(self.embeddings_dir.glob("legal_chunks_with_embeddings_*.json"))

            if legal_files:
                legal_file = legal_files[-1]  # 가장 최신 파일
                print(f"법률 데이터 로딩: {legal_file.name}")
                with open(legal_file, 'r', encoding='utf-8') as f:
                    legal_chunks = json.load(f)

                # source_type 메타데이터 추가
                for chunk in legal_chunks:
                    chunk['source_type'] = 'legal'

                self.chunks.extend(legal_chunks)
                print(f"  - 법률 청크: {len(legal_chunks):,}개")

        if not self.chunks:
            raise FileNotFoundError("청크 파일을 찾을 수 없습니다.")

        # 임베딩 추출
        self.embeddings = np.array([chunk['embedding'] for chunk in self.chunks])

        # 모델 로드
        print("KURE-v1 모델 로딩...")
        self.model = SentenceTransformer("nlpai-lab/KURE-v1")
        self.model.max_seq_length = 512

        print(f"\n검색 시스템 준비 완료: {len(self.chunks):,}개 청크")

    def search(self, query: str, top_k: int = 5, filters: dict = None):
        """
        쿼리로 유사한 청크 검색

        Args:
            query: 검색 쿼리
            top_k: 상위 몇 개 결과 반환
            filters: 필터 조건
                - source_type: 'pdf' 또는 'legal'
                - doc_type: PDF용 또는 법률 문서 타입
                - category: PDF 카테고리
        """
        print(f"\n{'='*70}")
        print(f"검색 쿼리: {query}")
        print(f"{'='*70}")

        # 쿼리 임베딩 (정규화 포함)
        query_embedding = self.model.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]

        # 필터링
        if filters:
            filtered_indices = []
            for i, chunk in enumerate(self.chunks):
                match = True
                for key, value in filters.items():
                    if chunk.get(key) != value:
                        match = False
                        break
                if match:
                    filtered_indices.append(i)

            print(f"필터: {filters}")
            print(f"필터 적용 후: {len(filtered_indices):,}개 청크")

            if len(filtered_indices) == 0:
                print("필터 조건에 맞는 청크가 없습니다.")
                return []

            filtered_embeddings = self.embeddings[filtered_indices]
            filtered_chunks = [self.chunks[i] for i in filtered_indices]
        else:
            filtered_embeddings = self.embeddings
            filtered_chunks = self.chunks

        # 코사인 유사도 계산 (정규화된 벡터는 내적이 코사인 유사도)
        # 기존 임베딩도 정규화
        filtered_embeddings_norm = filtered_embeddings / np.linalg.norm(filtered_embeddings, axis=1, keepdims=True)
        similarities = np.dot(filtered_embeddings_norm, query_embedding)

        # 상위 k개 추출
        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        print(f"\n상위 {top_k}개 결과:\n")

        for rank, idx in enumerate(top_indices, 1):
            chunk = filtered_chunks[idx]
            similarity = similarities[idx]

            result = {
                "rank": rank,
                "similarity": float(similarity),
                "chunk": chunk
            }
            results.append(result)

            # 출력
            print(f"{rank}. 유사도: {similarity:.4f}")
            print(f"   데이터 타입: {chunk.get('source_type', 'unknown')}")

            # PDF 데이터 메타데이터
            if chunk.get('source_type') == 'pdf':
                print(f"   문서: {chunk.get('source', 'unknown')}")
                print(f"   카테고리: {chunk.get('category', 'unknown')}")
                if chunk.get('doc_type'):
                    print(f"   타입: {chunk['doc_type']}")
                if chunk.get('keywords'):
                    keywords = ", ".join(chunk['keywords'][:3])
                    print(f"   키워드: {keywords}")

            # 법률 데이터 메타데이터
            elif chunk.get('source_type') == 'legal':
                doc_type_map = {
                    'interpretation': '법령해석례',
                    'precedent': '판례',
                    'labor_ministry': '고용노동부'
                }
                print(f"   문서 타입: {doc_type_map.get(chunk.get('doc_type'), chunk.get('doc_type', 'unknown'))}")
                print(f"   청크 타입: {chunk.get('chunk_type', 'unknown')}")
                if chunk.get('title'):
                    print(f"   제목: {chunk.get('title', '')[:60]}...")
                if chunk.get('case_number'):
                    print(f"   사건번호: {chunk.get('case_number')}")
                if chunk.get('date'):
                    print(f"   날짜: {chunk.get('date')}")

            # 내용 미리보기
            content = chunk['content'].replace('\n', ' ')[:200]
            print(f"   내용: {content}...")
            print()

        return results

    def interactive_mode(self):
        """대화형 검색 모드"""
        print("\n" + "="*70)
        print("임베딩 검색 테스트 (대화형 모드)")
        print("="*70)
        print("\n사용법:")
        print("  - 검색: 쿼리 입력")
        print("  - 필터: @필터명 추가 (예: 최저임금 @legal)")
        print("  - 상위 결과: #숫자 추가 (예: 연차 #10)")
        print("  - 종료: 'q' 또는 'exit' 입력")
        print("\n사용 가능한 필터:")
        print("  - @pdf: PDF 문서만")
        print("  - @legal: 법률 데이터만")
        print("  - @interpretation: 법령해석례만")
        print("  - @precedent: 판례만")
        print("  - @labor_ministry: 고용노동부만")
        print("="*70 + "\n")

        while True:
            try:
                user_input = input("검색 쿼리: ").strip()

                if user_input.lower() in ['q', 'exit', 'quit', '종료']:
                    print("\n검색 종료")
                    break

                if not user_input:
                    continue

                # 파라미터 파싱
                query = user_input
                filters = {}
                top_k = 5

                # @ 필터 파싱
                if '@' in user_input:
                    parts = user_input.split('@')
                    query = parts[0].strip()
                    filter_str = parts[1].strip().split()[0]

                    # 필터 매핑
                    if filter_str == 'pdf':
                        filters['source_type'] = 'pdf'
                    elif filter_str == 'legal':
                        filters['source_type'] = 'legal'
                    elif filter_str in ['interpretation', 'precedent', 'labor_ministry']:
                        filters['source_type'] = 'legal'
                        filters['doc_type'] = filter_str
                    else:
                        print(f"알 수 없는 필터: {filter_str}\n")
                        continue

                # # top_k 파싱
                if '#' in query:
                    parts = query.split('#')
                    query = parts[0].strip()
                    try:
                        top_k = int(parts[1].strip().split()[0])
                        top_k = min(max(top_k, 1), 20)
                    except ValueError:
                        print("잘못된 숫자 형식\n")
                        continue

                # 검색 실행
                self.search(query, top_k=top_k, filters=filters if filters else None)

            except KeyboardInterrupt:
                print("\n\n검색 종료")
                break
            except Exception as e:
                print(f"에러: {e}\n")

    def run_preset_tests(self):
        """미리 정의된 테스트 쿼리 실행"""
        test_cases = [
            # 통합 검색
            {
                "name": "통합 검색 - 근로시간",
                "query": "근로시간은 하루에 몇 시간까지 가능한가요?",
                "filters": None
            },
            {
                "name": "통합 검색 - 연차 계산",
                "query": "연차 휴가 계산 방법",
                "filters": None
            },
            # PDF 전용
            {
                "name": "PDF 검색 - 최저임금",
                "query": "최저임금 2025년",
                "filters": {"source_type": "pdf", "category": "임금"}
            },
            {
                "name": "PDF 검색 - 채용 절차",
                "query": "채용 시 개인정보 수집",
                "filters": {"source_type": "pdf"}
            },
            # 법률 데이터 전용
            {
                "name": "법률 검색 - 수습기간",
                "query": "수습기간 3개월 초과하면?",
                "filters": {"source_type": "legal"}
            },
            {
                "name": "판례 검색 - 기간제 계약",
                "query": "기간제 근로계약 갱신 거절",
                "filters": {"source_type": "legal", "doc_type": "precedent"}
            },
            {
                "name": "고용노동부 검색 - 최저임금 위반",
                "query": "최저임금 위반 벌칙",
                "filters": {"source_type": "legal", "doc_type": "labor_ministry"}
            },
            {
                "name": "법령해석례 검색 - 퇴직금",
                "query": "퇴직금 지급 시기",
                "filters": {"source_type": "legal", "doc_type": "interpretation"}
            }
        ]

        print("\n" + "="*70)
        print("사전 정의된 테스트 케이스 실행")
        print("="*70)

        for i, test in enumerate(test_cases, 1):
            print(f"\n[테스트 {i}/{len(test_cases)}] {test['name']}")
            self.search(test["query"], top_k=3, filters=test.get("filters"))

            if i < len(test_cases):
                input("\n다음 테스트로 넘어가려면 Enter를 누르세요...")


if __name__ == "__main__":
    import sys

    project_root = Path(__file__).parent.parent.parent
    embeddings_dir = project_root / "data" / "processed" / "embeddings"

    print("\n" + "="*70)
    print("통합 임베딩 검색 테스트")
    print("="*70)
    print("\n데이터 로딩 중...\n")

    tester = EmbeddingTester(str(embeddings_dir), load_legal=True)

    # 명령줄 인자 확인
    if len(sys.argv) > 1:
        mode = sys.argv[1]

        if mode in ["interactive", "i"]:
            tester.interactive_mode()

        elif mode in ["test", "t"]:
            tester.run_preset_tests()

        else:
            # 직접 쿼리
            query = " ".join(sys.argv[1:])
            tester.search(query, top_k=5)

    else:
        # 메뉴
        print("\n검색 모드 선택:")
        print("  1. 대화형 검색")
        print("  2. 사전 정의된 테스트 실행")
        print("  3. 종료")

        choice = input("\n선택 (1/2/3): ").strip()

        if choice == "1":
            tester.interactive_mode()
        elif choice == "2":
            tester.run_preset_tests()
        else:
            print("검색 종료")
