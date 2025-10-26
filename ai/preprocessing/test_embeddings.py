import json
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer


class EmbeddingTester:
    def __init__(self, embeddings_dir: str):
        self.embeddings_dir = Path(embeddings_dir)

        # 데이터 로드
        print("데이터 로딩 중...")
        with open(self.embeddings_dir / "chunks_with_embeddings.json", 'r', encoding='utf-8') as f:
            self.chunks = json.load(f)

        self.embeddings = np.array([chunk['embedding'] for chunk in self.chunks])

        # 모델 로드
        print("KURE 모델 로딩 중...")
        self.model = SentenceTransformer("nlpai-lab/KURE-v1")

        print(f"로딩 완료: {len(self.chunks)}개 청크")

    def search(self, query: str, top_k: int = 5, filters: dict = None):
        """
        쿼리로 유사한 청크 검색

        Args:
            query: 검색 쿼리
            top_k: 상위 몇 개 결과 반환
            filters: 필터 조건 (예: {"category": "근로시간", "doc_type": "standard_contract"})
        """
        print(f"\n{'='*80}")
        print(f"🔍 쿼리: {query}")
        print(f"{'='*80}")

        # 쿼리 임베딩
        query_embedding = self.model.encode([query], convert_to_numpy=True)[0]

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

            print(f"📌 필터: {filters}")
            print(f"   필터 적용 후: {len(filtered_indices)}개 청크")

            if len(filtered_indices) == 0:
                print("⚠️  필터 조건에 맞는 청크가 없습니다.")
                return []

            filtered_embeddings = self.embeddings[filtered_indices]
            filtered_chunks = [self.chunks[i] for i in filtered_indices]
        else:
            filtered_embeddings = self.embeddings
            filtered_chunks = self.chunks

        # 코사인 유사도 계산
        similarities = np.dot(filtered_embeddings, query_embedding) / (
            np.linalg.norm(filtered_embeddings, axis=1) * np.linalg.norm(query_embedding)
        )

        # 상위 k개 추출
        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        print(f"\n📊 상위 {top_k}개 결과:\n")

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
            print(f"{rank}. 유사도: {similarity:.4f} {'🔥' if similarity > 0.7 else '✓' if similarity > 0.6 else ''}")
            print(f"   📄 문서: {chunk.get('source', 'unknown')}")
            print(f"   🏷️  카테고리: {chunk.get('category', 'unknown')}")

            if chunk.get('doc_type'):
                print(f"   📝 타입: {chunk['doc_type']}")

            if chunk.get('keywords'):
                keywords = ", ".join(chunk['keywords'][:3])
                print(f"   🔖 키워드: {keywords}")

            # 내용 미리보기
            content = chunk['content'].replace('\n', ' ')[:150]
            print(f"   💬 내용: {content}...")
            print()

        return results

    def interactive_mode(self):
        """대화형 검색 모드"""
        print("\n" + "="*80)
        print("🤖 임베딩 검색 테스트 (대화형 모드)")
        print("="*80)
        print("사용법:")
        print("  - 쿼리 입력: 검색하고 싶은 내용 입력")
        print("  - 필터링: filter:category=근로시간 형태로 입력")
        print("  - 종료: 'q' 또는 'exit' 입력")
        print("="*80 + "\n")

        while True:
            try:
                query = input("🔍 검색 쿼리: ").strip()

                if query.lower() in ['q', 'exit', 'quit', '종료']:
                    print("종료합니다.")
                    break

                if not query:
                    continue

                # 필터 파싱
                filters = {}
                if "filter:" in query:
                    parts = query.split("filter:")
                    query = parts[0].strip()
                    filter_str = parts[1].strip()

                    for f in filter_str.split(","):
                        if "=" in f:
                            key, value = f.split("=", 1)
                            filters[key.strip()] = value.strip()

                # 검색 실행
                self.search(query, top_k=5, filters=filters if filters else None)

            except KeyboardInterrupt:
                print("\n종료합니다.")
                break
            except Exception as e:
                print(f"에러: {e}")

    def run_preset_tests(self):
        """미리 정의된 테스트 쿼리 실행"""
        test_cases = [
            {
                "query": "근로시간은 하루에 몇 시간까지 가능한가요?",
                "filters": None
            },
            {
                "query": "최저임금 2025년",
                "filters": {"category": "임금"}
            },
            {
                "query": "연차 휴가 계산 방법",
                "filters": None
            },
            {
                "query": "채용 시 개인정보 수집",
                "filters": {"doc_type": "manual"}
            },
            {
                "query": "징계 절차",
                "filters": {"category": "상벌"}
            },
            {
                "query": "주 52시간",
                "filters": {"doc_type": "employment_rules"}
            }
        ]

        print("\n" + "="*80)
        print("🧪 사전 정의된 테스트 케이스 실행")
        print("="*80)

        for i, test in enumerate(test_cases, 1):
            print(f"\n[테스트 {i}/{len(test_cases)}]")
            self.search(test["query"], top_k=3, filters=test.get("filters"))

            if i < len(test_cases):
                input("\n⏸️  다음 테스트로 넘어가려면 Enter를 누르세요...")


if __name__ == "__main__":
    import sys

    project_root = Path(__file__).parent.parent.parent
    embeddings_dir = project_root / "ai/data/processed/embeddings"

    tester = EmbeddingTester(str(embeddings_dir))

    # 명령줄 인자 확인
    if len(sys.argv) > 1:
        mode = sys.argv[1]

        if mode == "interactive" or mode == "i":
            # 대화형 모드
            tester.interactive_mode()

        elif mode == "test" or mode == "t":
            # 사전 정의 테스트
            tester.run_preset_tests()

        else:
            # 직접 쿼리
            query = " ".join(sys.argv[1:])
            tester.search(query, top_k=5)

    else:
        # 기본: 대화형 모드
        print("\n사용법:")
        print("  python test_embeddings.py interactive  # 대화형 모드")
        print("  python test_embeddings.py test         # 사전 정의 테스트")
        print("  python test_embeddings.py 근로시간     # 직접 쿼리")
        print()

        choice = input("모드 선택 [1: 대화형, 2: 테스트, Enter: 대화형]: ").strip()

        if choice == "2":
            tester.run_preset_tests()
        elif choice in ["3", "q", "exit"]:
            print("종료합니다.")
        else:
            # 기본값: 대화형 모드
            tester.interactive_mode()
