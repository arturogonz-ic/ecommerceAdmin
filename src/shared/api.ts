const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
  });

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(json.code ?? res.status, json.message ?? 'Request failed');
  }

  return json.data as T;
}
