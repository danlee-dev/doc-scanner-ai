'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  GitCompare,
  Download,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react"

interface UploadedFile {
  file: File
  name: string
  preview: string
}

const mockDifferences = [
  {
    id: 1,
    type: "수정",
    section: "제2조 (계약금액)",
    original: "계약금액은 1,000만원으로 한다.",
    modified: "계약금액은 1,200만원으로 한다.",
    severity: "높음",
    description: "계약금액이 200만원 증가했습니다."
  },
  {
    id: 2,
    type: "추가",
    section: "제5조 (특약사항)",
    original: "",
    modified: "계약 해지 시 위약금은 계약금액의 10%로 한다.",
    severity: "중간",
    description: "새로운 위약금 조항이 추가되었습니다."
  },
  {
    id: 3,
    type: "삭제",
    section: "제7조 (보증조항)",
    original: "계약자는 계약 이행을 위한 보증금을 예치해야 한다.",
    modified: "",
    severity: "높음",
    description: "보증금 조항이 삭제되었습니다."
  }
]

export function ContractCompare() {
  const [leftFile, setLeftFile] = useState<UploadedFile | null>(null)
  const [rightFile, setRightFile] = useState<UploadedFile | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [showDifferences, setShowDifferences] = useState(false)

  const leftScrollRef = useRef<HTMLDivElement>(null)
  const rightScrollRef = useRef<HTMLDivElement>(null)

  const handleFileUpload = useCallback((file: File, side: 'left' | 'right') => {
    if (!file.type.includes('pdf')) {
      alert('PDF 파일만 업로드 가능합니다.')
      return
    }

    const fileData: UploadedFile = {
      file,
      name: file.name,
      preview: `PDF 파일: ${file.name}`
    }

    if (side === 'left') {
      setLeftFile(fileData)
    } else {
      setRightFile(fileData)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, side: 'left' | 'right') => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0], side)
    }
  }

  const syncScroll = (source: 'left' | 'right', scrollTop: number) => {
    if (source === 'left' && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = scrollTop
    } else if (source === 'right' && leftScrollRef.current) {
      leftScrollRef.current.scrollTop = scrollTop
    }
  }

  const startComparison = async () => {
    if (!leftFile || !rightFile) return

    setIsComparing(true)
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setIsComparing(false)
      setShowDifferences(true)
    }, 3000)
  }

  const removeFile = (side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftFile(null)
    } else {
      setRightFile(null)
    }
    setShowDifferences(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '높음': return 'bg-red-100 text-red-800'
      case '중간': return 'bg-yellow-100 text-yellow-800'
      case '낮음': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '수정': return <GitCompare className="w-4 h-4" />
      case '추가': return <CheckCircle className="w-4 h-4" />
      case '삭제': return <AlertTriangle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">계약서 비교</h1>
          <p className="text-muted-foreground mt-2">
            두 계약서를 업로드하여 차이점을 분석하세요
          </p>
        </div>
        {leftFile && rightFile && (
          <Button
            onClick={startComparison}
            disabled={isComparing}
            className="flex items-center gap-2"
          >
            <GitCompare size={18} className="fill-current" />
            {isComparing ? '분석 중...' : '비교 분석 시작'}
          </Button>
        )}
      </div>

      {/* 파일 업로드 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 flex-1">
        {/* 왼쪽 파일 업로드 */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              계약서 A (원본)
            </CardTitle>
            <CardDescription>
              비교할 첫 번째 계약서를 업로드하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {!leftFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center hover:border-primary transition-colors cursor-pointer flex flex-col justify-center flex-1"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'left')}
                onClick={() => document.getElementById('left-file-input')?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  PDF 파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-sm text-gray-500">
                  최대 10MB, PDF 파일만 지원
                </p>
                <input
                  id="left-file-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'left')
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col h-full gap-4">
                <div className="flex items-center justify-between p-4 bg-brand-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-brand-600" />
                    <div>
                      <p className="font-medium text-gray-900">{leftFile.name}</p>
                      <p className="text-sm text-gray-500">PDF 파일</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('left')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div
                  ref={leftScrollRef}
                  className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50"
                  onScroll={(e) => syncScroll('left', e.currentTarget.scrollTop)}
                >
                  <div className="space-y-4 text-sm">
                    <p className="font-bold text-lg">계약서 A 미리보기</p>
                    <div className="space-y-2">
                      <p><strong>제1조 (목적)</strong></p>
                      <p>이 계약은 갑과 을 간의 업무위탁에 관한 사항을 정함을 목적으로 한다.</p>

                      <p><strong>제2조 (계약금액)</strong></p>
                      <p>계약금액은 1,000만원으로 한다.</p>

                      <p><strong>제3조 (계약기간)</strong></p>
                      <p>계약기간은 2024년 1월 1일부터 2024년 12월 31일까지로 한다.</p>

                      <p><strong>제4조 (업무내용)</strong></p>
                      <p>을은 갑이 요청하는 소프트웨어 개발 업무를 수행한다.</p>

                      <p><strong>제6조 (계약해지)</strong></p>
                      <p>양 당사자는 30일 전 서면통지로 계약을 해지할 수 있다.</p>

                      <p><strong>제7조 (보증조항)</strong></p>
                      <p>계약자는 계약 이행을 위한 보증금을 예치해야 한다.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 오른쪽 파일 업로드 */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              계약서 B (비교본)
            </CardTitle>
            <CardDescription>
              비교할 두 번째 계약서를 업로드하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {!rightFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center hover:border-primary transition-colors cursor-pointer flex flex-col justify-center flex-1"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'right')}
                onClick={() => document.getElementById('right-file-input')?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  PDF 파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-sm text-gray-500">
                  최대 10MB, PDF 파일만 지원
                </p>
                <input
                  id="right-file-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'right')
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col h-full gap-4">
                <div className="flex items-center justify-between p-4 bg-brand-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-brand-600" />
                    <div>
                      <p className="font-medium text-gray-900">{rightFile.name}</p>
                      <p className="text-sm text-gray-500">PDF 파일</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('right')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div
                  ref={rightScrollRef}
                  className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50"
                  onScroll={(e) => syncScroll('right', e.currentTarget.scrollTop)}
                >
                  <div className="space-y-4 text-sm">
                    <p className="font-bold text-lg">계약서 B 미리보기</p>
                    <div className="space-y-2">
                      <p><strong>제1조 (목적)</strong></p>
                      <p>이 계약은 갑과 을 간의 업무위탁에 관한 사항을 정함을 목적으로 한다.</p>

                      <p><strong>제2조 (계약금액)</strong></p>
                      <p className="bg-yellow-200">계약금액은 1,200만원으로 한다.</p>

                      <p><strong>제3조 (계약기간)</strong></p>
                      <p>계약기간은 2024년 1월 1일부터 2024년 12월 31일까지로 한다.</p>

                      <p><strong>제4조 (업무내용)</strong></p>
                      <p>을은 갑이 요청하는 소프트웨어 개발 업무를 수행한다.</p>

                      <p><strong>제5조 (특약사항)</strong></p>
                      <p className="bg-green-200">계약 해지 시 위약금은 계약금액의 10%로 한다.</p>

                      <p><strong>제6조 (계약해지)</strong></p>
                      <p>양 당사자는 30일 전 서면통지로 계약을 해지할 수 있다.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 분석 중 상태 */}
      {isComparing && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-full mb-4">
                <GitCompare className="w-8 h-8 text-brand-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI가 계약서를 분석 중입니다</h3>
              <p className="text-muted-foreground">
                두 계약서의 차이점을 찾고 있습니다. 잠시만 기다려주세요...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 차이점 분석 결과 */}
      {showDifferences && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5" />
                  분석 결과
                </CardTitle>
                <CardDescription>
                  총 {mockDifferences.length}개의 차이점이 발견되었습니다
                </CardDescription>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                분석 보고서 다운로드
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4">
              {mockDifferences.map((diff) => (
                <div key={diff.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(diff.type)}
                      <span className="font-medium">{diff.section}</span>
                      <Badge className={getSeverityColor(diff.severity)}>
                        {diff.severity}
                      </Badge>
                    </div>
                    <Badge variant="outline">{diff.type}</Badge>
                  </div>

                  <p className="text-sm text-gray-600">{diff.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diff.original && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-600">원본</p>
                        <div className="bg-red-50 p-3 rounded text-sm border-l-4 border-red-200">
                          {diff.original}
                        </div>
                      </div>
                    )}
                    {diff.modified && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-600">수정본</p>
                        <div className="bg-green-50 p-3 rounded text-sm border-l-4 border-green-200">
                          {diff.modified}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}