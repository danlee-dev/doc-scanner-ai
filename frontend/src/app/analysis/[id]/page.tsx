'use client'

import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { AnalysisContent } from "@/components/analysis/analysis-content";
import {
  Home,
  FileText,
  GitCompare,
  Settings,
  BarChart3,
  PanelLeftOpen
} from "lucide-react";
import { use } from "react";

const sidebarItems = [
  {
    title: "대시보드",
    href: "/",
    icon: Home,
  },
  {
    title: "계약서 분석",
    href: "/analysis/test-contract-001",
    icon: FileText,
  },
  {
    title: "계약서 목록",
    href: "/contracts",
    icon: FileText,
  },
  {
    title: "계약서 비교",
    href: "/compare",
    icon: GitCompare,
  },
  {
    title: "분석 보고서",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "설정",
    href: "/settings",
    icon: Settings,
  },
];

interface AnalysisPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { id } = use(params);
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <div className={`transition-all duration-300 ${showSidebar ? 'w-64' : 'w-0'} overflow-hidden`}>
        <Sidebar items={sidebarItems} onCollapse={() => setShowSidebar(false)} />
      </div>

      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute top-1/2 left-0 transform -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 transition-all duration-200 flex items-center justify-center group z-20"
        >
          <PanelLeftOpen className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      )}

      <main className="flex-1 overflow-hidden">
        <AnalysisContent contractId={id} />
      </main>
    </div>
  );
}