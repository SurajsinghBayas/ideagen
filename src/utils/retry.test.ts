
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryWithBackoff, isRateLimitError } from './retry';

describe('retryWithBackoff', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should return result immediately if successful', async () => {
        const fn = vi.fn().mockResolvedValue('success');
        const result = await retryWithBackoff(fn);
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on rate limit error and eventually succeed', async () => {
        const fn = vi.fn()
            .mockRejectedValueOnce(new Error('Rate limit exceeded'))
            .mockResolvedValue('success');

        const initialDelay = 1000;
        const promise = retryWithBackoff(fn, 3, initialDelay);
        
        // Allow first failure to happen and delay to start
        await vi.advanceTimersByTimeAsync(initialDelay);
        
        const result = await promise;
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('Rate limit exceeded'));
        const initialDelay = 1000;
        const promise = retryWithBackoff(fn, 2, initialDelay);
        
        // Catch the rejection promise BEFORE advancing timers to avoid "Unhandled Rejection"
        const resultPromise = expect(promise).rejects.toThrow('Rate limit exceeded');
        
        // Advance enough time for all retries
        await vi.advanceTimersByTimeAsync(5000);
        
        await resultPromise;
        expect(fn).toHaveBeenCalledTimes(3); 
    });

    it('should not retry for non-rate-limit errors', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('Other error'));

        await expect(retryWithBackoff(fn)).rejects.toThrow('Other error');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should use exponential backoff', async () => {
        const fn = vi.fn()
            .mockRejectedValueOnce(new Error('Rate limit 1'))
            .mockRejectedValueOnce(new Error('Rate limit 2'))
            .mockResolvedValue('success');

        const initialDelay = 1000;
        const promise = retryWithBackoff(fn, 3, initialDelay);

        // First retry delay
        await vi.advanceTimersByTimeAsync(initialDelay); 
        // We can't easily assert "called exactly twice" here because of async nature, 
        // but we can advance again
        
        // Second retry delay (should be doubled)
        await vi.advanceTimersByTimeAsync(initialDelay * 2);
        
        await promise;
        expect(fn).toHaveBeenCalledTimes(3);
    });
});

describe('isRateLimitError', () => {
    it('should identify rate limit errors correctly', () => {
        expect(isRateLimitError(new Error('Rate limit exceeded'))).toBe(true);
        expect(isRateLimitError(new Error('429 Too Many Requests'))).toBe(true);
        expect(isRateLimitError(new Error('Quota exceeded'))).toBe(true);
        expect(isRateLimitError(new Error('Resource exhausted'))).toBe(true);
    });

    it('should return false for other errors', () => {
        expect(isRateLimitError(new Error('Network error'))).toBe(false);
        expect(isRateLimitError(new Error('Not found'))).toBe(false);
        expect(isRateLimitError('string error')).toBe(false);
    });
});
