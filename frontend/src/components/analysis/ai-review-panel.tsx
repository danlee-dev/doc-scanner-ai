'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ChevronRight, Info, Send } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface AIReviewPanelProps {
  contractId: string
  onClose?: () => void
}

const mockReviewData = {
  summary: [
    {
      id: 1,
      title: '[계약조건 검토 결과]',
      items: [
        '계약기간은 불완전 명확한 협약으로 30일의 아니라 단계별 지급이 되는 수준으로 협약되어 있습니다.',
        '대금 지급 기간 내에 수익을 매출이 배분되지 못할 상황이 발생할 수 있습니다.',
        '전반적인 반영되어 관한을으로 진행 수 있습니다.'
      ]
    },
    {
      id: 2,
      title: '[지급조건 수정제안]',
      items: [
        '계약 위반으로 인해 산재적인권 소멸이 수행될 경우, 책임 권리 대한 소멸주의 범위가 매우 불안정합니다.',
        '소멸시작점 반드는 위약사유를 전 200,000,000원 차 금액이 없습니다.',
        '위 내용을 명확히, 대급 지급에 시간과 그리고 기간에 관한 위치를 정확이 규정하여 분쟁 가능성을 애무시킬 수 있습니다.'
      ]
    }
  ],
  improvements: [
    {
      id: 1,
      clause: '제2조',
      current: '계약서 업무에 대해 30일 지급한다',
      issue: '불명확한 기간',
      suggestion: '업무 완료 시작일부터 30일 이내 지급'
    }
  ]
}

export function AIReviewPanel({ contractId, onClose }: AIReviewPanelProps) {
  const [legalReference, setLegalReference] = useState(true)
  const [modernTranslation, setModernTranslation] = useState(false)
  const [chatMessage, setChatMessage] = useState('')

  return (
    <div className="flex flex-col h-full bg-white relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-l-lg shadow-sm hover:bg-gray-50 transition-all duration-200 flex items-center justify-center group z-10"
        >
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      )}

      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold">AI 계약 검토</h2>
          <Info className="h-4 w-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="legal-ref"
              checked={legalReference}
              onCheckedChange={setLegalReference}
            />
            <Label htmlFor="legal-ref" className="text-sm font-normal cursor-pointer">
              법조문 참고
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="modern-trans"
              checked={modernTranslation}
              onCheckedChange={setModernTranslation}
            />
            <Label htmlFor="modern-trans" className="text-sm font-normal cursor-pointer">
              현대어 번역
            </Label>
          </div>
        </div>
      </div>

      <Tabs defaultValue="summary" className="flex-1 flex flex-col">
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="text-xs">핵심 요약</TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs">보완 의견</TabsTrigger>
            <TabsTrigger value="improvements" className="text-xs">조항 개선</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <TabsContent value="summary" className="mt-0 space-y-6">
            {mockReviewData.summary.map((section) => (
              <div key={section.id} className="space-y-3">
                <h3 className="font-semibold text-blue-600">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                      <span className="text-blue-600">• </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="feedback" className="mt-0">
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">주의 사항</h4>
                <p className="text-sm text-gray-700">
                  계약서의 일부 조항이 법적 기준에 미달하거나 불명확한 부분이 있습니다.
                  전문가의 검토를 권장합니다.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="improvements" className="mt-0 space-y-4">
            {mockReviewData.improvements.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{item.clause}</h4>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    개선 필요
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">현재</p>
                    <p className="text-sm text-gray-700">{item.current}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">문제점</p>
                    <p className="text-sm text-red-600">{item.issue}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">제안</p>
                    <p className="text-sm text-green-700 font-medium">{item.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </div>

        <Separator />

        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="계약서 내용에 대해 물어보세요"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
