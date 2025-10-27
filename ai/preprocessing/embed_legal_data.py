"""
법률 데이터 임베딩 생성 스크립트

KURE-v1 모델을 사용하여 청킹된 법률 데이터를 임베딩합니다.
Elasticsearch 인덱싱을 위한 준비 단계입니다.
"""

import json
from pathlib import Path
from typing import List, Dict, Tuple
import numpy as np
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
from datetime import datetime


class LegalEmbedder:
    """법률 데이터 임베딩 생성기 (KURE-v1)"""

    def __init__(self, model_name: str = "nlpai-lab/KURE-v1", batch_size: int = 16):
        """
        Args:
            model_name: 임베딩 모델 (기본: KURE-v1 - 한국어 법률 특화)
            batch_size: 배치 크기 (메모리에 따라 조정)
        """
        print(f"\n임베딩 모델 로딩 중: {model_name}")
        print("KURE-v1은 한국어 법률 문서에 특화된 모델입니다.")

        self.model = SentenceTransformer(model_name)
        self.batch_size = batch_size

        # KURE-v1 최대 시퀀스 길이 설정
        self.model.max_seq_length = 512

        embedding_dim = self.model.get_sentence_embedding_dimension()
        print(f"모델 로딩 완료")
        print(f"  - 임베딩 차원: {embedding_dim}")
        print(f"  - 최대 시퀀스 길이: {self.model.max_seq_length}")
        print(f"  - 배치 크기: {batch_size}")

    def _prepare_text_for_embedding(self, chunk: Dict) -> str:
        """
        청크를 임베딩용 텍스트로 변환

        메타데이터를 포함하여 검색 성능을 향상시킵니다.
        """
        text = chunk['content']

        # 문서 타입 정보 추가
        doc_type_map = {
            'interpretation': '법령해석례',
            'precedent': '판례',
            'labor_ministry': '고용노동부 법령해설'
        }
        doc_type_kr = doc_type_map.get(chunk.get('doc_type', ''), '')
        if doc_type_kr:
            text = f"[{doc_type_kr}] {text}"

        # 검색 키워드 추가 (있는 경우)
        if chunk.get('search_keyword'):
            text = f"{text}\n관련 키워드: {chunk['search_keyword']}"

        return text

    def embed_legal_chunks(
        self,
        chunks_file: Path,
        output_dir: Path
    ) -> Tuple[List[Dict], np.ndarray]:
        """
        법률 청크 임베딩 생성

        Args:
            chunks_file: 청크 JSON 파일 경로
            output_dir: 출력 디렉토리

        Returns:
            (chunks, embeddings) 튜플
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        print("\n" + "="*70)
        print("법률 데이터 임베딩 생성")
        print("="*70)

        # 청크 로드
        print(f"\n청크 파일 로딩: {chunks_file.name}")
        with open(chunks_file, 'r', encoding='utf-8') as f:
            chunks = json.load(f)

        print(f"총 {len(chunks):,}개 청크 로딩 완료")

        # 문서 타입별 통계
        doc_type_counts = {}
        for chunk in chunks:
            doc_type = chunk.get('doc_type', 'unknown')
            doc_type_counts[doc_type] = doc_type_counts.get(doc_type, 0) + 1

        print("\n문서 타입별 청크 수:")
        for doc_type, count in sorted(doc_type_counts.items()):
            print(f"  - {doc_type}: {count:,}개")

        # 임베딩용 텍스트 준비
        print(f"\n임베딩용 텍스트 준비 중...")
        texts = []
        for chunk in tqdm(chunks, desc="텍스트 준비"):
            text = self._prepare_text_for_embedding(chunk)
            texts.append(text)

        # 임베딩 생성
        print(f"\n임베딩 생성 중... (배치 크기: {self.batch_size})")
        print(f"예상 소요 시간: 약 {len(chunks) // (self.batch_size * 10)}-{len(chunks) // (self.batch_size * 5)}분")

        embeddings = self.model.encode(
            texts,
            batch_size=self.batch_size,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=True  # Elasticsearch 코사인 유사도를 위해 정규화
        )

        print(f"\n임베딩 생성 완료: {embeddings.shape}")
        print(f"  - 청크 수: {embeddings.shape[0]:,}")
        print(f"  - 임베딩 차원: {embeddings.shape[1]}")

        # 청크에 임베딩 추가 (리스트로 저장)
        print("\n청크에 임베딩 추가 중...")
        for i, chunk in enumerate(tqdm(chunks, desc="임베딩 추가")):
            chunk['embedding'] = embeddings[i].tolist()

        # 저장
        timestamp = datetime.now().strftime('%Y%m%d')

        # 1. 임베딩 포함 전체 청크 저장 (JSON)
        output_file = output_dir / f"legal_chunks_with_embeddings_{timestamp}.json"
        print(f"\n임베딩 포함 청크 저장 중: {output_file.name}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)

        file_size = output_file.stat().st_size / 1024 / 1024
        print(f"  - 파일 크기: {file_size:.2f}MB")

        # 2. 임베딩만 따로 numpy 저장 (빠른 로딩용)
        embeddings_file = output_dir / f"legal_embeddings_{timestamp}.npy"
        np.save(embeddings_file, embeddings)
        print(f"\n임베딩 numpy 저장: {embeddings_file.name}")
        print(f"  - 파일 크기: {embeddings_file.stat().st_size / 1024 / 1024:.2f}MB")

        # 3. 메타데이터 저장
        metadata = {
            'created_at': datetime.now().isoformat(),
            'total_chunks': len(chunks),
            'embedding_dim': int(embeddings.shape[1]),
            'model_name': 'nlpai-lab/KURE-v1',
            'batch_size': self.batch_size,
            'normalized': True,
            'doc_type_counts': doc_type_counts,
            'files': {
                'chunks_with_embeddings': output_file.name,
                'embeddings_numpy': embeddings_file.name
            }
        }

        metadata_file = output_dir / f"legal_embeddings_metadata_{timestamp}.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        print(f"\n메타데이터 저장: {metadata_file.name}")

        # 요약
        print("\n" + "="*70)
        print("임베딩 완료 요약")
        print("="*70)
        print(f"총 청크 수:         {metadata['total_chunks']:,}개")
        print(f"임베딩 차원:        {metadata['embedding_dim']}")
        print(f"모델:               {metadata['model_name']}")
        print(f"정규화:             {metadata['normalized']}")
        print("-" * 70)
        print(f"JSON 파일:          {output_file.name} ({file_size:.2f}MB)")
        print(f"NumPy 파일:         {embeddings_file.name}")
        print(f"메타데이터:         {metadata_file.name}")
        print("="*70)

        return chunks, embeddings

    def test_similarity(
        self,
        chunks: List[Dict],
        embeddings: np.ndarray,
        query: str,
        top_k: int = 5,
        filter_doc_type: str = None
    ):
        """
        유사도 검색 테스트

        Args:
            chunks: 청크 리스트
            embeddings: 임베딩 배열
            query: 검색 쿼리
            top_k: 상위 k개 결과
            filter_doc_type: 문서 타입 필터 (optional)
        """
        print(f"\n{'='*70}")
        print(f"유사도 검색 테스트")
        print(f"{'='*70}")
        print(f"쿼리: {query}")
        if filter_doc_type:
            print(f"필터: doc_type={filter_doc_type}")

        # 쿼리 임베딩
        query_embedding = self.model.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]

        # 필터링 (옵션)
        if filter_doc_type:
            filtered_indices = [i for i, c in enumerate(chunks) if c.get('doc_type') == filter_doc_type]
            filtered_embeddings = embeddings[filtered_indices]
            filtered_chunks = [chunks[i] for i in filtered_indices]
        else:
            filtered_indices = list(range(len(chunks)))
            filtered_embeddings = embeddings
            filtered_chunks = chunks

        # 코사인 유사도 계산 (정규화된 벡터는 내적이 코사인 유사도)
        similarities = np.dot(filtered_embeddings, query_embedding)

        # 상위 k개 추출
        top_indices = np.argsort(similarities)[::-1][:top_k]

        print(f"\n상위 {top_k}개 결과:")
        for rank, idx in enumerate(top_indices, 1):
            chunk = filtered_chunks[idx]
            similarity = similarities[idx]

            print(f"\n{rank}. 유사도: {similarity:.4f}")
            print(f"   문서 타입: {chunk.get('doc_type', 'unknown')}")
            print(f"   청크 타입: {chunk.get('chunk_type', 'unknown')}")
            print(f"   제목: {chunk.get('title', 'unknown')[:60]}...")
            print(f"   사건번호: {chunk.get('case_number', 'N/A')}")
            print(f"   내용: {chunk['content'][:150].replace(chr(10), ' ')}...")


def main():
    """메인 실행 함수"""
    # 경로 설정
    project_root = Path(__file__).parent.parent

    timestamp = datetime.now().strftime('%Y%m%d')
    chunks_file = project_root / "data" / "processed" / "chunks" / f"legal_chunks_{timestamp}.json"
    output_dir = project_root / "data" / "processed" / "embeddings"

    if not chunks_file.exists():
        print(f"오류: 청크 파일이 없습니다: {chunks_file}")
        print("먼저 chunk_legal_data.py를 실행하세요.")
        return

    print(f"청크 파일: {chunks_file}")
    print(f"출력 디렉토리: {output_dir}")

    # 임베더 초기화
    embedder = LegalEmbedder(
        model_name="nlpai-lab/KURE-v1",
        batch_size=16  # M3 Mac 기준, 메모리에 따라 조정
    )

    # 임베딩 생성
    chunks, embeddings = embedder.embed_legal_chunks(chunks_file, output_dir)

    # 테스트 쿼리
    test_queries = [
        ("근로계약서에 수습기간 6개월 쓰면 문제 있나요?", None),
        ("최저임금 위반 시 벌칙은?", "labor_ministry"),
        ("기간제 근로계약 갱신 거절 가능한가요?", "precedent"),
        ("연차 휴가 미사용 수당은?", "interpretation"),
    ]

    print("\n" + "="*70)
    print("임베딩 성능 테스트")
    print("="*70)

    for query, doc_type_filter in test_queries:
        embedder.test_similarity(chunks, embeddings, query, top_k=3, filter_doc_type=doc_type_filter)
        print("\n" + "-"*70)

    print("\n임베딩 생성 완료!")
    print("다음 단계: Elasticsearch 인덱싱")


if __name__ == "__main__":
    main()
