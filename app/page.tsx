import { IntakeShell } from '@/components/intake-shell';
import { getKnowledgeSummary } from '@/lib/knowledge';

export default function Home() {
  const summary = getKnowledgeSummary();
  return <IntakeShell knowledgeSummary={summary} />;
}
