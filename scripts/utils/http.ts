export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RateLimiter {
    private queue: Array<() => void> = [];
    private runningRequests = 0;
    private lastRequestTime = 0;

    constructor(
        private maxConcurrent: number = 5,
        private minInterval: number = 200 // ms between requests
    ) { }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        while (this.runningRequests >= this.maxConcurrent) {
            await sleep(100);
        }

        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minInterval) {
            await sleep(this.minInterval - timeSinceLastRequest);
        }

        this.runningRequests++;
        this.lastRequestTime = Date.now();

        try {
            return await fn();
        } finally {
            this.runningRequests--;
        }
    }
}

export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.warn(
                    `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
                    error
                );
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

export async function fetchWithRetry(
    url: string,
    options?: RequestInit,
    maxRetries: number = 3
): Promise<Response> {
    return retryWithBackoff(
        async () => {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText} for ${url}`
                );
            }

            return response;
        },
        maxRetries
    );
}
