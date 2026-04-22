import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, toAppError } from '@/lib/errors';
import { runAnalysis } from '@/lib/analyze';
import { buildBriefMarkdown } from '@/lib/export-markdown';

const requestSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  websiteUrl: z.string().min(1, 'Website URL is required.'),
  contactName: z.string().optional().default(''),
  role: z.string().optional().default(''),
  industry: z.string().optional().default(''),
  teamSize: z.string().optional().default(''),
  revenue: z.string().optional().default(''),
  location: z.string().optional().default(''),
  currentTools: z.string().optional().default(''),
  painPoints: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  editorNotes: z.string().optional().default(''),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const input = requestSchema.parse(json);
    const result = await runAnalysis(input);
    const markdown = buildBriefMarkdown(input, result, input.editorNotes);

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Please fix the highlighted intake fields and try again.',
          code: 'invalid_request',
          details: error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      );
    }

    const appError = toAppError(error, 'Analysis failed.');
    const status = appError instanceof AppError ? appError.status : 500;
    return NextResponse.json(
      {
        error: appError.message,
        code: appError.code,
        details: appError.details,
      },
      { status }
    );
  }
}
