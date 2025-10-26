'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Share,
  ArrowLeft,
  FileText,
  Scale,
  MessageSquare,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building
} from "lucide-react"

interface AnalysisContentProps {
  contractId: string
}

const mockAnalysisData = {
  contractInfo: {
    name: "프리랜서 용역 계약서",
    type: "프리랜서 계약",
    uploadDate: "2024.10.12",
    fileSize: "245KB",
    status: "분석 완료"
  },
  riskSummary: {
    overall: "중간",
    totalRisks: 5,
    highRisks: 1,
    mediumRisks: 2,
    lowRisks: 2
  },
  keyInfo: {
    contractPeriod: "2024.10.15 ~ 2025.04.15",
    totalAmount: "15,000,000원",
    paymentDate: "매월 말일",
    workScope: "웹 애플리케이션 개발",
    contractor: "김개발",
    client: "(주)테크스타트업"
  },
  riskAnalysis: [
    {
      id: 1,
      title: "불명확한 업무 범위 정의",
      level: "높음",
      description: "계약서 제3조에서 업무 범위가 '웹 애플리케이션 개발 및 기타 관련 업무'로 모호하게 기재되어 있습니다.",
      impact: "업무 범위 확대로 인한 무료 추가 작업 요구 가능성",
      recommendation: "구체적인 업무 목록과 범위를 명시하고, 추가 업무 시 별도 계약 조항 추가",
      clause: "제3조 (업무의 내용)",
      riskColor: "bg-red-100 text-red-800"
    },
    {
      id: 2,
      title: "일방적인 계약 해지 조항",
      level: "중간",
      description: "갑(클라이언트)이 30일 전 통보로 일방적 계약 해지 가능하나, 을(프리랜서)의 해지 조건이 불리합니다.",
      impact: "갑작스러운 계약 종료로 인한 소득 불안정",
      recommendation: "상호 동등한 해지 조건으로 수정하거나, 위약금 조항 추가",
      clause: "제8조 (계약의 해지)",
      riskColor: "bg-yellow-100 text-yellow-800"
    },
    {
      id: 3,
      title: "지적재산권 귀속 조항",
      level: "중간",
      description: "개발 결과물의 모든 지적재산권이 클라이언트에게 귀속되도록 규정되어 있습니다.",
      impact: "향후 포트폴리오 활용 제한 및 재사용 불가",
      recommendation: "포트폴리오 활용권 또는 부분적 지적재산권 보장 요구",
      clause: "제5조 (지적재산권)",
      riskColor: "bg-yellow-100 text-yellow-800"
    }
  ],
  negotiationStrategies: [
    {
      riskId: 1,
      title: "업무 범위 명확화 협상",
      strategy: "구체적인 업무 목록 작성 요구",
      alternatives: [
        "웹 애플리케이션의 기능별 상세 명세서 첨부",
        "추가 업무 발생 시 시간당 요금 별도 산정 조항 추가",
        "업무 범위 변경 시 서면 합의 원칙 명시"
      ],
      expectedResponse: "클라이언트가 유연성을 원할 수 있음",
      counterArgument: "명확한 범위 정의가 양측 모두에게 분쟁 예방에 도움된다고 강조"
    },
    {
      riskId: 2,
      title: "계약 해지 조건 균형 맞추기",
      strategy: "상호 동등한 해지 조건 제안",
      alternatives: [
        "양측 모두 30일 전 통보로 해지 가능하도록 수정",
        "프로젝트 중간 해지 시 기 수행 업무에 대한 정산 조항 추가",
        "3개월 미만 해지 시 위약금 조항 추가"
      ],
      expectedResponse: "기존 조건 유지 요구 가능성",
      counterArgument: "안정적인 업무 환경이 더 나은 결과물 창출에 기여한다고 설명"
    }
  ],
  comparisonWithStandard: {
    governmentStandard: "중소벤처기업부 표준 용역계약서",
    differences: [
      {
        clause: "업무 범위",
        current: "모호한 표현 사용",
        standard: "구체적 업무 목록 명시",
        recommendation: "표준안 적용 권장"
      },
      {
        clause: "지급 조건",
        current: "매월 말일 지급",
        standard: "매월 말일 지급",
        recommendation: "표준안과 일치"
      },
      {
        clause: "손해배상",
        current: "고의/중과실 시에만 배상",
        standard: "고의/중과실 시에만 배상",
        recommendation: "표준안과 일치"
      }
    ]
  }
}

export function AnalysisContent({ contractId }: AnalysisContentProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getRiskColor = (level: string) => {
    switch (level) {
      case '높음':
        return 'bg-red-100 text-red-800'
      case '중간':
        return 'bg-yellow-100 text-yellow-800'
      case '낮음':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case '높음':
        return <AlertTriangle className="h-4 w-4" />
      case '중간':
        return <Info className="h-4 w-4" />
      case '낮음':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로 가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{mockAnalysisData.contractInfo.name}</h1>
            <p className="text-muted-foreground mt-1">
              분석 완료 • {mockAnalysisData.contractInfo.uploadDate}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            공유
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            보고서 다운로드
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">전체 위험도</p>
                <p className="text-lg font-bold">
                  <Badge className={getRiskColor(mockAnalysisData.riskSummary.overall)}>
                    {mockAnalysisData.riskSummary.overall}
                  </Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">총 위험 요소</p>
                <p className="text-lg font-bold">{mockAnalysisData.riskSummary.totalRisks}개</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">계약 금액</p>
                <p className="text-lg font-bold">{mockAnalysisData.keyInfo.totalAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">계약 기간</p>
                <p className="text-lg font-bold">6개월</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="risks">위험 분석</TabsTrigger>
          <TabsTrigger value="negotiation">협상 전략</TabsTrigger>
          <TabsTrigger value="comparison">표준 비교</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  계약서 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">계약 유형</p>
                    <p className="font-medium">{mockAnalysisData.contractInfo.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">파일 크기</p>
                    <p className="font-medium">{mockAnalysisData.contractInfo.fileSize}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">계약자</p>
                      <p className="font-medium">{mockAnalysisData.keyInfo.contractor}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">클라이언트</p>
                      <p className="font-medium">{mockAnalysisData.keyInfo.client}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">계약 기간</p>
                      <p className="font-medium">{mockAnalysisData.keyInfo.contractPeriod}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  위험도 분포
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">높음</span>
                    </div>
                    <span className="font-medium">{mockAnalysisData.riskSummary.highRisks}개</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">중간</span>
                    </div>
                    <span className="font-medium">{mockAnalysisData.riskSummary.mediumRisks}개</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">낮음</span>
                    </div>
                    <span className="font-medium">{mockAnalysisData.riskSummary.lowRisks}개</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="space-y-4">
            {mockAnalysisData.riskAnalysis.map((risk) => (
              <Card key={risk.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getRiskIcon(risk.level)}
                      <div>
                        <CardTitle className="text-lg">{risk.title}</CardTitle>
                        <CardDescription className="mt-1">{risk.clause}</CardDescription>
                      </div>
                    </div>
                    <Badge className={risk.riskColor}>
                      {risk.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">문제점</h4>
                    <p className="text-muted-foreground">{risk.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">예상 영향</h4>
                    <p className="text-muted-foreground">{risk.impact}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">개선 방안</h4>
                    <p className="text-muted-foreground">{risk.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="negotiation" className="space-y-6">
          <div className="space-y-4">
            {mockAnalysisData.negotiationStrategies.map((strategy) => (
              <Card key={strategy.riskId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {strategy.title}
                  </CardTitle>
                  <CardDescription>{strategy.strategy}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">제안 가능한 대안</h4>
                    <ul className="space-y-1">
                      {strategy.alternatives.map((alternative, index) => (
                        <li key={index} className="text-muted-foreground flex items-start space-x-2">
                          <span className="text-primary">•</span>
                          <span>{alternative}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">예상 반응</h4>
                    <p className="text-muted-foreground">{strategy.expectedResponse}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">재반박 논리</h4>
                    <p className="text-muted-foreground">{strategy.counterArgument}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>표준 계약서와의 비교</CardTitle>
              <CardDescription>
                {mockAnalysisData.comparisonWithStandard.governmentStandard}와 비교한 결과입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalysisData.comparisonWithStandard.differences.map((diff, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{diff.clause}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">현재 계약서</p>
                        <p className="text-sm">{diff.current}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">표준 계약서</p>
                        <p className="text-sm">{diff.standard}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-1">권장사항</p>
                      <p className="text-sm font-medium">{diff.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}