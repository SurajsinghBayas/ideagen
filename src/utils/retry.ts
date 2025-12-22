
export const MAX_RETRIES = 3;
export const INITIAL_DELAY_MS = 1000;

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if error is a rate limit error
export const isRateLimitError = (error: unknown): boolean => {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return message.includes('rate limit') ||
            message.includes('quota') ||
            message.includes('429') ||
            message.includes('resource exhausted') ||
            message.includes('too many requests');
    }
    return false;
};

// Retry wrapper with exponential backoff
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    retries: number = MAX_RETRIES,
    delayMs: number = INITIAL_DELAY_MS,
    shouldRetry: (error: unknown) => boolean = isRateLimitError
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0 && shouldRetry(error)) {
            console.warn(`Rate limit hit. Retrying in ${delayMs}ms... (${retries} attempts remaining)`);
            await delay(delayMs);
            return retryWithBackoff(fn, retries - 1, delayMs * 2, shouldRetry); // Exponential backoff
        }
        throw error;
    }
};
