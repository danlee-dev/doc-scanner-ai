import { MainLayout } from "@/components/layout/main-layout";
import { AnalysisContent } from "@/components/analysis/analysis-content";

interface AnalysisPageProps {
  params: {
    id: string;
  };
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  return (
    <MainLayout>
      <AnalysisContent contractId={params.id} />
    </MainLayout>
  );
}