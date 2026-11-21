const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');
const SESSION_KEY = 'memomap.session';

export type Session = { accessToken: string; refreshToken: string };

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function storageWithSession(): Storage | null {
  try {
    if (localStorage.getItem(SESSION_KEY)) return localStorage;
    if (sessionStorage.getItem(SESSION_KEY)) return sessionStorage;
  } catch {
    return null;
  }
  return null;
}

export function getSession(): Session | null {
  const raw = storageWithSession()?.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function saveSession(session: Session, remember?: boolean) {
  const target = remember === undefined ? storageWithSession() ?? localStorage : remember ? localStorage : sessionStorage;
  clearSession();
  target.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
}

let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function readError(response: Response): Promise<ApiError> {
  if (response.status === 429) return new ApiError('Too many attempts. Please wait a minute and try again.', 429);
  let message = `Request failed (${response.status}).`;
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) message = body.message.join(' · ');
    else if (body.message) message = body.message;
  } catch {
    /* non-JSON error body */
  }
  return new ApiError(message, response.status);
}

let refreshing: Promise<boolean> | null = null;
function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    const session = getSession();
    if (!session) return false;
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: session.refreshToken }) });
      if (!response.ok) return false;
      saveSession((await response.json()) as Session);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

type RequestOptions = { method?: string; body?: unknown; auth?: boolean };

export async function api<T>(path: string, { method = 'GET', body, auth = true }: RequestOptions = {}): Promise<T> {
  const send = () => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = auth ? getSession()?.accessToken : undefined;
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${BASE_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  };

  let response: Response;
  try {
    response = await send();
    if (auth && response.status === 401 && (await refreshSession())) response = await send();
  } catch {
    throw new ApiError('Cannot reach the MemoMap server. Check that the backend is running.', 0);
  }
  if (auth && response.status === 401) {
    clearSession();
    onUnauthorized();
  }
  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
