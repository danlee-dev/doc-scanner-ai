import json
from pathlib import Path
from typing import List, Dict
import numpy as np
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import pickle


class DocumentEmbedder:
    def __init__(self, model_name: str = "nlpai-lab/KURE-v1", batch_size: int = 32):
        """
        Args:
            model_name: 사용할 임베딩 모델 (기본: KURE-v1)
            batch_size: 배치 크기
        """
        print(f"임베딩 모델 로딩 중: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.batch_size = batch_size
        print(f"모델 로딩 완료 (차원: {self.model.get_sentence_embedding_dimension()})")

    def embed_chunks(self, chunks_file: Path, output_dir: Path):
        """청크 파일을 읽어서 임베딩 생성"""
        output_dir.mkdir(parents=True, exist_ok=True)

        # 청크 로드
        print(f"\n청크 파일 로딩: {chunks_file}")
        with open(chunks_file, 'r', encoding='utf-8') as f:
            chunks = json.load(f)

        print(f"총 {len(chunks)}개 청크 로딩 완료")

        # 임베딩할 텍스트 추출
        texts = []
        for chunk in chunks:
            # content를 기본으로, 추가 컨텍스트 포함
            text = chunk['content']

            # 메타데이터를 텍스트에 추가 (검색 성능 향상)
            if chunk.get('category'):
                text = f"[{chunk['category']}] {text}"

            if chunk.get('keywords'):
                keywords_str = ", ".join(chunk['keywords'][:3])  # 상위 3개 키워드만
                if keywords_str:
                    text = f"{text}\n키워드: {keywords_str}"

            texts.append(text)

        # 임베딩 생성
        print(f"\n임베딩 생성 중... (배치 크기: {self.batch_size})")
        # 최대 시퀀스 길이 제한 (메모리 절약)
        self.model.max_seq_length = 512  # KURE 모델 최대 길이

        embeddings = self.model.encode(
            texts,
            batch_size=self.batch_size,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=False
        )

        print(f"임베딩 생성 완료: {embeddings.shape}")

        # 청크에 임베딩 추가
        for i, chunk in enumerate(chunks):
            chunk['embedding'] = embeddings[i].tolist()

        # 저장
        output_file = output_dir / "chunks_with_embeddings.json"
        print(f"\n임베딩 포함 청크 저장 중: {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)

        # 임베딩만 따로 numpy 파일로도 저장 (빠른 로딩용)
        embeddings_file = output_dir / "embeddings.npy"
        np.save(embeddings_file, embeddings)
        print(f"임베딩 numpy 저장: {embeddings_file}")

        # 메타데이터 저장
        metadata = {
            "total_chunks": len(chunks),
            "embedding_dim": embeddings.shape[1],
            "model_name": self.model._modules['0'].auto_model.config._name_or_path,
            "batch_size": self.batch_size
        }

        metadata_file = output_dir / "embedding_metadata.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        print(f"\n=== 임베딩 완료 ===")
        print(f"총 청크 수: {metadata['total_chunks']}")
        print(f"임베딩 차원: {metadata['embedding_dim']}")

        return chunks, embeddings

    def test_similarity(self, chunks: List[Dict], embeddings: np.ndarray, query: str, top_k: int = 5):
        """테스트: 쿼리와 유사한 청크 검색"""
        print(f"\n=== 유사도 테스트 ===")
        print(f"쿼리: {query}")

        # 쿼리 임베딩
        query_embedding = self.model.encode([query], convert_to_numpy=True)[0]

        # 코사인 유사도 계산
        similarities = np.dot(embeddings, query_embedding) / (
            np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query_embedding)
        )

        # 상위 k개 추출
        top_indices = np.argsort(similarities)[::-1][:top_k]

        print(f"\n상위 {top_k}개 결과:")
        for i, idx in enumerate(top_indices, 1):
            chunk = chunks[idx]
            similarity = similarities[idx]

            print(f"\n{i}. 유사도: {similarity:.4f}")
            print(f"   문서: {chunk.get('source', 'unknown')}")
            print(f"   카테고리: {chunk.get('category', 'unknown')}")
            print(f"   내용: {chunk['content'][:100]}...")


if __name__ == "__main__":
    # 경로 설정
    project_root = Path(__file__).parent.parent.parent
    chunks_file = project_root / "ai/data/processed/chunks/all_chunks.json"
    output_dir = project_root / "ai/data/processed/embeddings"

    print(f"프로젝트 루트: {project_root}")
    print(f"청크 파일: {chunks_file}")
    print(f"출력 디렉토리: {output_dir}")

    # 임베더 초기화
    embedder = DocumentEmbedder(
        model_name="nlpai-lab/KURE-v1",
        batch_size=8  # 메모리 절약을 위해 배치 크기 감소
    )

    # 임베딩 생성
    chunks, embeddings = embedder.embed_chunks(chunks_file, output_dir)

    # 테스트 쿼리
    test_queries = [
        "근로시간은 하루에 몇 시간까지 가능한가요?",
        "최저임금은 얼마인가요?",
        "연차 휴가는 어떻게 계산하나요?",
        "채용 시 개인정보를 요구할 수 있나요?"
    ]

    print("\n" + "="*60)
    print("임베딩 성능 테스트")
    print("="*60)

    for query in test_queries:
        embedder.test_similarity(chunks, embeddings, query, top_k=3)
        print("\n" + "-"*60)
