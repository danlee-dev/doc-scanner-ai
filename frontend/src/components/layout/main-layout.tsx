'use client'

import { Sidebar } from "@/components/ui/sidebar"
import {
  Home,
  Upload,
  FileText,
  GitCompare,
  Settings,
  BarChart3
} from "lucide-react"

const sidebarItems = [
  {
    title: "대시보드",
    href: "/",
    icon: Home,
  },
  {
    title: "계약서 업로드",
    href: "/upload",
    icon: Upload,
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
]

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 min-h-screen">
          <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[calc(100vh-3rem)] flex flex-col">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}