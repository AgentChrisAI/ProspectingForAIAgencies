import type { AnalysisResponse } from '@/lib/types';

export type ProspectFormInput = {
  companyName: string;
  websiteUrl: string;
  contactName?: string;
  role?: string;
  industry?: string;
  teamSize?: string;
  revenue?: string;
  location?: string;
  currentTools?: string;
  painPoints?: string;
  notes?: string;
};

export function buildBriefMarkdown(form: ProspectFormInput, result: AnalysisResponse, editorNotes?: string) {
  const { input, extraction, digest, report, metadata } = result;
  const confidenceNotes = [...digest.caveats, ...report.confidenceNotes];

  const lines = [
    `# Prospect Brief — ${input.companyName}`,
    '',
    `Generated: ${new Date(metadata.generatedAt).toLocaleString()}`,
    `Website: ${input.websiteUrl}`,
    '',
    '## Intake',
    bulletMap({
      'Company name': form.companyName,
      'Website URL': form.websiteUrl,
      'Contact name': form.contactName,
      'Role / title': form.role,
      'Industry hint': form.industry,
      'Team size': form.teamSize,
      'Revenue band': form.revenue,
      Location: form.location,
      'Current tools': form.currentTools,
      'Pain points': form.painPoints,
      'Extra notes': form.notes,
    }),
    '',
    '## Executive summary',
    report.executiveSummary,
    '',
    ...(editorNotes?.trim()
      ? [
          '## Editable recommendation notes',
          editorNotes,
          '',
        ]
      : []),
    '## Website snapshot',
    bulletMap({
      Title: extraction.title,
      'Final URL': extraction.finalUrl,
      Description: extraction.description || 'No meta description found',
    }),
    '',
    '## Digest',
    digest.companySnapshot,
    '',
    '### Website summary',
    bulletList(digest.websiteSummary),
    '',
    '### Signals',
    bulletList(digest.signals),
    '',
    '### Buying signals',
    bulletList(digest.buyingSignals),
    '',
    '## Industry fit',
    bulletMap({
      Industry: report.inferredIndustry.label,
      Confidence: report.inferredIndustry.confidence,
      Reasoning: report.inferredIndustry.reasoning,
    }),
    '',
    '## Key pain points',
    bulletList(report.keyPainPoints),
    '',
    '## Diagnosis',
    '### Data',
    bulletList(report.diagnosis.data),
    '',
    '### Process',
    bulletList(report.diagnosis.process),
    '',
    '### Communication',
    bulletList(report.diagnosis.communication),
    '',
    '### Capacity',
    bulletList(report.diagnosis.capacity),
    '',
    '## Recommended products',
    ...report.recommendedProducts.flatMap((item, index) => [
      `### ${index + 1}. ${item.positionedName}`,
      bulletMap({
        'Catalogue product': item.productName,
        Tier: item.tier,
        Source: item.source,
        Outcome: item.outcomeSummary,
        'Industry application': item.industryApplication,
        'Why it fits': item.whyItFits,
        'Expected impact': item.expectedImpact,
      }),
      '',
    ]),
    '## Recommended stack',
    bulletMap({
      Name: report.recommendedStack.name,
      Rationale: report.recommendedStack.rationale,
      Rollout: report.recommendedStack.rollout,
    }),
    '',
    '### Implementation phases',
    bulletList(report.recommendedStack.implementationPhases),
    '',
    '## Knowledge Layer rationale',
    report.knowledgeLayerRationale.valueNarrative,
    '',
    '### Data to unify',
    bulletList(report.knowledgeLayerRationale.dataToUnify),
    '',
    '## ROI talking points',
    bulletList(report.roiTalkingPoints),
    '',
    '## Objections and rebuttals',
    ...report.objectionsAndRebuttals.flatMap((item, index) => [
      `### ${index + 1}. ${item.objection}`,
      item.rebuttal,
      '',
    ]),
    '## Discovery questions',
    bulletList(report.discoveryQuestions),
    '',
    '## Opening angle',
    report.openingAngle,
    '',
    '## Confidence notes',
    bulletList(confidenceNotes),
  ];

  return lines.filter(Boolean).join('\n');
}

function bulletList(items: string[]) {
  if (!items.length) return '- None';
  return items.map((item) => `- ${item}`).join('\n');
}

function bulletMap(values: Record<string, string | undefined>) {
  return Object.entries(values)
    .filter(([, value]) => value && value.trim())
    .map(([key, value]) => `- **${key}:** ${value}`)
    .join('\n');
}
