'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Plus,
  SortAsc,
  SortDesc,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"

const mockContracts = [
  {
    id: "1",
    name: "프리랜서 용역 계약서",
    type: "프리랜서",
    client: "(주)테크스타트업",
    uploadDate: "2024.10.12",
    analysisDate: "2024.10.12",
    status: "분석 완료",
    riskLevel: "중간",
    amount: "15,000,000원",
    period: "6개월",
    fileSize: "245KB"
  },
  {
    id: "2",
    name: "근로 계약서",
    type: "정규직",
    client: "㈜이노베이션",
    uploadDate: "2024.10.11",
    analysisDate: "2024.10.11",
    status: "분석 완료",
    riskLevel: "높음",
    amount: "36,000,000원",
    period: "1년",
    fileSize: "312KB"
  },
  {
    id: "3",
    name: "임대차 계약서",
    type: "부동산",
    client: "개인",
    uploadDate: "2024.10.10",
    analysisDate: "2024.10.10",
    status: "분석 완료",
    riskLevel: "낮음",
    amount: "120,000,000원",
    period: "2년",
    fileSize: "189KB"
  },
  {
    id: "4",
    name: "컨설팅 서비스 계약서",
    type: "서비스",
    client: "㈜글로벌컨설팅",
    uploadDate: "2024.10.09",
    analysisDate: "2024.10.09",
    status: "분석 완료",
    riskLevel: "중간",
    amount: "8,000,000원",
    period: "3개월",
    fileSize: "267KB"
  },
  {
    id: "5",
    name: "소프트웨어 라이선스 계약서",
    type: "라이선스",
    client: "㈜소프트웨어플러스",
    uploadDate: "2024.10.08",
    analysisDate: "2024.10.08",
    status: "분석 중",
    riskLevel: "-",
    amount: "24,000,000원",
    period: "1년",
    fileSize: "156KB"
  }
]

export function ContractsContent() {
  const [contracts, setContracts] = useState(mockContracts)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [sortField, setSortField] = useState("uploadDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case '분석 완료':
        return 'bg-green-100 text-green-800'
      case '분석 중':
        return 'bg-blue-100 text-blue-800'
      case '대기 중':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '분석 완료':
        return <CheckCircle className="h-4 w-4" />
      case '분석 중':
        return <Clock className="h-4 w-4" />
      case '위험':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter
    const matchesRisk = riskFilter === "all" || contract.riskLevel === riskFilter

    return matchesSearch && matchesStatus && matchesRisk
  })

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">계약서 목록</h1>
          <p className="text-muted-foreground mt-2">
            업로드한 계약서를 관리하고 분석 결과를 확인하세요
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          새 계약서 업로드
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">총 계약서</p>
                <p className="text-lg font-bold">{contracts.length}개</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">분석 완료</p>
                <p className="text-lg font-bold">
                  {contracts.filter(c => c.status === '분석 완료').length}개
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">높은 위험</p>
                <p className="text-lg font-bold">
                  {contracts.filter(c => c.riskLevel === '높음').length}개
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">분석 중</p>
                <p className="text-lg font-bold">
                  {contracts.filter(c => c.status === '분석 중').length}개
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="계약서 이름 또는 클라이언트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="분석 완료">분석 완료</SelectItem>
                  <SelectItem value="분석 중">분석 중</SelectItem>
                  <SelectItem value="대기 중">대기 중</SelectItem>
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="위험도 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 위험도</SelectItem>
                  <SelectItem value="높음">높음</SelectItem>
                  <SelectItem value="중간">중간</SelectItem>
                  <SelectItem value="낮음">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    계약서명
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>유형</TableHead>
                <TableHead>클라이언트</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('uploadDate')}
                >
                  <div className="flex items-center gap-1">
                    업로드일
                    {sortField === 'uploadDate' && (
                      sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>상태</TableHead>
                <TableHead>위험도</TableHead>
                <TableHead>계약금액</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{contract.name}</p>
                        <p className="text-sm text-muted-foreground">{contract.fileSize}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{contract.type}</Badge>
                  </TableCell>
                  <TableCell>{contract.client}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {contract.uploadDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contract.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(contract.status)}
                        {contract.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {contract.riskLevel !== '-' ? (
                      <Badge className={getRiskColor(contract.riskLevel)}>
                        {contract.riskLevel}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{contract.amount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>작업</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          분석 결과 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          보고서 다운로드
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {sortedContracts.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">
                다른 검색어나 필터를 사용해보세요
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}