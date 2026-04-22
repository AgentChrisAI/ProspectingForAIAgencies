"use client";

import { useEffect, useMemo, useState } from 'react';
import type { AnalysisResponse } from '@/lib/types';
import { buildBriefMarkdown } from '@/lib/export-markdown';
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

const progressStages = [
  { label: 'Preparing intake', target: 16 },
  { label: 'Scraping website', target: 36 },
  { label: 'Building digest', target: 58 },
  { label: 'Generating recommendation brief', target: 82 },
  { label: 'Finalizing output', target: 96 },
] as const;

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
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState<string>('');
  const [editorNotes, setEditorNotes] = useState('');

  const tierSummary = useMemo(
    () => Object.entries(knowledgeSummary.tierCounts).map(([tier, count]) => `${tier}: ${count}`),
    [knowledgeSummary.tierCounts]
  );

  const progressStage = useMemo(() => {
    return progressStages.findLast((stage) => progress >= stage.target) ?? progressStages[0];
  }, [progress]);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 96) return current;

        const nextTarget = progressStages.find((stage) => stage.target > current)?.target ?? 96;
        const step = current < 36 ? 4 : current < 58 ? 3 : current < 82 ? 2 : 1;
        return Math.min(current + step, nextTarget);
      });
    }, 520);

    return () => window.clearInterval(interval);
  }, [loading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setCopied('');
    setProgress(8);

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

      setProgress(100);
      setResult(data);
      setEditorNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
      setResult(null);
    } finally {
      window.setTimeout(() => {
        setLoading(false);
      }, 350);
    }
  }

  async function copyToClipboard(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('Copy failed');
      window.setTimeout(() => setCopied(''), 1800);
    }
  }

  function handleExportMarkdown() {
    if (!result) return;

    const fileName = `${slugify(form.companyName || 'prospect-brief')}-brief.md`;
    downloadTextFile(fileName, buildBriefMarkdown(form, result, editorNotes), 'text/markdown;charset=utf-8');
  }

  function handleExportPdf() {
    if (!result) return;
    window.print();
  }

  const briefMarkdown = result ? buildBriefMarkdown(form, result, editorNotes) : '';

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
            <div className={styles.actionBar}>
              <button type="submit" disabled={loading}>
                {loading ? 'Running analysis…' : 'Analyze prospect'}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={handleExportMarkdown} disabled={!result || loading}>
                Export markdown
              </button>
              <button type="button" className={styles.secondaryButton} onClick={handleExportPdf} disabled={!result || loading}>
                Export PDF
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => result && copyToClipboard('Brief copied', briefMarkdown)}
                disabled={!result || loading}
              >
                Copy brief
              </button>
            </div>
            <p>
              API key stays server-side. Website extraction is heuristic v1: raw HTML fetch + text extraction from public pages.
            </p>
            {copied ? <div className={styles.notice}>{copied}</div> : null}
          </div>
          {loading ? <ProgressPanel progress={progress} stage={progressStage.label} /> : null}
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
            <Report
              result={result}
              editorNotes={editorNotes}
              onEditorNotesChange={setEditorNotes}
              onExportMarkdown={handleExportMarkdown}
              onExportPdf={handleExportPdf}
              onCopy={() => copyToClipboard('Brief copied', briefMarkdown)}
              onCopySection={copyToClipboard}
            />
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

function ProgressPanel({ progress, stage }: { progress: number; stage: string }) {
  return (
    <div className={styles.progressPanel}>
      <div className={styles.progressHeader}>
        <strong>Analysis in progress</strong>
        <span>{Math.min(progress, 100)}%</span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressBar} style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      <div className={styles.progressMeta}>
        <span className={styles.pulseDot} />
        <span>{stage}</span>
      </div>
      <ul className={styles.progressStages}>
        {progressStages.map((item) => (
          <li key={item.label} className={progress >= item.target ? styles.progressStageActive : ''}>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Report({
  result,
  editorNotes,
  onEditorNotesChange,
  onExportMarkdown,
  onExportPdf,
  onCopy,
  onCopySection,
}: {
  result: AnalysisResponse;
  editorNotes: string;
  onEditorNotesChange: (value: string) => void;
  onExportMarkdown: () => void;
  onExportPdf: () => void;
  onCopy: () => void;
  onCopySection: (label: string, value: string) => void;
}) {
  const { extraction, digest, report, metadata, input } = result;
  const confidenceNotes = [...digest.caveats, ...report.confidenceNotes];

  const summaryStats = [
    { label: 'Industry', value: report.inferredIndustry.label },
    { label: 'Top pain', value: report.keyPainPoints[0] || 'Not specified' },
    { label: 'Best-fit stack', value: report.recommendedStack.name },
    { label: 'Opening angle', value: report.openingAngle },
  ];

  const sectionCopy = {
    products: report.recommendedProducts
      .map(
        (item, index) =>
          `${index + 1}. ${item.positionedName}\nOutcome: ${item.outcomeSummary}\nIndustry application: ${item.industryApplication}\nWhy it fits: ${item.whyItFits}\nExpected impact: ${item.expectedImpact}`
      )
      .join('\n\n'),
    objections: report.objectionsAndRebuttals
      .map((item, index) => `${index + 1}. ${item.objection}\n${item.rebuttal}`)
      .join('\n\n'),
    discovery: report.discoveryQuestions.map((item) => `- ${item}`).join('\n'),
    notes: editorNotes,
  };

  return (
    <div className={styles.report}>
      <div className={styles.stickyActions}>
        <span className={styles.statusPill}>Ready to export</span>
        <div className={styles.stickyButtons}>
          <button type="button" className={styles.secondaryButton} onClick={onCopy}>
            Copy brief
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onExportMarkdown}>
            Export markdown
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onExportPdf}>
            Export PDF
          </button>
        </div>
      </div>

      <div className={styles.callout}>
        <strong>{report.executiveSummary}</strong>
        <span>
          Generated in {(metadata.durationMs / 1000).toFixed(1)}s · digest {metadata.digestModel} ({metadata.digestSource}, {metadata.digestAttempts} attempt{metadata.digestAttempts === 1 ? '' : 's'}) · reasoning{' '}
          {metadata.reasoningModel} ({metadata.reasoningSource}, {metadata.reasoningAttempts} attempt{metadata.reasoningAttempts === 1 ? '' : 's'})
        </span>
      </div>

      <section className={styles.summaryStrip}>
        {summaryStats.map((item) => (
          <article key={item.label} className={styles.summaryCard}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      {metadata.digestSource === 'fallback' ? (
        <div className={styles.warning}>
          Digest model output was unusable, so the app switched to a conservative heuristic digest before running reasoning.
        </div>
      ) : null}

      <EditableNotesCard value={editorNotes} onChange={onEditorNotesChange} onCopy={() => onCopySection('Notes copied', sectionCopy.notes)} />

      <ReportSection title="Prospect context">
        <ul className={styles.list}>
          <li><strong>Company:</strong> {input.companyName}</li>
          <li><strong>Website:</strong> {input.websiteUrl}</li>
          {input.contactName ? <li><strong>Contact:</strong> {input.contactName}</li> : null}
          {input.role ? <li><strong>Role:</strong> {input.role}</li> : null}
          {input.industry ? <li><strong>Industry hint:</strong> {input.industry}</li> : null}
        </ul>
      </ReportSection>

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
      <DualSection
        leftTitle="Buying signals"
        leftItems={digest.buyingSignals}
        rightTitle="Discovery questions"
        rightItems={report.discoveryQuestions}
        rightActions={
          <button type="button" className={styles.sectionButton} onClick={() => onCopySection('Discovery questions copied', sectionCopy.discovery)}>
            Copy section
          </button>
        }
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

      <ReportSection
        title="Recommended products"
        actions={
          <button type="button" className={styles.sectionButton} onClick={() => onCopySection('Recommended products copied', sectionCopy.products)}>
            Copy section
          </button>
        }
      >
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

      <ReportSection
        title="Objections and rebuttals"
        actions={
          <button type="button" className={styles.sectionButton} onClick={() => onCopySection('Objections copied', sectionCopy.objections)}>
            Copy section
          </button>
        }
      >
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

function EditableNotesCard({
  value,
  onChange,
  onCopy,
}: {
  value: string;
  onChange: (value: string) => void;
  onCopy: () => void;
}) {
  return (
    <section className={styles.editorCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h3>Editable recommendation notes</h3>
          <p>Add rep-specific context before copying or exporting the brief.</p>
        </div>
        <button type="button" className={styles.sectionButton} onClick={onCopy} disabled={!value.trim()}>
          Copy notes
        </button>
      </div>
      <textarea
        className={styles.editorTextarea}
        rows={6}
        placeholder="Add call prep notes, custom framing, pricing context, or deal strategy here..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}

function ReportSection({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className={styles.reportSection}>
      <div className={styles.sectionHeader}>
        <h3>{title}</h3>
        {actions ? <div>{actions}</div> : null}
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
  rightActions,
}: {
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
  rightBody?: string;
  rightActions?: React.ReactNode;
}) {
  return (
    <div className={styles.dualGrid}>
      <ReportSection title={leftTitle}>
        <List items={leftItems} />
      </ReportSection>
      <ReportSection title={rightTitle} actions={rightActions}>
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'prospect-brief';
}

function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
