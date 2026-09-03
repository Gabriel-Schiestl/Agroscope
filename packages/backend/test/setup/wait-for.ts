export async function waitFor<T>(
    getValue: () => Promise<T | undefined>,
    options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<T> {
    const timeoutMs = options.timeoutMs ?? 2000;
    const intervalMs = options.intervalMs ?? 50;
    const deadline = Date.now() + timeoutMs;

    let lastValue: T | undefined;
    while (Date.now() < deadline) {
        lastValue = await getValue();
        if (lastValue !== undefined) return lastValue;
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}
