'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import dynamic from 'next/dynamic'
import mammoth from 'mammoth'
import {
  ZoomIn,
  ZoomOut,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link2,
  Image,
  Minus,
  Plus,
  Upload,
  FileText
} from 'lucide-react'

const PDFViewer = dynamic(() => import('./pdf-viewer').then(mod => ({ default: mod.PDFViewer })), {
  ssr: false,
  loading: () => <div className="p-8 text-center">PDF 로딩 중...</div>
})

interface DocumentViewerProps {
  contractId: string
}

type FileType = 'pdf' | 'docx' | 'hwp' | 'txt' | null

const mockDocumentContent = `제6조 (계약의 효력)

1. 해당 인쇄물에 대한 서출판권은 출판사에게 위탁한 것이 아니라 양도한 것임을 분명히 한다. 단, 본을 제외한 해외 출판권은 작가의 소유로 한다.

2. 이 계약에 의한 출판물이 법률에 위배되거나 제3자의 권리를 침해할 경우, 갑, 을의 책임을 1차 비율로 한다.

3. 해당 인쇄물을 이용한 방송연극, 영화, 음반, 그 밖의 일체 상업적 이용에 대한 수익은 갑 60%, 을 40%로 배분한다. 다만, 갑과 을은 상호합의에 의하여 이 비율을 수정할 수 있다.

4. 계약금 및 선급금의 금액에 대한 저작권의 내에 여타의 일부 또는 전부에 한정하여 이익을 창출하고자 하되, 본계약 진료 수신적의 발생으로 저급금과 관련이 발생하더라도 이를 갑과 을의 협의를 통하여 별도의 합의가 이뤄지지 아니한다.

5. 본 조의 여타 항목 중 별개로서의 제정조치 권한의 조합을 본 출판권의 이행한다. 다만, 갑의 일반 합작 권을 제한에 추가로 설정할 수 있으며 본 등의 대위적으로 매도로 인한 변경을 대서 경쟁적으로 안정하시기로 규정하여 오는 경쟁대책을 그렇지아니한다.

제6조 (계약의 효력) 보

1. 해당인쇄물에 대한 전출판권은 출판사에게 위탁한 것이 아니라 저자에게 부여된 것임을 확실히 하며 하이, 현대의 것이 복잡한 점을 감안하여 작가에 의해 효율적으로 매개가 되지 아니하고, 해당인쇄물을 충분히 입어보고 이에 대한 분석을 30일 이내 한다 30일 이내 효율성을 재설하지 아니할 경우는 계약이 성립되지 아니한다.

2. 해당인쇄물을 응당 감당 금액의 원래의 분배중 30일 이내 준비한다 30일 이내 효과적으로 제공되도록 하며 발도일에 대한 부분으로 본래의 환율직으로 재설정하지 아니한다. 이 경우 재배는 권한의 환율대 발행수의 직접하도 전환하는 비율로 환계로 배급율를 환다.

3. 해당인쇄물의 공동적 발행이재 발행 및 위빙 장 등의 가장 신탁으로 위해를 저급거래권 환급 및 즉발이어도 또는 의약의 경우만 재치한 할 수 있다. 이 경우 재배는 권한의 배급율및 발치기는 직과는 개인의 비율로 한정적으로 발채수 외다.

4. 해당인쇄물의 충발작전의 환항관 및 환계재의 반환 한경우환 경지권의 직전환 위와의 업일중재 일자의 재관재를 재설제호중재 하는 합법제화 감수할 수 있다.

제7조 (출판권리)

1. 해당인쇄물의 관련적 발일의 관련 해신 제매 그를 타 관사 사인이 수금하여 이에 대한 해택은 출판사가 배격한 책전일하는 비소로 집중하여 관나가 인태적에서 제제활 및 감수한 의제와 관련하고 의제 배점을 채포보수 및 해 중감중한다. 이 경우 재배로 실현의 제정환경은 집권과 을로 된해되는 권감권 및 출력 전제수 여기서 배비된 채소제로 배급된 환시로써 제효를리배적으로 보장은 재권을 의위중재 실현재제한 일국재가 제출금으로써 일환적으로 제제되는 출만금으로 보다.`

export function DocumentViewer({ contractId }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [fontSize, setFontSize] = useState(20)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>(mockDocumentContent)
  const [fileType, setFileType] = useState<FileType>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pdfPage, setPdfPage] = useState(1)
  const [pdfTotalPages, setPdfTotalPages] = useState(0)

  const handleTextSelect = () => {
    const selection = window.getSelection()
    const text = selection?.toString() || ''

    if (text.length > 0) {
      setSelectedText(text)
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()

      if (rect) {
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        })
      }
    } else {
      setSelectedText('')
      setTooltipPosition(null)
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)

    const fileExtension = file.name.split('.').pop()?.toLowerCase() as FileType

    if (fileExtension === 'pdf') {
      setFileType('pdf')
      setFileContent('')
      setPdfPage(1)
      setPdfTotalPages(0)
    } else if (fileExtension === 'docx') {
      setFileType('docx')
      try {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        setFileContent(result.value)
      } catch (error) {
        console.error('DOCX 파싱 오류:', error)
        setFileContent('DOCX 파일을 읽는 중 오류가 발생했습니다.')
      }
    } else if (fileExtension === 'hwp') {
      setFileType('hwp')
      setFileContent('HWP 파일은 현재 지원하지 않습니다. PDF 또는 DOCX로 변환해주세요.')
    } else if (fileExtension === 'txt') {
      setFileType('txt')
      const text = await file.text()
      setFileContent(text)
    } else {
      alert('지원하지 않는 파일 형식입니다. PDF, DOCX, HWP 파일만 업로드 가능합니다.')
      return
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.hwp,.txt"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">α"</span>
              </div>
              <span className="text-sm font-medium truncate max-w-[200px]">
                {uploadedFile ? uploadedFile.name : '파일명제시.ai'}
              </span>
            </div>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">v1</span>
            <Button
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              className="ml-1"
            >
              <Upload className="h-3 w-3 mr-1" />
              업로드
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <span className="text-sm">{zoom}%</span>
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <span className="text-sm">{fontSize}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
            >
              <Plus className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Underline className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignRight className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Link2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Image className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-8 py-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!uploadedFile && !fileContent ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  계약서 파일을 업로드하세요
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  PDF, DOCX, HWP 파일을 드래그하거나 클릭하여 업로드
                </p>
              </div>
              <Button onClick={triggerFileInput} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                파일 선택
              </Button>
            </div>
          </div>
        ) : fileType === 'pdf' && uploadedFile ? (
          <div className={`transition-all ${isDragging ? 'opacity-50' : ''}`}>
            <PDFViewer
              file={uploadedFile}
              fontSize={fontSize}
              pageNumber={pdfPage}
              onPageChange={(_current, total) => {
                setPdfTotalPages(total)
              }}
            />
          </div>
        ) : (
          <div
            className={`prose max-w-none transition-all ${
              isDragging ? 'opacity-50' : ''
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.8',
              color: '#1a1a1a'
            }}
            contentEditable
            suppressContentEditableWarning
            onSelect={handleTextSelect}
          >
            <div className="whitespace-pre-wrap outline-none">{fileContent}</div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 flex justify-center items-center gap-4">
        {fileType === 'pdf' && pdfTotalPages > 0 ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPdfPage(Math.max(1, pdfPage - 1))}
              disabled={pdfPage <= 1}
            >
              이전
            </Button>
            <span className="text-sm font-medium">
              {pdfPage} / {pdfTotalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPdfPage(Math.min(pdfTotalPages, pdfPage + 1))}
              disabled={pdfPage >= pdfTotalPages}
            >
              다음
            </Button>
          </>
        ) : (
          <Button variant="outline" className="px-6">
            전문 확인하기
          </Button>
        )}
      </div>

      {tooltipPosition && selectedText && (
        <div
          className="fixed bg-gray-800 text-white px-3 py-2 rounded text-xs shadow-lg z-50"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <button className="hover:text-blue-300">하이라이트</button>
            <span className="text-gray-400">|</span>
            <button className="hover:text-blue-300">주석</button>
            <span className="text-gray-400">|</span>
            <button className="hover:text-blue-300">AI 설명</button>
          </div>
        </div>
      )}
    </div>
  )
}
