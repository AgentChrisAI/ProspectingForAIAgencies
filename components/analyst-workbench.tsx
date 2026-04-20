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
        <div>
          <span className={styles.kicker}>Sunburnt AI internal sales ops</span>
          <h1>Prospect intelligence in. Sharp recommendation brief out.</h1>
          <p>
            Give the app a prospect, a website, and context. It scrapes the public site, digests the business,
            then maps fit against the Sunburnt sales guide and product catalogue.
          </p>
        </div>
        <div className={styles.heroCard}>
          <h2>Knowledge loaded</h2>
          <ul>
            <li>{knowledgeSummary.industries} industry playbooks</li>
            <li>{knowledgeSummary.products} catalogue products</li>
            <li>{knowledgeSummary.stacks} prebuilt stack deals</li>
            <li>{tierSummary.join(' · ')}</li>
          </ul>
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
        </div>
      </section>

      <section className={styles.stackLayout}>
        <form className={styles.panel} onSubmit={handleSubmit}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.step}>01 · Intake</span>
              <h2>Prospect brief</h2>
            </div>
            <p>Built for speed on a live sales call. Optional fields still improve the brief.</p>
          </div>

          <div className={styles.formGrid}>
            <Field label="Company name" required>
              <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </Field>
            <Field label="Website URL" required>
              <input placeholder="https://example.com" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
            </Field>
            <Field label="Contact name">
              <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            </Field>
            <Field label="Role / title">
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </Field>
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
            <Field label="Extra notes" full>
              <textarea rows={5} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={loading}>
              {loading ? 'Running analysis…' : 'Analyze prospect'}
            </button>
            <p>
              API key stays server-side. Website extraction is heuristic v1: raw HTML fetch + text extraction from public pages.
            </p>
          </div>
          {error ? <div className={styles.error}>{error}</div> : null}
        </form>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.step}>02 · Brief</span>
              <h2>Recommendation brief</h2>
            </div>
            <p>Structured for discovery calls, follow-up emails, and proposal prep.</p>
          </div>

          {!result ? (
            <div className={styles.emptyState}>
              <h3>Nothing analyzed yet.</h3>
              <p>
                Run an analysis to see the website digest, recommended stack, objections, ROI talk tracks, and
                opening angle.
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

function Report({ result }: { result: AnalysisResponse }) {
  const { extraction, digest, report, metadata } = result;
  const confidenceNotes = [...digest.caveats, ...report.confidenceNotes];

  return (
    <div className={styles.report}>
      <div className={styles.callout}>
        <strong>{report.executiveSummary}</strong>
        <span>
          Generated in {(metadata.durationMs / 1000).toFixed(1)}s · digest {metadata.digestModel} ({metadata.digestSource}, {metadata.digestAttempts} attempt{metadata.digestAttempts === 1 ? '' : 's'}) · reasoning{' '}
          {metadata.reasoningModel} ({metadata.reasoningSource}, {metadata.reasoningAttempts} attempt{metadata.reasoningAttempts === 1 ? '' : 's'})
        </span>
      </div>

      {metadata.digestSource === 'fallback' ? (
        <div className={styles.warning}>
          Digest model output was unusable, so the app switched to a conservative heuristic digest before running reasoning.
        </div>
      ) : null}

      <ReportSection title="Website snapshot">
        <ul>
          <li><strong>Title:</strong> {extraction.title}</li>
          <li><strong>Final URL:</strong> {extraction.finalUrl}</li>
          <li><strong>Description:</strong> {extraction.description || 'No meta description found'}</li>
        </ul>
        {extraction.warnings.length ? (
          <div className={styles.warning}>{extraction.warnings.join(' ')}</div>
        ) : null}
      </ReportSection>

      <ReportSection title="Digest">
        <p>{digest.companySnapshot}</p>
        <List items={digest.websiteSummary} />
      </ReportSection>

      <DualSection leftTitle="Signals" leftItems={digest.signals} rightTitle="Likely pain points" rightItems={report.keyPainPoints} />
      <DualSection leftTitle="Buying signals" leftItems={digest.buyingSignals} rightTitle="Discovery questions" rightItems={report.discoveryQuestions} />

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
            <article key={`${item.productName}-${item.positionedName}`} className={styles.productCard}>
              <div className={styles.productHeader}>
                <div>
                  <h3>{item.positionedName}</h3>
                  <span>{item.tier} · source: {item.source}</span>
                </div>
                <code className={styles.productMeta}>Catalogue: {item.productName}</code>
              </div>

              <div className={styles.productHighlights}>
                <div>
                  <strong>Outcome</strong>
                  <p>{item.outcomeSummary}</p>
                </div>
                <div>
                  <strong>Industry application</strong>
                  <p>{item.industryApplication}</p>
                </div>
              </div>

              <ul className={styles.productBullets}>
                <li><strong>Why it fits:</strong> {item.whyItFits}</li>
                <li><strong>Expected impact:</strong> {item.expectedImpact}</li>
              </ul>
            </article>
          ))}
        </div>
      </ReportSection>

      <DualSection
        leftTitle="Knowledge Layer rationale"
        leftItems={report.knowledgeLayerRationale.dataToUnify}
        rightTitle="ROI talking points"
        rightItems={report.roiTalkingPoints}
        rightBody={report.knowledgeLayerRationale.valueNarrative}
      />

      <ReportSection title="Recommended stack">
        <h3>{report.recommendedStack.name}</h3>
        <p>{report.recommendedStack.rationale}</p>
        <p><strong>Rollout:</strong> {report.recommendedStack.rollout}</p>
        <List items={report.recommendedStack.implementationPhases} />
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

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.reportSection}>
      <h3>{title}</h3>
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
  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}
