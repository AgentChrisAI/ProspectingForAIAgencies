import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docsDir = path.join(root, 'docs');
const outDir = path.join(root, 'src', 'data');
fs.mkdirSync(outDir, { recursive: true });

function extractBetween(text, start, end) {
  const s = text.indexOf(start);
  if (s === -1) return null;
  const e = text.indexOf(end, s + start.length);
  if (e === -1) return null;
  return text.slice(s + start.length, e);
}

function extractProducts(html) {
  const block = extractBetween(html, 'const products = [', '];\n\n        const stacks = [');
  if (!block) throw new Error('Could not find products array in product catalogue HTML');
  const sanitized = `[${block}]`
    .replace(/\/\/.*$/gm, '')
    .replace(/,\s*]/g, ']');
  return Function(`"use strict"; return (${sanitized});`)();
}

function extractStacks(html) {
  const block = extractBetween(html, 'const stacks = [', '];\n\n        // Render Products');
  if (!block) throw new Error('Could not find stacks array in product catalogue HTML');
  const sanitized = `[${block}]`
    .replace(/\/\/.*$/gm, '')
    .replace(/,\s*]/g, ']');
  return Function(`"use strict"; return (${sanitized});`)();
}

function parseList(section, heading) {
  const match = section.match(new RegExp(`#### ${heading}\\n([\\s\\S]*?)(?:\\n#### |\\n### |$)`));
  if (!match) return [];
  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, '').replace(/\*\*/g, ''));
}

function parseTable(section, heading) {
  const match = section.match(new RegExp(`#### ${heading}\\n([\\s\\S]*?)(?:\\n#### |\\n### |$)`));
  if (!match) return [];
  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && !line.includes('---'))
    .slice(1)
    .map((line) => line.split('|').map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.length >= 2)
    .map(([objection, rebuttal]) => ({ objection, rebuttal }));
}

function parseParagraph(section, heading) {
  const match = section.match(new RegExp(`#### ${heading}\\n([\\s\\S]*?)(?:\\n#### |\\n### |$)`));
  return match ? match[1].trim() : '';
}

function parseIndustries(md) {
  const part = md.split('## SECTION 2:')[0];
  const matches = [...part.matchAll(/^###\s+\d+\.\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const title = match[1].trim();
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : part.length;
    const section = part.slice(start, end).trim();
    const bundleBlock = parseParagraph(section, 'Recommended Stack/Bundle');
    const bundleTitleMatch = bundleBlock.match(/\*\*(.+?)\*\*/);
    const bundleLines = bundleBlock.split('\n').map((line) => line.trim()).filter(Boolean);
    return {
      industry: title,
      painPoints: parseList(section, 'Top 5 Pain Points'),
      recommendedProducts: parseList(section, 'Top 5 Recommended Products'),
      terminology: parseList(section, 'Industry-Specific Language & Terminology'),
      objections: parseTable(section, 'Common Objections & Rebuttals'),
      roiExample: parseParagraph(section, 'Example ROI Calculation'),
      recommendedBundle: {
        name: bundleTitleMatch ? bundleTitleMatch[1] : bundleLines[0] || '',
        details: bundleLines.filter((line) => !line.startsWith('**')),
      },
    };
  });
}

const salesGuide = fs.readFileSync(path.join(docsDir, 'Sunburnt-AI-Sales-Guide.md'), 'utf8');
const catalogue = fs.readFileSync(path.join(docsDir, 'product-catalogue.html'), 'utf8');

const products = extractProducts(catalogue);
const stacks = extractStacks(catalogue);
const industries = parseIndustries(salesGuide);

const overview = {
  models: {
    digest: 'anthropic/claude-haiku-4.5',
    reasoning: 'anthropic/claude-opus-4.6',
  },
  knowledgeLayerMessage: 'Knowledge Layer is the foundation. Recommendations should explain what business knowledge gets unified and why that improves context, compliance, and execution.',
  productCount: products.length,
  stackCount: stacks.length,
  industryCount: industries.length,
};

fs.writeFileSync(path.join(outDir, 'products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(outDir, 'stacks.json'), JSON.stringify(stacks, null, 2));
fs.writeFileSync(path.join(outDir, 'industries.json'), JSON.stringify(industries, null, 2));
fs.writeFileSync(path.join(outDir, 'overview.json'), JSON.stringify(overview, null, 2));
console.log(`Generated ${products.length} products, ${stacks.length} stacks, ${industries.length} industries.`);
