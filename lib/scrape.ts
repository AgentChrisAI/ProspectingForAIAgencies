import 'server-only';
import * as cheerio from 'cheerio';
import { env } from '@/lib/env';
import type { WebsiteExtraction } from '@/lib/types';

const BLOCKED_TAGS = ['script', 'style', 'noscript', 'svg', 'iframe'];

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('Website URL is required.');
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export async function extractWebsiteContent(rawUrl: string): Promise<WebsiteExtraction> {
  const url = normalizeUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.requestTimeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SunburntSalesApp/1.0; +https://sunburntai.com.au)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Website fetch failed with status ${response.status}.`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    BLOCKED_TAGS.forEach((selector) => $(selector).remove());

    const title = collapseWhitespace($('title').first().text() || $('h1').first().text() || 'Untitled page');
    const description = collapseWhitespace(
      $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || ''
    );

    const chunks = [
      $('h1, h2, h3').map((_, el) => collapseWhitespace($(el).text())).get().join('\n'),
      $('main').text() || $('body').text(),
    ]
      .map(collapseWhitespace)
      .filter(Boolean);

    const text = collapseWhitespace(chunks.join('\n\n')).slice(0, env.maxScrapeChars);

    if (!text) {
      throw new Error('The website returned HTML, but no readable text could be extracted.');
    }

    const warnings: string[] = [];
    if (html.length > env.maxScrapeChars) {
      warnings.push(`Website text was truncated to ${env.maxScrapeChars.toLocaleString()} characters for v1 analysis.`);
    }
    if (!description) {
      warnings.push('No meta description found; summary relies on visible page text.');
    }

    return {
      finalUrl: response.url,
      title,
      description,
      text,
      textPreview: text.slice(0, 1200),
      method: 'fetch-html',
      warnings,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown website extraction error.';
    throw new Error(`Website extraction failed: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}
