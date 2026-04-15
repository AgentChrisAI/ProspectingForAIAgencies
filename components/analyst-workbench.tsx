"use client";

import { useMemo, useState } from 'react';
import type { AnalysisResponse } from '@/lib/types';
import styles from '@/components/workbench.module.css';

const defaultForm = {
  companyName: '',
  websiteUrl: '',
  contactName: '',
  role: '',
  industry: '',
  teamSize: '',
  revenue: '',
  location: '',
  currentTools: '',
  painPoints: '',
  notes: '',
};

export function AnalystWorkbench({
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
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const tierSummary = useMemo(
    () => Object.entries(knowledgeSummary.tierCounts).map(([tier, count]) => `${tier}: ${count}`),
    [knowledgeSummary.tierCounts]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        const detailText = Array.isArray(data.details) && data.details.length ? ` ${data.details.join(' ')}` : '';
        throw new Error((data.error || 'Analysis failed.') + detailText);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.kicker}>Sunburnt AI internal sales ops</span>
          <h1>Clearer prospect intelligence. Faster recommendation output.</h1>
          <p>
            Capture a prospect, scrape the public site, and turn the signal into a structured recommendation brief
            built for live calls, follow-ups, and proposal prep.
          </p>
          <div className={styles.heroMetaRow}>
            <div className={styles.heroMetric}>
              <span>Knowledge base</span>
              <strong>{knowledgeSummary.products + knowledgeSummary.stacks}</strong>
              <small>products + stacks ready</small>
            </div>
            <div className={styles.heroMetric}>
              <span>Coverage</span>
              <strong>{knowledgeSummary.industries}</strong>
              <small>industry playbooks loaded</small>
            </div>
            <div className={styles.heroMetric}>
              <span>Workflow</span>
              <strong>2-step</strong>
              <small>intake left, decision brief right</small>
            </div>
          </div>
        </div>

        <aside className={styles.heroCard}>
          <div className={styles.heroCardHeader}>
            <div>
              <span className={styles.eyebrow}>Knowledge loaded</span>
              <h2>Analysis environment</h2>
            </div>
            <p>Lean, operator-focused context for fast prospect triage.</p>
          </div>

          <div className={styles.heroInfoList}>
            <div>
              <span>Industry playbooks</span>
              <strong>{knowledgeSummary.industries}</strong>
            </div>
            <div>
              <span>Catalogue products</span>
              <strong>{knowledgeSummary.products}</strong>
            </div>
            <div>
              <span>Prebuilt stacks</span>
              <strong>{knowledgeSummary.stacks}</strong>
            </div>
            <div>
              <span>Tier mix</span>
              <strong>{tierSummary.join(' · ')}</strong>
            </div>
          </div>

          <div className={styles.modelGrid}>
            <div>
              <span>Digest model</span>
              <strong>{knowledgeSummary.models.digest}</strong>
            </div>
            <div>
              <span>Reasoning model</span>
              <strong>{knowledgeSummary.models.reasoning}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.grid}>
        <form className={styles.panel} onSubmit={handleSubmit}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.step}>01 · Intake</span>
              <h2>Prospect brief</h2>
              <p>Enough structure for consistency, enough speed for a live call.</p>
            </div>
            <div className={styles.panelBadge}>Input workspace</div>
          </div>

          <FormSection
            title="Core details"
            description="The minimum needed to run a useful pass."
          >
            <div className={styles.formGrid}>
              <Field label="Company name" required>
                <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </Field>
              <Field label="Website URL" required>
                <input
                  placeholder="https://example.com"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                />
              </Field>
              <Field label="Contact name">
                <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              </Field>
              <Field label="Role / title">
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Business context"
            description="Soft qualifiers that sharpen product fit, objections, and ROI framing."
          >
            <div className={styles.formGrid}>
              <Field label="Industry hint">
                <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </Field>
              <Field label="Team size">
                <input value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} />
              </Field>
              <Field label="Revenue band">
                <input value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} />
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </Field>
              <Field label="Current tools" full>
                <textarea rows={3} value={form.currentTools} onChange={(e) => setForm({ ...form, currentTools: e.target.value })} />
              </Field>
              <Field label="Pain points" full>
                <textarea rows={4} value={form.painPoints} onChange={(e) => setForm({ ...form, painPoints: e.target.value })} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Operator notes" description="Loose context, deal colour, or constraints worth preserving.">
            <div className={styles.formGrid}>
              <Field label="Extra notes" full>
                <textarea rows={5} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>
          </FormSection>

          <div className={styles.actions}>
            <button type="submit" disabled={loading}>
              {loading ? 'Running analysis…' : 'Analyze prospect'}
            </button>
            <p>
              API key stays server-side. Extraction uses public-page scraping and heuristic text digestion.
            </p>
          </div>
          {error ? <div className={styles.error}>{error}</div> : null}
        </form>

        <section className={`${styles.panel} ${styles.outputPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.step}>02 · Output</span>
              <h2>Recommendation report</h2>
              <p>Organised to support discovery, qualification, and next-step positioning.</p>
            </div>
            <div className={styles.panelBadge}>{result ? 'Analysis ready' : 'Awaiting run'}</div>
          </div>

          {!result ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyEyebrow}>Report canvas</span>
              <h3>No analysis yet.</h3>
              <p>
                Run a prospect to populate the website digest, buying signals, recommended stack, objections, ROI
                framing, and opening angle.
              </p>
            </div>
          ) : (
            <Report result={result} />
          )}
        </section>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
  required,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={`${styles.field} ${full ? styles.full : ''}`}>
      <span>
        {label} {required ? <em>*</em> : null}
      </span>
      {children}
    </label>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.formSection}>
      <div className={styles.formSectionHeader}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

function Report({ result }: { result: AnalysisResponse }) {
  const { extraction, digest, report, metadata } = result;
  const confidenceNotes = [...digest.caveats, ...report.confidenceNotes];
  const reportStats = [
    { label: 'Industry fit', value: report.inferredIndustry.label },
    { label: 'Confidence', value: report.inferredIndustry.confidence },
    { label: 'Products', value: String(report.recommendedProducts.length) },
    { label: 'Runtime', value: `${(metadata.durationMs / 1000).toFixed(1)}s` },
  ];

  return (
    <div className={styles.report}>
      <div className={styles.callout}>
        <div>
          <span className={styles.eyebrow}>Executive summary</span>
          <strong>{report.executiveSummary}</strong>
        </div>
        <span>
          Generated in {(metadata.durationMs / 1000).toFixed(1)}s · digest {metadata.digestModel} ({metadata.digestSource},{' '}
          {metadata.digestAttempts} attempt{metadata.digestAttempts === 1 ? '' : 's'}) · reasoning {metadata.reasoningModel}{' '}
          ({metadata.reasoningSource}, {metadata.reasoningAttempts} attempt{metadata.reasoningAttempts === 1 ? '' : 's'})
        </span>
      </div>

      <div className={styles.statsGrid}>
        {reportStats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      {metadata.digestSource === 'fallback' ? (
        <div className={styles.warning}>
          Digest model output was unusable, so the app switched to a conservative heuristic digest before running reasoning.
        </div>
      ) : null}

      <ReportSection title="Website snapshot">
        <div className={styles.snapshotGrid}>
          <SnapshotItem label="Title" value={extraction.title} />
          <SnapshotItem label="Final URL" value={extraction.finalUrl} />
          <SnapshotItem label="Description" value={extraction.description || 'No meta description found'} wide />
        </div>
        {extraction.warnings.length ? <div className={styles.warning}>{extraction.warnings.join(' ')}</div> : null}
      </ReportSection>

      <ReportSection title="Digest">
        <p>{digest.companySnapshot}</p>
        <List items={digest.websiteSummary} />
      </ReportSection>

      <DualSection
        leftTitle="Signals"
        leftItems={digest.signals}
        rightTitle="Likely pain points"
        rightItems={report.keyPainPoints}
      />
      <DualSection
        leftTitle="Buying signals"
        leftItems={digest.buyingSignals}
        rightTitle="Discovery questions"
        rightItems={report.discoveryQuestions}
      />

      <ReportSection title="Industry fit">
        <p>
          <strong>{report.inferredIndustry.label}</strong> · {report.inferredIndustry.confidence} confidence
        </p>
        <p>{report.inferredIndustry.reasoning}</p>
      </ReportSection>

      <ReportSection title="Diagnosis">
        <div className={styles.diagnosisGrid}>
          <DiagnosisCard title="Data" items={report.diagnosis.data} />
          <DiagnosisCard title="Process" items={report.diagnosis.process} />
          <DiagnosisCard title="Communication" items={report.diagnosis.communication} />
          <DiagnosisCard title="Capacity" items={report.diagnosis.capacity} />
        </div>
      </ReportSection>

      <ReportSection title="Recommended products">
        <div className={styles.productList}>
          {report.recommendedProducts.map((item) => (
            <article key={item.productName} className={styles.productCard}>
              <div className={styles.productCardHeader}>
                <div>
                  <h3>{item.productName}</h3>
                  <p>{item.whyItFits}</p>
                </div>
                <span>
                  {item.tier} · {item.source}
                </span>
              </div>
              <strong>{item.expectedImpact}</strong>
            </article>
          ))}
        </div>
      </ReportSection>

      <DualSection
        leftTitle="Knowledge layer rationale"
        leftItems={report.knowledgeLayerRationale.dataToUnify}
        rightTitle="ROI talking points"
        rightItems={report.roiTalkingPoints}
        rightBody={report.knowledgeLayerRationale.valueNarrative}
      />

      <ReportSection title="Recommended stack">
        <div className={styles.stackCard}>
          <div>
            <span className={styles.eyebrow}>Recommended stack</span>
            <h3>{report.recommendedStack.name}</h3>
          </div>
          <p>{report.recommendedStack.rationale}</p>
          <p>
            <strong>Rollout:</strong> {report.recommendedStack.rollout}
          </p>
          <List items={report.recommendedStack.implementationPhases} />
        </div>
      </ReportSection>

      <ReportSection title="Objections and rebuttals">
        <div className={styles.objections}>
          {report.objectionsAndRebuttals.map((item, index) => (
            <div key={`${item.objection}-${index}`} className={styles.objectionItem}>
              <strong>{item.objection}</strong>
              <p>{item.rebuttal}</p>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection title="Suggested opening angle">
        <p>{report.openingAngle}</p>
      </ReportSection>

      {confidenceNotes.length ? (
        <ReportSection title="Confidence notes / caveats">
          <List items={confidenceNotes} />
        </ReportSection>
      ) : null}
    </div>
  );
}

function SnapshotItem({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`${styles.snapshotItem} ${wide ? styles.snapshotWide : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.reportSection}>
      <div className={styles.reportSectionHeader}>
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function DualSection({
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
  rightBody,
}: {
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
  rightBody?: string;
}) {
  return (
    <div className={styles.dualGrid}>
      <ReportSection title={leftTitle}>
        <List items={leftItems} />
      </ReportSection>
      <ReportSection title={rightTitle}>
        {rightBody ? <p>{rightBody}</p> : null}
        <List items={rightItems} />
      </ReportSection>
    </div>
  );
}

function DiagnosisCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className={styles.diagnosisCard}>
      <strong>{title}</strong>
      <List items={items} />
    </article>
  );
}

function List({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className={styles.mutedCopy}>No strong signals captured for this section yet.</p>;
  }

  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}
