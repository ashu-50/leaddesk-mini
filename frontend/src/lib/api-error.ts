/**
 * A failed API call, carrying enough context for the UI to react:
 * `status` decides the recovery path, `errors` renders field-level detail.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: string[];

  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /** The single most useful sentence to show a person. */
  get displayMessage(): string {
    if (this.isRateLimited) {
      return 'Too many attempts. Wait a minute and try again.';
    }

    return this.errors[0] ?? this.message;
  }
}
