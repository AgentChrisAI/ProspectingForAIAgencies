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

const demoProspect = {
  companyName: 'Acme Dental Group',
  websiteUrl: 'https://www.acmedentalgroup.com',
  contactName: 'Sarah Nguyen',
  role: 'Operations Director',
  industry: 'Dental clinics',
  teamSize: '45 staff across 3 locations',
  revenue: '$8M-$15M',
  location: 'Brisbane',
  currentTools: 'Cliniko, Xero, Google Workspace, manual enquiry triage',
  painPoints: 'Lead follow-up inconsistency, front-desk overload, fragmented reporting, no unified patient enquiry pipeline.',
  notes: 'Discovery call tomorrow. Likely interested in growth efficiency, admin load reduction, and better conversion from web enquiries.',
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
    () =>
      Object.entries(knowledgeSummary.tierCounts)
        .map(([tier, count]) => `${tier} ${count}`)
        .join(' · '),
    [knowledgeSummary.tierCounts]
  );

  const hasFilledCore = Boolean(form.companyName || form.websiteUrl || form.contactName || form.role || form.painPoints);

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
      <section className={styles.topbar}>
        <div>
          <span className={styles.kicker}>Sunburnt AI · prospect operator</span>
          <h1>Prospect brief in. Sales-ready recommendation out.</h1>
          <p>
            A disciplined internal workspace for turning public-site signal and call context into a tighter sales brief,
            clearer angle, and a more credible next step.
          </p>
        </div>

        <div className={styles.topbarMeta}>
          <div className={styles.topbarCard}>
            <span>Knowledge coverage</span>
            <strong>{knowledgeSummary.industries} verticals</strong>
            <small>{knowledgeSummary.products + knowledgeSummary.stacks} products and stacks mapped</small>
          </div>
          <div className={styles.topbarCard}>
            <span>Operating mode</span>
            <strong>Summary first</strong>
            <small>Built for discovery calls, follow-up emails, and proposal prep</small>
          </div>
        </div>
      </section>

      <section className={styles.workspaceGrid}>
        <form className={styles.intakePanel} onSubmit={handleSubmit}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.step}>01 · Intake</span>
              <h2>Build the brief</h2>
              <p>Start with essentials. Add more context only when it sharpens the recommendation.</p>
            </div>
            <div className={styles.panelBadge}>Operator workspace</div>
          </div>

          <div className={styles.intakeIntro}>
            <div className={styles.intakeIntroPrimary}>
              <strong>Fastest useful path</strong>
              <p>Company, website, buyer, and one line of deal context are enough for a strong first pass.</p>
            </div>
            <button type="button" className={styles.secondaryButton} onClick={() => setForm(demoProspect)}>
              Load demo prospect
            </button>
          </div>

          <FormSection
            title="Core inputs"
            description="The minimum required to create a credible recommendation brief."
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
              <Field label="Primary contact">
                <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              </Field>
              <Field label="Role / title">
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </Field>
              <Field label="What matters in this deal?" full>
                <textarea
                  rows={4}
                  placeholder="Main pain, commercial angle, or what the rep wants to validate on the call."
                  value={form.painPoints}
                  onChange={(e) => setForm({ ...form, painPoints: e.target.value })}
                />
              </Field>
            </div>
          </FormSection>

          <details className={styles.disclosure}>
            <summary>
              <div>
                <strong>More context</strong>
                <span>Optional qualifiers for tighter product fit, objections, and ROI framing.</span>
              </div>
              <span className={styles.disclosureToggle}>Expand</span>
            </summary>

            <div className={styles.disclosureBody}>
              <div className={styles.formGrid}>
                <Field label="Industry hint">
                  <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
                </Field>
                <Field label="Location">
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </Field>
                <Field label="Team size">
                  <input value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} />
                </Field>
                <Field label="Revenue band">
                  <input value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} />
                </Field>
                <Field label="Current tools" full>
                  <textarea
                    rows={3}
                    value={form.currentTools}
                    onChange={(e) => setForm({ ...form, currentTools: e.target.value })}
                  />
                </Field>
                <Field label="Operator notes" full>
                  <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </Field>
              </div>
            </div>
          </details>

          <div className={styles.actions}>
            <button type="submit" disabled={loading} className={styles.primaryButton}>
              {loading ? 'Running analysis…' : 'Generate recommendation brief'}
            </button>
            <div className={styles.actionsMeta}>
              <p>Public website signal is analysed server-side. The output is structured for immediate sales use.</p>
              <span>{hasFilledCore ? 'Ready to run' : 'Enter a company and website to start'}</span>
            </div>
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}

          <div className={styles.systemStrip}>
            <div>
              <span>Playbooks</span>
              <strong>{knowledgeSummary.industries}</strong>
            </div>
            <div>
              <span>Catalogue</span>
              <strong>{knowledgeSummary.products}</strong>
            </div>
            <div>
              <span>Stacks</span>
              <strong>{knowledgeSummary.stacks}</strong>
            </div>
            <div>
              <span>Tier mix</span>
              <strong>{tierSummary}</strong>
            </div>
          </div>
        </form>

        <section className={styles.outputPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.step}>02 · Brief</span>
              <h2>Sales recommendation brief</h2>
              <p>Lead with the decision. Support it with signal, diagnosis, and execution detail underneath.</p>
            </div>
            <div className={styles.panelBadge}>{result ? 'Brief ready' : 'Demo preview'}</div>
          </div>

          {!result ? (
            <EmptyState
              knowledgeSummary={knowledgeSummary}
              onLoadDemo={() => setForm(demoProspect)}
              onClear={() => {
                setForm(defaultForm);
                setError('');
              }}
            />
          ) : (
            <Report result={result} />
          )}
        </section>
      </section>
    </main>
  );
}

function EmptyState({
  knowledgeSummary,
  onLoadDemo,
  onClear,
}: {
  knowledgeSummary: {
    industries: number;
    products: number;
    stacks: number;
    tierCounts: Record<string, number>;
    models: { digest: string; reasoning: string };
  };
  onLoadDemo: () => void;
  onClear: () => void;
}) {
  const proofPoints = [
    'Executive summary you can use immediately in a follow-up or live call.',
    'Recommended stack and products with commercial rationale, not generic AI fluff.',
    'Discovery questions, objections, ROI talking points, and opening angle in one pass.',
  ];

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyHero}>
        <div>
          <span className={styles.emptyEyebrow}>Before first run</span>
          <h3>Make the first screen sell the tool.</h3>
          <p>
            This workspace is designed to produce a sharp internal sales brief: what the buyer likely cares about, what
            Sunburnt should recommend, and how to advance the deal without improvising from scratch.
          </p>
        </div>
        <div className={styles.emptyActions}>
          <button type="button" className={styles.primaryButton} onClick={onLoadDemo}>
            Load demo prospect
          </button>
          <button type="button" className={styles.ghostButton} onClick={onClear}>
            Start clean
          </button>
        </div>
      </div>

      <div className={styles.proofGrid}>
        <div className={styles.proofCard}>
          <span>What comes out</span>
          <strong>Summary-first recommendation brief</strong>
          <ul className={styles.compactList}>
            {proofPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className={styles.proofCard}>
          <span>Why reps use it</span>
          <strong>Less blank-page thinking. More useful call control.</strong>
          <div className={styles.miniMetrics}>
            <div>
              <small>Coverage</small>
              <strong>{knowledgeSummary.industries} verticals</strong>
            </div>
            <div>
              <small>Knowledge base</small>
              <strong>{knowledgeSummary.products + knowledgeSummary.stacks} mapped assets</strong>
            </div>
            <div>
              <small>Output shape</small>
              <strong>Summary → stack → actions</strong>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.demoBrief}>
        <div className={styles.demoBriefHeader}>
          <div>
            <span className={styles.eyebrow}>Preview</span>
            <h4>Example output structure</h4>
          </div>
          <div className={styles.previewStatus}>Operator-grade brief</div>
        </div>

        <div className={styles.previewSummary}>
          <div className={styles.previewLead}>
            <span>Executive take</span>
            <strong>
              Multi-location service business showing fragmented intake and follow-up patterns; strongest initial angle is
              workflow unification, faster lead response, and cleaner reporting for operators.
            </strong>
          </div>
          <div className={styles.previewSideStats}>
            <div>
              <span>Recommended stack</span>
              <strong>Growth Ops Foundation</strong>
            </div>
            <div>
              <span>Likely buyer</span>
              <strong>Ops / GM / Owner</strong>
            </div>
            <div>
              <span>Confidence style</span>
              <strong>Commercial, evidence-led</strong>
            </div>
          </div>
        </div>

        <div className={styles.previewGrid}>
          <PreviewCard
            title="Top pain points"
            items={[
              'Lead response and admin handling depend on people, not system design.',
              'Front-office communication and reporting are likely fragmented across tools.',
              'Growth effort is leaking through slow follow-up and inconsistent qualification.',
            ]}
          />
          <PreviewCard
            title="Immediate rep utility"
            items={[
              'Suggested opening angle for the next conversation.',
              'Discovery questions targeted at process friction and lost revenue.',
              'Objection handling and ROI framing ready for follow-up.',
            ]}
          />
        </div>
      </div>
    </div>
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
  const { extraction, digest, report, metadata, input } = result;
  const confidenceNotes = [...digest.caveats, ...report.confidenceNotes];
  const topProducts = report.recommendedProducts.slice(0, 3);
  const nextActions = [
    report.openingAngle,
    ...report.discoveryQuestions.slice(0, 2),
    ...report.roiTalkingPoints.slice(0, 1),
  ].filter(Boolean);

  return (
    <div className={styles.report}>
      <section className={styles.summaryShell}>
        <div className={styles.summaryMain}>
          <span className={styles.eyebrow}>Executive summary</span>
          <h3>{input.companyName || extraction.title}</h3>
          <p className={styles.summaryText}>{report.executiveSummary}</p>

          <div className={styles.summaryMeta}>
            <div>
              <span>Industry fit</span>
              <strong>{report.inferredIndustry.label}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong className={styles.capitalized}>{report.inferredIndustry.confidence}</strong>
            </div>
            <div>
              <span>Runtime</span>
              <strong>{(metadata.durationMs / 1000).toFixed(1)}s</strong>
            </div>
          </div>
        </div>

        <div className={styles.summaryAside}>
          <div className={styles.summaryCard}>
            <span>Recommended stack</span>
            <strong>{report.recommendedStack.name}</strong>
            <p>{report.recommendedStack.rollout}</p>
          </div>
          <div className={styles.summaryCard}>
            <span>Best opening angle</span>
            <strong>{report.openingAngle}</strong>
          </div>
        </div>
      </section>

      <div className={styles.reportHighlights}>
        <InsightCard title="Key pain points" items={report.keyPainPoints.slice(0, 3)} />
        <InsightCard title="Recommended products" items={topProducts.map((item) => `${item.productName} — ${item.whyItFits}`)} />
        <InsightCard title="Next actions for the rep" items={nextActions.slice(0, 4)} />
      </div>

      {metadata.digestSource === 'fallback' ? (
        <div className={styles.warning}>
          Model digest output failed validation, so the system switched to a conservative heuristic digest before running
          reasoning.
        </div>
      ) : null}

      {extraction.warnings.length ? <div className={styles.warning}>{extraction.warnings.join(' ')}</div> : null}

      <div className={styles.detailGrid}>
        <div className={styles.detailColumn}>
          <ReportSection title="Company snapshot" intro="What the site and the generated digest suggest at a glance.">
            <p>{digest.companySnapshot}</p>
            <List items={report.companySnapshot} />
          </ReportSection>

          <ReportSection title="Website evidence" intro="Ground the recommendation in observable website signal.">
            <div className={styles.snapshotGrid}>
              <SnapshotItem label="Title" value={extraction.title} />
              <SnapshotItem label="Final URL" value={extraction.finalUrl} />
              <SnapshotItem label="Description" value={extraction.description || 'No meta description found'} wide />
            </div>
            <div className={styles.inlineSectionGrid}>
              <MiniSection title="Signals">
                <List items={digest.signals} />
              </MiniSection>
              <MiniSection title="Buying signals">
                <List items={digest.buyingSignals} />
              </MiniSection>
            </div>
          </ReportSection>

          <ReportSection title="Diagnosis" intro="Where the operational friction likely sits.">
            <div className={styles.diagnosisGrid}>
              <DiagnosisCard title="Data" items={report.diagnosis.data} />
              <DiagnosisCard title="Process" items={report.diagnosis.process} />
              <DiagnosisCard title="Communication" items={report.diagnosis.communication} />
              <DiagnosisCard title="Capacity" items={report.diagnosis.capacity} />
            </div>
          </ReportSection>

          <ReportSection title="Discovery and objections" intro="Use this to control the next conversation more deliberately.">
            <div className={styles.inlineSectionGrid}>
              <MiniSection title="Discovery questions">
                <List items={report.discoveryQuestions} />
              </MiniSection>
              <MiniSection title="Objections and rebuttals">
                <div className={styles.objections}>
                  {report.objectionsAndRebuttals.map((item, index) => (
                    <div key={`${item.objection}-${index}`} className={styles.objectionItem}>
                      <strong>{item.objection}</strong>
                      <p>{item.rebuttal}</p>
                    </div>
                  ))}
                </div>
              </MiniSection>
            </div>
          </ReportSection>
        </div>

        <aside className={styles.sideColumn}>
          <ReportSection title="Recommended stack" intro="The main packaging recommendation for this account.">
            <div className={styles.stackCard}>
              <strong>{report.recommendedStack.name}</strong>
              <p>{report.recommendedStack.rationale}</p>
              <List items={report.recommendedStack.implementationPhases} />
            </div>
          </ReportSection>

          <ReportSection title="Recommended products" intro="Products to anchor the recommendation and why they fit.">
            <div className={styles.productList}>
              {report.recommendedProducts.map((item) => (
                <article key={item.productName} className={styles.productCard}>
                  <div className={styles.productCardTop}>
                    <h3>{item.productName}</h3>
                    <span>
                      {item.tier} · {item.source}
                    </span>
                  </div>
                  <p>{item.whyItFits}</p>
                  <strong>{item.expectedImpact}</strong>
                </article>
              ))}
            </div>
          </ReportSection>

          <ReportSection title="ROI and rationale" intro="Commercial framing for why the recommendation matters.">
            <MiniSection title="ROI talking points">
              <List items={report.roiTalkingPoints} />
            </MiniSection>
            <MiniSection title="Knowledge layer rationale">
              <p>{report.knowledgeLayerRationale.valueNarrative}</p>
              <List items={report.knowledgeLayerRationale.dataToUnify} />
            </MiniSection>
          </ReportSection>

          <ReportSection title="Confidence notes" intro="Use these as risk framing, not as excuses.">
            {confidenceNotes.length ? <List items={confidenceNotes} /> : <p className={styles.mutedCopy}>No major caveats flagged.</p>}
            <div className={styles.metaNote}>
              Generated in {(metadata.durationMs / 1000).toFixed(1)}s · digest {metadata.digestSource},{' '}
              {metadata.digestAttempts} attempt{metadata.digestAttempts === 1 ? '' : 's'} · reasoning {metadata.reasoningSource},{' '}
              {metadata.reasoningAttempts} attempt{metadata.reasoningAttempts === 1 ? '' : 's'}
            </div>
          </ReportSection>
        </aside>
      </div>
    </div>
  );
}

function PreviewCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className={styles.previewCard}>
      <strong>{title}</strong>
      <ul className={styles.compactList}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function InsightCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className={styles.insightCard}>
      <span>{title}</span>
      <ul className={styles.compactList}>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
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

function ReportSection({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.reportSection}>
      <div className={styles.reportSectionHeader}>
        <h3>{title}</h3>
        {intro ? <p>{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}

function MiniSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.miniSection}>
      <strong>{title}</strong>
      {children}
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
