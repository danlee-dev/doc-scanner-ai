'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Upload,
  TrendingUp,
  Clock
} from "lucide-react"

const monthlyData = [
  { month: '1월', contracts: 12, risks: 3 },
  { month: '2월', contracts: 8, risks: 2 },
  { month: '3월', contracts: 15, risks: 5 },
  { month: '4월', contracts: 21, risks: 4 },
  { month: '5월', contracts: 18, risks: 6 },
  { month: '6월', contracts: 25, risks: 3 },
]

const riskDistribution = [
  { name: '높음', value: 15, color: '#4295A5' },
  { name: '중간', value: 35, color: '#54BAD1' },
  { name: '낮음', value: 50, color: '#96DCE8' },
]

const CustomLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, name } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#275F63"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="14"
      fontWeight="700"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const recentContracts = [
  {
    id: 1,
    name: "프리랜서 용역 계약서",
    date: "2024.10.12",
    status: "분석 완료",
    riskLevel: "중간",
    riskColor: "bg-yellow-100 text-yellow-800",
  },
  {
    id: 2,
    name: "근로 계약서",
    date: "2024.10.11",
    status: "분석 중",
    riskLevel: "높음",
    riskColor: "bg-red-100 text-red-800",
  },
  {
    id: 3,
    name: "임대차 계약서",
    date: "2024.10.10",
    status: "분석 완료",
    riskLevel: "낮음",
    riskColor: "bg-green-100 text-green-800",
  },
]

export function DashboardContent() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
          <p className="text-muted-foreground mt-2">
            계약서 분석 현황을 한눈에 확인하세요
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload size={18} />
          새 계약서 업로드
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 계약서</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> 지난달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">위험 계약서</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+3</span> 이번 주
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">분석 완료</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">104</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">81.9%</span> 완료율
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 분석 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2분</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-15%</span> 단축
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              월별 계약서 분석 현황
            </CardTitle>
            <CardDescription>
              최근 6개월간 분석된 계약서와 위험도 현황
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Bar
                  dataKey="contracts"
                  fill="hsl(var(--brand-500))"
                  name="총 계약서"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="risks"
                  fill="hsl(var(--brand-700))"
                  name="위험 계약서"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>위험도 분포</CardTitle>
            <CardDescription>
              전체 계약서의 위험도별 분포
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={90}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                  strokeWidth={0}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '14px',
                    color: 'hsl(var(--muted-foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 분석된 계약서</CardTitle>
          <CardDescription>
            최근에 업로드하고 분석한 계약서 목록
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentContracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-4 rounded-lg text-white hover:bg-brand-800 transition-colors"
                style={{ backgroundColor: '#4CAABE' }}
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-white/80" />
                  <div>
                    <p className="text-lg font-semibold text-white">{contract.name}</p>
                    <p className="text-sm text-white/70">{contract.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={`${contract.riskColor} px-3 py-1 text-sm`}>
                    {contract.riskLevel}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-sm bg-white text-black border-white">
                    {contract.status}
                  </Badge>
                  <Button variant="ghost" size="lg" className="text-white hover:text-white hover:bg-white/20 px-4 py-2 text-base font-bold">
                    보기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}