type ErrorResponse = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const message = (error as ErrorResponse).response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}
