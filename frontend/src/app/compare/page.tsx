import { MainLayout } from "@/components/layout/main-layout"
import { ContractCompare } from "@/components/compare/contract-compare"

export default function ComparePage() {
  return (
    <MainLayout>
      <div className="h-full">
        <ContractCompare />
      </div>
    </MainLayout>
  )
}