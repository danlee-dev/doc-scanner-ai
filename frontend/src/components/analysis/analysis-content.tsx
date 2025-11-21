'use client'

import { useState } from 'react'
import { DocumentViewer } from './document-viewer'
import { AIReviewPanel } from './ai-review-panel'
import { PanelRightOpen } from 'lucide-react'

interface AnalysisContentProps {
  contractId: string
}

export function AnalysisContent({ contractId }: AnalysisContentProps) {
  const [showAIPanel, setShowAIPanel] = useState(true)

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden relative">
      <div className={`border-r border-gray-200 overflow-hidden transition-all duration-300 ${
        showAIPanel ? 'w-[65%]' : 'w-full'
      }`}>
        <DocumentViewer contractId={contractId} />
      </div>

      <div className={`transition-all duration-300 ${showAIPanel ? 'w-[35%]' : 'w-0'} overflow-hidden`}>
        <AIReviewPanel contractId={contractId} onClose={() => setShowAIPanel(false)} />
      </div>

      {!showAIPanel && (
        <button
          onClick={() => setShowAIPanel(true)}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-l-lg shadow-sm hover:bg-gray-50 transition-all duration-200 flex items-center justify-center group z-10"
        >
          <PanelRightOpen className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      )}
    </div>
  )
}
