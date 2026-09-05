export class BaseAppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code = 'INTERNAL_ERROR', statusCode = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends BaseAppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class ProviderError extends BaseAppError {
  public readonly providerName: string;
  constructor(providerName: string, message: string, details?: Record<string, unknown>) {
    super(`Provider [${providerName}] error: ${message}`, 'PROVIDER_ERROR', 502, details);
    this.providerName = providerName;
  }
}

export class AntiLookAheadViolationError extends BaseAppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ANTI_LOOK_AHEAD_VIOLATION', 422, details);
  }
}

export class HardVetoException extends BaseAppError {
  public readonly vetoReason: string;
  constructor(vetoReason: string, message: string, details?: Record<string, unknown>) {
    super(`Token vetoed due to ${vetoReason}: ${message}`, 'HARD_VETO', 200, details);
    this.vetoReason = vetoReason;
  }
}
