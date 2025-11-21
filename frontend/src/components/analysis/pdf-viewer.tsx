'use client'

import { useEffect, useRef, useState } from 'react'

interface PDFViewerProps {
  file: File
  fontSize: number
  pageNumber: number
  onPageChange?: (current: number, total: number) => void
}

declare global {
  interface Window {
    pdfjsLib: any
  }
}

export function PDFViewer({ file, fontSize, pageNumber, onPageChange }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState(0)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // PDF.js CDN 로드 확인
    const checkPdfJs = setInterval(() => {
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        setIsReady(true)
        clearInterval(checkPdfJs)
      }
    }, 100)

    return () => clearInterval(checkPdfJs)
  }, [])

  useEffect(() => {
    if (!isReady) return

    const loadPDF = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
        setPdfDoc(pdf)
        setNumPages(pdf.numPages)
      } catch (error) {
        console.error('PDF 로딩 오류:', error)
      }
    }

    loadPDF()
  }, [file, isReady])

  useEffect(() => {
    if (numPages > 0 && onPageChange) {
      onPageChange(pageNumber, numPages)
    }
  }, [pageNumber, numPages, onPageChange])

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !textLayerRef.current) return

    const renderPage = async () => {
      const page = await pdfDoc.getPage(pageNumber)

      // 고해상도를 위한 scale 설정
      const scale = 2.0 // 화질 개선
      const viewport = page.getViewport({ scale })

      const canvas = canvasRef.current!
      const context = canvas.getContext('2d')!

      // 실제 해상도는 높게, 표시는 작게
      canvas.height = viewport.height
      canvas.width = viewport.width
      canvas.style.width = `${viewport.width / 2}px`
      canvas.style.height = `${viewport.height / 2}px`

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise

      // 텍스트 레이어 렌더링
      const textContent = await page.getTextContent()
      const textLayer = textLayerRef.current!
      textLayer.innerHTML = ''

      // 표시 크기에 맞춰 설정
      const displayViewport = page.getViewport({ scale: 1.0 })
      textLayer.style.width = `${displayViewport.width}px`
      textLayer.style.height = `${displayViewport.height}px`
      textLayer.style.setProperty('--scale-factor', '1.0')

      // PDF.js renderTextLayer 사용
      await window.pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container: textLayer,
        viewport: displayViewport,
        textDivs: []
      }).promise
    }

    renderPage()
  }, [pdfDoc, pageNumber, fontSize])

  return (
    <div className="flex justify-center">
      <div className="relative inline-block">
        <canvas ref={canvasRef} className="max-w-full shadow-sm block" />
        <div
          ref={textLayerRef}
          className="textLayer absolute top-0 left-0"
          style={{
            pointerEvents: 'auto',
            background: 'transparent',
            userSelect: 'text',
            zIndex: 10
          }}
        />
      </div>
    </div>
  )
}
