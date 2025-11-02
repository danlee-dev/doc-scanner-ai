# Development Troubleshooting Guide

프로젝트 개발 중 발생한 문제와 해결 방법을 정리한 문서입니다.

## 구조

- [Frontend Troubleshooting](./frontend/troubleshooting.md) - 프론트엔드 관련 이슈
- [Backend Troubleshooting](./backend/troubleshooting.md) - 백엔드 관련 이슈
- [AI/ML Troubleshooting](./ai/troubleshooting.md) - AI/ML 관련 이슈

## 작성 가이드

### 새로운 이슈 추가 시

1. 해당 영역의 `troubleshooting.md` 파일 열기
2. 맨 위에 최신 이슈 추가 (날짜 역순)
3. 다음 형식 사용:

```markdown
## [카테고리] 문제 제목

**발생 날짜**: YYYY-MM-DD
**작성자**: 이름

### 문제 상황
상황 설명 및 스크린샷

### 원인
근본 원인 분석

### 해결 방법
적용한 해결 방법 및 코드

### 교훈
향후 방지 방법 및 베스트 프랙티스
```

## 검색 팁

- 전체 검색: `grep -r "키워드" docs/development/`
- 특정 영역: 해당 폴더의 `troubleshooting.md` 파일에서 Ctrl+F

## 참고

- 이슈가 해결되어도 문서는 삭제하지 않음
- 유사한 문제 재발 시 참고용으로 유지
