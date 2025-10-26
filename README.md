# 고려대학교 산학캡스톤디자인

<div align="center">
<h1>Docscanner.ai</h1>
<p>근로계약서 자동 분석 AI 시스템</p>
</div>

> 개발기간: 2025.10 ~
>
> Built with Python, Next.js

## 프로젝트 개요

근로계약서의 위험 조항, 누락 항목, 불공정 조항을 자동으로 탐지하고 분석하는 AI 시스템입니다.

사용자가 업로드한 근로계약서를 자동으로 분석하여 법률 위반 가능성이 있는 조항을 하이라이트하고, 누락된 필수 항목을 체크하며, 각 조항에 대한 상세한 법적 근거와 설명을 제공합니다.

RAG(Retrieval Augmented Generation) 기술을 활용하여 최신 법률 정보와 판례를 기반으로 정확한 분석 결과를 제공하며, 일반 사용자도 쉽게 이해할 수 있도록 직관적인 인터페이스를 제공합니다.

## 주요 기능

### 계약서 자동 분석

- 위험 조항 자동 탐지 및 하이라이트
- 필수 항목 누락 체크
- 불공정 조항 식별
- 각 조항별 법적 근거 및 설명 제공

### RAG 기반 질의응답

- 계약서 내용에 대한 실시간 질의응답
- 관련 법령 및 판례 자동 검색
- 근로기준법, 채용절차법 등 법률 데이터베이스 기반

### 데이터 처리 파이프라인

- 5개 법률 문서 PDF 자동 추출 및 청킹
- KURE-v1 모델 기반 임베딩 생성 (674개 청크)
- 계약서 유형별 필수 필드 체크리스트 (5개 유형)

## 프로젝트 구조

```
docscanner-ai/
├── ai/                           # AI/ML 모듈
│   ├── data/                     # 데이터 저장소
│   │   ├── raw/                  # 원본 PDF 파일
│   │   └── processed/            # 처리된 데이터
│   │       ├── chunks/           # 청크 데이터 (674개)
│   │       ├── embeddings/       # 임베딩 벡터 (1024차원)
│   │       └── required_contract_fields.json
│   └── preprocessing/            # 전처리 스크립트
│       ├── pdf_extractor.py      # PDF 텍스트 추출
│       ├── chunker.py            # 문서 청킹
│       ├── embedder.py           # 임베딩 생성
│       └── test_embeddings.py    # 임베딩 테스트
├── backend/                      # 백엔드 API (개발 예정)
├── frontend/                     # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/                  # 페이지 라우팅
│   │   │   ├── upload/           # 계약서 업로드
│   │   │   ├── analysis/         # 분석 결과
│   │   │   ├── compare/          # 계약서 비교
│   │   │   └── contracts/        # 계약서 관리
│   │   └── components/           # React 컴포넌트
└── docs/                         # 프로젝트 문서
    ├── data-processing-pipeline.md
    └── project-structure.md
```

## 기술 스택

### AI/ML

- **임베딩 모델**: KURE-v1 (한국어 법률 문서 특화)
- **벡터 데이터베이스**: Elasticsearch
- **LLM**: Google Gemini 2.5 (Pro/Flash/Flash-lite)
- **프레임워크**: sentence-transformers, PyTorch

### 프론트엔드

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Radix UI 기반 커스텀 컴포넌트

### 백엔드

- **메인 서버**: NestJS
- **AI API**: FastAPI (Python)
- **데이터베이스**: PostgreSQL
- **검색 엔진**: Elasticsearch

### 데이터 소스

**현재 수집 완료**:
- 개정 표준근로계약서 (2025년)
- 채용절차의 공정화에 관한 법률 업무 매뉴얼
- 개정 표준취업규칙 (2025년)
- 2025년 적용 최저임금 안내
- 채용절차의 공정화에 관한 법률 리플릿

**추가 수집 예정** (open.law.go.kr API):
- 법령 정보
- 판례 데이터
- 법률 용어 사전

## 데이터 처리 파이프라인

### 1. PDF 텍스트 추출

```bash
cd ai/preprocessing
python pdf_extractor.py
```

- pdfplumber를 사용한 텍스트 추출
- 페이지별 구분 및 메타데이터 생성

### 2. 문서 청킹

```bash
python chunker.py
```

- 문서 유형별 청킹 전략 적용
- 총 674개 청크 생성 (manual: 296, employment_rules: 367, guide: 4, leaflet: 7)
- 자동 카테고리 분류 및 키워드 추출

### 3. 임베딩 생성

```bash
python embedder.py
```

- KURE-v1 모델 사용 (1024차원)
- 배치 크기: 8
- 소요 시간: 약 32초

### 4. 임베딩 테스트

```bash
python test_embeddings.py interactive  # 대화형 모드
python test_embeddings.py test         # 사전 정의 테스트
```

## 프로젝트 실행

### AI 전처리 파이프라인

```bash
# 가상환경 활성화 (Conda)
conda activate docscanner-py3.10

# 전처리 실행
cd ai/preprocessing
python pdf_extractor.py    # PDF 추출
python chunker.py          # 청킹
python embedder.py         # 임베딩 생성
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 백엔드

**NestJS 메인 서버**:
```bash
cd backend
npm install
npm run start:dev
```

**FastAPI AI 서버**:
```bash
cd ai
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

## 개발 환경

### 필수 요구사항

- Python 3.10
- Node.js 18 이상
- PostgreSQL 14 이상
- Elasticsearch 8.x
- Conda (권장)

### Python 패키지

```
pdfplumber==0.11.4
sentence-transformers==5.1.2
torch==2.9.0
transformers==4.57.1
numpy
tqdm
```

## 향후 개발 계획

### Phase 1 (현재)

- 데이터 수집 및 전처리 완료
- 청킹 및 임베딩 파이프라인 구축
- 프론트엔드 UI 기본 구조 완성

### Phase 2 (진행 예정)

- NestJS 백엔드 서버 구축
- FastAPI AI 엔드포인트 개발
- Elasticsearch 연동
- PostgreSQL 데이터베이스 설계
- 법률 정보 API 통합 (open.law.go.kr)
- Gemini 2.5 기반 RAG 엔진 구현

### Phase 3 (계획)

- 계약서 분석 엔진 완성
- 위험 조항 자동 탐지
- 누락 항목 체크 기능
- 불공정 조항 식별

### Phase 4 (계획)

- 사용자 인증 및 권한 관리
- 계약서 히스토리 관리
- PDF 보고서 생성
- 대시보드 및 통계 기능

## 참여자

| 강민선 (Minsun Kang)                                                                            | 이성민 (Seongmin Lee)                                                                           |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| <img src="https://avatars.githubusercontent.com/KangMinSun" width="160px" alt="Minsun Kang" /> | <img src="https://avatars.githubusercontent.com/danlee-dev" width="160px" alt="Seongmin Lee" /> |
| [GitHub: @KangMinSun](https://github.com/KangMinSun)                                           | [GitHub: @danlee-dev](https://github.com/danlee-dev)                                           |
| 고려대학교 컴퓨터학과                                                                           | 고려대학교 컴퓨터학과                                                                           |

## 라이선스

본 프로젝트는 교육 목적으로 개발되었습니다.

## 문의

프로젝트 관련 문의사항은 GitHub Issues를 통해 남겨주시기 바랍니다.

## 참고 자료

- [데이터 처리 파이프라인 문서](docs/data-processing-pipeline.md)
- [프로젝트 구조 문서](docs/project-structure.md)
