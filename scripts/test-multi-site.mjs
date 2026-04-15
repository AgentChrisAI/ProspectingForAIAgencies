#!/usr/bin/env node

const baseUrl = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

const prospects = [
  {
    companyName: 'ServiceM8',
    websiteUrl: 'https://www.servicem8.com',
    industry: 'Field services software',
    notes: 'Test harness case: SaaS platform serving tradies and service businesses.',
  },
  {
    companyName: 'HubSpot',
    websiteUrl: 'https://www.hubspot.com',
    industry: 'CRM / marketing software',
    notes: 'Test harness case: broader SaaS / RevOps style company.',
  },
  {
    companyName: 'Jim’s Mowing',
    websiteUrl: 'https://www.jimsmowing.com.au',
    industry: 'Home services / franchise network',
    notes: 'Test harness case: service business with strong lead capture cues.',
  },
];

async function runCase(prospect) {
  const response = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prospect),
  });

  const payload = await response.json().catch(() => ({}));

  return {
    companyName: prospect.companyName,
    websiteUrl: prospect.websiteUrl,
    status: response.status,
    ok: response.ok,
    summary: response.ok
      ? {
          executiveSummary: payload.report?.executiveSummary,
          digestSource: payload.metadata?.digestSource,
          digestAttempts: payload.metadata?.digestAttempts,
          reasoningSource: payload.metadata?.reasoningSource,
          reasoningAttempts: payload.metadata?.reasoningAttempts,
          inferredIndustry: payload.report?.inferredIndustry?.label,
          extractionWarnings: payload.extraction?.warnings ?? [],
        }
      : {
          error: payload.error || 'Unknown failure',
          details: payload.details || [],
        },
  };
}

async function main() {
  console.log(`Running Sunburnt Sales multi-site harness against ${baseUrl}`);
  const results = [];

  for (const prospect of prospects) {
    console.log(`→ ${prospect.companyName} (${prospect.websiteUrl})`);
    const result = await runCase(prospect);
    results.push(result);
    console.log(JSON.stringify(result, null, 2));
  }

  const failures = results.filter((result) => !result.ok);
  console.log('\n=== Harness summary ===');
  console.log(JSON.stringify({
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    results,
  }, null, 2));

  if (failures.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Harness failed to run:', error);
  process.exit(1);
});
