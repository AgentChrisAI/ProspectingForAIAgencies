import { z } from 'zod';

export type ProspectInput = {
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

export type WebsiteExtraction = {
  finalUrl: string;
  title: string;
  description: string;
  text: string;
  textPreview: string;
  method: 'fetch-html';
  warnings: string[];
};

const confidenceSchema = z.enum(['low', 'medium', 'high']);

export const digestResultSchema = z.object({
  companySnapshot: z.string().min(1),
  inferredIndustry: z.object({
    label: z.string().min(1),
    confidence: confidenceSchema,
    reasoning: z.string().min(1),
  }),
  websiteSummary: z.array(z.string().min(1)).min(1),
  signals: z.array(z.string().min(1)),
  likelyPainPoints: z.array(z.string().min(1)),
  dataNeeds: z.array(z.string().min(1)),
  buyingSignals: z.array(z.string().min(1)),
  caveats: z.array(z.string().min(1)),
});

export type DigestResult = z.infer<typeof digestResultSchema>;

export const recommendationReportSchema = z.object({
  executiveSummary: z.string().min(1),
  companySnapshot: z.array(z.string().min(1)).min(1),
  inferredIndustry: z.object({
    label: z.string().min(1),
    confidence: confidenceSchema,
    reasoning: z.string().min(1),
  }),
  keyPainPoints: z.array(z.string().min(1)).min(1),
  diagnosis: z.object({
    data: z.array(z.string().min(1)),
    process: z.array(z.string().min(1)),
    communication: z.array(z.string().min(1)),
    capacity: z.array(z.string().min(1)),
  }),
  recommendedProducts: z.array(
    z.object({
      productName: z.string().min(1),
      positionedName: z.string().min(1),
      tier: z.string().min(1),
      outcomeSummary: z.string().min(1),
      industryApplication: z.string().min(1),
      whyItFits: z.string().min(1),
      expectedImpact: z.string().min(1),
      source: z.enum(['catalogue', 'sales-guide']),
    })
  ).min(1),
  recommendedStack: z.object({
    name: z.string().min(1),
    rollout: z.string().min(1),
    rationale: z.string().min(1),
    implementationPhases: z.array(z.string().min(1)).min(1),
  }),
  knowledgeLayerRationale: z.object({
    dataToUnify: z.array(z.string().min(1)),
    valueNarrative: z.string().min(1),
  }),
  roiTalkingPoints: z.array(z.string().min(1)),
  objectionsAndRebuttals: z.array(
    z.object({
      objection: z.string().min(1),
      rebuttal: z.string().min(1),
    })
  ),
  discoveryQuestions: z.array(z.string().min(1)),
  openingAngle: z.string().min(1),
  confidenceNotes: z.array(z.string().min(1)),
});

export type RecommendationReport = z.infer<typeof recommendationReportSchema>;

export type ModelStageSource = 'model' | 'retry' | 'fallback';
export type JsonExtractionStrategy = 'direct' | 'fence-stripped' | 'object-extracted';

export type AnalysisResponse = {
  input: ProspectInput;
  extraction: WebsiteExtraction;
  digest: DigestResult;
  report: RecommendationReport;
  metadata: {
    digestModel: string;
    reasoningModel: string;
    durationMs: number;
    generatedAt: string;
    digestSource: ModelStageSource;
    digestAttempts: number;
    digestJsonStrategy: JsonExtractionStrategy | 'heuristic';
    reasoningSource: Exclude<ModelStageSource, 'fallback'>;
    reasoningAttempts: number;
    reasoningJsonStrategy: JsonExtractionStrategy;
  };
};
