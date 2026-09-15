export function buildCorsOriginValidator(): (origin?: string) => boolean {
    const allowedOrigins = (process.env.CORS_ORIGINS ?? '').split(',');
    const allowedPatterns = (process.env.CORS_ORIGIN_PATTERNS ?? '')
        .split(',')
        .filter(Boolean)
        .map((pattern) => new RegExp(pattern));

    return (origin?: string) =>
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedPatterns.some((pattern) => pattern.test(origin));
}
