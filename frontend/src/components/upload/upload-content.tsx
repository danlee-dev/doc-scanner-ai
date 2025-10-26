'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  FileIcon,
  Loader2
} from "lucide-react"

interface UploadFile {
  id: string
  name: string
  size: number
  type: string
  status: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'error'
  progress: number
  error?: string
}

const contractTypes = [
  { id: 'employment', name: '근로계약서', description: '정규직, 계약직 등 고용 관련 계약서' },
  { id: 'freelance', name: '프리랜서 용역계약서', description: '프리랜서 업무 위탁 계약서' },
  { id: 'rental', name: '임대차계약서', description: '주택, 상가 등 부동산 임대 계약서' },
  { id: 'service', name: '서비스계약서', description: '각종 서비스 제공 계약서' },
  { id: 'other', name: '기타 계약서', description: '기타 다양한 계약서 유형' },
]

export function UploadContent() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }, [])

  const handleFiles = (fileList: File[]) => {
    const newFiles: UploadFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])

    // 파일 업로드 및 분석 시뮬레이션
    newFiles.forEach(file => {
      simulateFileProcessing(file.id)
    })
  }

  const simulateFileProcessing = async (fileId: string) => {
    // 업로드 단계
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status: 'uploading' } : f
    ))

    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, progress: i } : f
      ))
    }

    // 분석 단계
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status: 'analyzing', progress: 0 } : f
    ))

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, progress: i } : f
      ))
    }

    // 완료
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
    ))
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'analyzing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return '업로드 중'
      case 'analyzing':
        return 'AI 분석 중'
      case 'completed':
        return '분석 완료'
      case 'error':
        return '오류 발생'
      default:
        return '대기 중'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">계약서 업로드</h1>
        <p className="text-muted-foreground mt-2">
          계약서를 업로드하여 AI 분석을 시작하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>파일 업로드</CardTitle>
              <CardDescription>
                PDF, HWP, DOCX 형식의 계약서를 업로드할 수 있습니다 (최대 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">파일을 여기에 드래그하거나</h3>
                <p className="text-muted-foreground mb-4">클릭하여 파일을 선택하세요</p>

                <input
                  type="file"
                  multiple
                  accept=".pdf,.hwp,.docx,.doc"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    파일 선택
                  </label>
                </Button>

                <p className="text-xs text-muted-foreground mt-4">
                  지원 형식: PDF, HWP, DOCX | 최대 크기: 10MB
                </p>
              </div>
            </CardContent>
          </Card>

          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>업로드된 파일</CardTitle>
                <CardDescription>
                  {files.length}개의 파일이 업로드되었습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>

                        {(file.status === 'uploading' || file.status === 'analyzing') && (
                          <div className="mt-2">
                            <Progress value={file.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {file.progress}% - {getStatusText(file.status)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusIcon(file.status)}
                        <Badge variant={file.status === 'completed' ? 'default' : 'secondary'}>
                          {getStatusText(file.status)}
                        </Badge>

                        {file.status === 'completed' ? (
                          <Button size="sm">결과 보기</Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>계약서 유형 선택</CardTitle>
              <CardDescription>
                계약서 유형을 선택하면 더 정확한 분석이 가능합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contractTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI 분석 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">리스크 분석</div>
                    <div className="text-sm text-muted-foreground">독소 조항 식별 및 위험도 평가</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">표준 계약서 비교</div>
                    <div className="text-sm text-muted-foreground">정부 표준 계약서와 비교 분석</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">협상 전략 제안</div>
                    <div className="text-sm text-muted-foreground">유리한 대안 문구 및 협상 근거 제공</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">핵심 정보 추출</div>
                    <div className="text-sm text-muted-foreground">계약 기간, 금액 등 중요 정보 자동 추출</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}