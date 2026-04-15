import 'server-only';

export class AppError extends Error {
  status: number;
  code: string;
  details?: string[];

  constructor({ message, status = 500, code = 'internal_error', details }: { message: string; status?: number; code?: string; details?: string[] }) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function toAppError(error: unknown, fallbackMessage = 'Something went wrong while running the analysis.') {
  if (error instanceof AppError) {
    return error;
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return new AppError({
    message,
    status: 500,
    code: 'internal_error',
  });
}
