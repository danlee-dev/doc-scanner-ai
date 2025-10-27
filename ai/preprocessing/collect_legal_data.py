"""
국가법령정보 Open API 데이터 수집 스크립트

근로계약서 분석을 위한 법률 데이터를 수집합니다:
- 법령해석례
- 판례
- 고용노동부 법령해설
- 노동위원회 판정례
- 현행법령
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime
from tqdm import tqdm
from typing import List, Dict, Optional


class LegalDataCollector:
    """법률 데이터 수집기"""

    def __init__(self, user_id: str, output_dir: Path):
        """
        Args:
            user_id: Open API 사용자 ID (이메일 @ 앞부분)
            output_dir: 데이터 저장 디렉토리
        """
        self.user_id = user_id
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.base_url = "http://www.law.go.kr/DRF/lawSearch.do"

        # 근로계약서 관련 검색 키워드
        self.keywords = [
            "근로계약",
            "근로기준법",
            "최저임금",
            "퇴직금",
            "연차",
            "해고",
            "임금",
            "근로시간",
            "휴게시간",
            "연장근로",
            "야간근로",
            "휴일근로",
            "연소근로자",
            "기간제",
            "단시간근로",
        ]

    def _request_api(self, params: Dict) -> Optional[Dict]:
        """API 요청"""
        try:
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API 요청 실패: {e}")
            return None

    def collect_interpretations(self, keywords: List[str] = None) -> List[Dict]:
        """법령해석례 수집"""
        print("\n=== 법령해석례 수집 시작 ===")

        if keywords is None:
            keywords = self.keywords

        all_data = []

        for keyword in keywords:
            print(f"\n키워드: '{keyword}' 검색 중...")

            # 첫 요청으로 총 개수 확인
            params = {
                "OC": self.user_id,
                "target": "expc",
                "type": "JSON",
                "query": keyword,
                "display": 100,
                "search": 2,  # 본문검색
                "page": 1,
            }

            data = self._request_api(params)
            if not data or 'totalCnt' not in data:
                print(f"  검색 결과 없음")
                continue

            total_cnt = int(data.get('totalCnt', 0))
            print(f"  총 {total_cnt}건 발견")

            if total_cnt == 0:
                continue

            # 페이지별 수집
            total_pages = (total_cnt // 100) + 1
            for page in tqdm(range(1, total_pages + 1), desc=f"  {keyword}"):
                params['page'] = page
                page_data = self._request_api(params)

                if not page_data or 'expc' not in page_data:
                    break

                items = page_data['expc']
                if not isinstance(items, list):
                    items = [items]

                for item in items:
                    item['검색키워드'] = keyword
                    item['수집일시'] = datetime.now().isoformat()
                    all_data.append(item)

                time.sleep(0.3)  # API 부하 방지

        print(f"\n총 {len(all_data)}건의 법령해석례 수집 완료")
        return all_data

    def collect_precedents(self, keywords: List[str] = None,
                          start_date: str = "20100101",
                          end_date: str = None) -> List[Dict]:
        """판례 수집"""
        print("\n=== 판례 수집 시작 ===")

        if keywords is None:
            keywords = self.keywords

        if end_date is None:
            end_date = datetime.now().strftime("%Y%m%d")

        all_data = []

        for keyword in keywords:
            print(f"\n키워드: '{keyword}' 검색 중...")

            params = {
                "OC": self.user_id,
                "target": "prec",
                "type": "JSON",
                "query": keyword,
                "display": 100,
                "search": 2,  # 본문검색
                "prncYd": f"{start_date}~{end_date}",
                "page": 1,
            }

            data = self._request_api(params)
            if not data or 'totalCnt' not in data:
                print(f"  검색 결과 없음")
                continue

            total_cnt = int(data.get('totalCnt', 0))
            print(f"  총 {total_cnt}건 발견")

            if total_cnt == 0:
                continue

            # 페이지별 수집
            total_pages = min((total_cnt // 100) + 1, 10)  # 최대 1000건
            for page in tqdm(range(1, total_pages + 1), desc=f"  {keyword}"):
                params['page'] = page
                page_data = self._request_api(params)

                if not page_data or 'prec' not in page_data:
                    break

                items = page_data['prec']
                if not isinstance(items, list):
                    items = [items]

                for item in items:
                    item['검색키워드'] = keyword
                    item['수집일시'] = datetime.now().isoformat()
                    all_data.append(item)

                time.sleep(0.3)

        print(f"\n총 {len(all_data)}건의 판례 수집 완료")
        return all_data

    def collect_labor_ministry_interpretations(self) -> List[Dict]:
        """고용노동부 법령해설 수집"""
        print("\n=== 고용노동부 법령해설 수집 시작 ===")

        all_data = []

        for keyword in self.keywords:
            print(f"\n키워드: '{keyword}' 검색 중...")

            params = {
                "OC": self.user_id,
                "target": "moel",  # 고용노동부
                "type": "JSON",
                "query": keyword,
                "display": 100,
                "search": 2,
                "page": 1,
            }

            data = self._request_api(params)
            if not data or 'totalCnt' not in data:
                print(f"  검색 결과 없음")
                continue

            total_cnt = int(data.get('totalCnt', 0))
            print(f"  총 {total_cnt}건 발견")

            if total_cnt == 0:
                continue

            total_pages = (total_cnt // 100) + 1
            for page in tqdm(range(1, total_pages + 1), desc=f"  {keyword}"):
                params['page'] = page
                page_data = self._request_api(params)

                if not page_data or 'moel' not in page_data:
                    break

                items = page_data['moel']
                if not isinstance(items, list):
                    items = [items]

                for item in items:
                    item['검색키워드'] = keyword
                    item['수집일시'] = datetime.now().isoformat()
                    all_data.append(item)

                time.sleep(0.3)

        print(f"\n총 {len(all_data)}건의 고용노동부 법령해설 수집 완료")
        return all_data

    def collect_labor_commission(self) -> List[Dict]:
        """노동위원회 판정례 수집"""
        print("\n=== 노동위원회 판정례 수집 시작 ===")

        all_data = []

        for keyword in self.keywords:
            print(f"\n키워드: '{keyword}' 검색 중...")

            params = {
                "OC": self.user_id,
                "target": "lwrc",  # 노동위원회
                "type": "JSON",
                "query": keyword,
                "display": 100,
                "search": 2,
                "page": 1,
            }

            data = self._request_api(params)
            if not data or 'totalCnt' not in data:
                print(f"  검색 결과 없음")
                continue

            total_cnt = int(data.get('totalCnt', 0))
            print(f"  총 {total_cnt}건 발견")

            if total_cnt == 0:
                continue

            total_pages = (total_cnt // 100) + 1
            for page in tqdm(range(1, total_pages + 1), desc=f"  {keyword}"):
                params['page'] = page
                page_data = self._request_api(params)

                if not page_data or 'lwrc' not in page_data:
                    break

                items = page_data['lwrc']
                if not isinstance(items, list):
                    items = [items]

                for item in items:
                    item['검색키워드'] = keyword
                    item['수집일시'] = datetime.now().isoformat()
                    all_data.append(item)

                time.sleep(0.3)

        print(f"\n총 {len(all_data)}건의 노동위원회 판정례 수집 완료")
        return all_data

    def save_data(self, data: List[Dict], filename: str):
        """데이터 저장"""
        if not data:
            print(f"{filename}: 저장할 데이터 없음")
            return

        filepath = self.output_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"저장 완료: {filepath} ({len(data)}건)")

    def collect_all(self):
        """모든 데이터 수집 및 저장"""
        print("\n" + "="*60)
        print("국가법령정보 Open API 데이터 수집 시작")
        print(f"사용자 ID: {self.user_id}")
        print(f"저장 경로: {self.output_dir}")
        print("="*60)

        # 1. 법령해석례
        interpretations = self.collect_interpretations()
        self.save_data(
            interpretations,
            f"interpretations_{datetime.now().strftime('%Y%m%d')}.json"
        )

        # 2. 판례
        precedents = self.collect_precedents()
        self.save_data(
            precedents,
            f"precedents_{datetime.now().strftime('%Y%m%d')}.json"
        )

        # 3. 고용노동부 법령해설
        labor_ministry = self.collect_labor_ministry_interpretations()
        self.save_data(
            labor_ministry,
            f"labor_ministry_{datetime.now().strftime('%Y%m%d')}.json"
        )

        # 4. 노동위원회
        labor_commission = self.collect_labor_commission()
        self.save_data(
            labor_commission,
            f"labor_commission_{datetime.now().strftime('%Y%m%d')}.json"
        )

        # 요약 통계
        print("\n" + "="*60)
        print("수집 완료 요약")
        print("="*60)
        print(f"법령해석례:          {len(interpretations):>6}건")
        print(f"판례:                {len(precedents):>6}건")
        print(f"고용노동부 법령해설: {len(labor_ministry):>6}건")
        print(f"노동위원회 판정례:   {len(labor_commission):>6}건")
        print(f"총합:                {len(interpretations) + len(precedents) + len(labor_ministry) + len(labor_commission):>6}건")
        print("="*60)


def main():
    """메인 실행 함수"""
    import os
    from dotenv import load_dotenv

    # 환경 변수 로드
    load_dotenv()

    # API 사용자 ID (환경 변수에서 읽기)
    user_id = os.getenv('LEGAL_API_USER_ID')

    if not user_id:
        print("오류: LEGAL_API_USER_ID 환경 변수를 설정해주세요.")
        print("사용법: .env 파일에 다음을 추가")
        print("LEGAL_API_USER_ID=your_email_id")
        return

    # 출력 디렉토리 설정
    project_root = Path(__file__).parent.parent
    output_dir = project_root / "data" / "raw" / "api"

    # 데이터 수집 실행
    collector = LegalDataCollector(user_id, output_dir)
    collector.collect_all()


if __name__ == "__main__":
    main()
