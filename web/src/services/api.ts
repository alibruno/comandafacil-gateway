export class ApiError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ApiError';
	}
}

function responseMessage(body: unknown, status: number): string {
	if (body && typeof body === 'object') {
		const value = body as { message?: unknown; detail?: unknown; errors?: Record<string, unknown> };
		if (typeof value.message === 'string') return value.message;
		if (typeof value.detail === 'string') return value.detail;
		const firstError = Object.values(value.errors ?? {}).flat().find((error) => typeof error === 'string');
		if (typeof firstError === 'string') return firstError;
	}
	return `A solicitação falhou (HTTP ${status}).`;
}

export async function apiRequest<T>(
	token: string,
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const headers = new Headers(options.headers);
	headers.set('Authorization', `Bearer ${token}`);
	headers.set('Accept', 'application/json');
	if (options.body !== undefined) headers.set('Content-Type', 'application/json');

	const response = await fetch(path, { ...options, headers });
	if (!response.ok) {
		const text = await response.text();
		let body: unknown;
		try {
			body = text ? JSON.parse(text) : null;
		} catch {
			body = null;
		}
		throw new ApiError(responseMessage(body, response.status));
	}
	if (response.status === 204) return undefined as T;
	return await response.json() as T;
}
