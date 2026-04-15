import { AnalystWorkbench } from '@/components/analyst-workbench';

export function IntakeShell({
  knowledgeSummary,
}: {
  knowledgeSummary: {
    industries: number;
    products: number;
    stacks: number;
    tierCounts: Record<string, number>;
    models: { digest: string; reasoning: string };
  };
}) {
  return <AnalystWorkbench knowledgeSummary={knowledgeSummary} />;
}
