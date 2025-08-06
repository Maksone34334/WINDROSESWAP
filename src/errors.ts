export class MonorailApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly originalError?: any
    ) {
        super(message);
        this.name = 'MonorailApiError';
    }
}

export class TokenNotFoundError extends MonorailApiError {
    constructor(tokenIdentifier: string) {
        super(`Token not found: ${tokenIdentifier}`);
        this.name = 'TokenNotFoundError';
    }
}

export class ValidationError extends MonorailApiError {
    constructor(message: string, public readonly field?: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class QuoteError extends MonorailApiError {
    constructor(message: string, originalError?: any) {
        super(`Quote API Error: ${message}`, undefined, originalError);
        this.name = 'QuoteError';
    }
}

export class SwapExecutionError extends MonorailApiError {
    constructor(message: string, originalError?: any) {
        super(`Swap Execution Error: ${message}`, undefined, originalError);
        this.name = 'SwapExecutionError';
    }
}

export function handleApiError(error: any): MonorailApiError {
    if (error instanceof MonorailApiError) {
        return error;
    }

    if (error?.response?.status === 404) {
        return new MonorailApiError('Resource not found', 404, error);
    }

    if (error?.response?.status === 400) {
        return new ValidationError(error?.response?.data?.message || 'Bad request', undefined);
    }

    if (error?.response?.status >= 500) {
        return new MonorailApiError('Server error occurred', error.response.status, error);
    }

    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
        return new MonorailApiError('Network connection failed', undefined, error);
    }

    return new MonorailApiError(
        error?.message || 'Unknown error occurred',
        error?.response?.status,
        error
    );
}