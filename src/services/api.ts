import { env } from '@/config/env';
import type { TokenPair } from '@/@types/api';

const ACCESS_TOKEN_KEY = 'packed_access_token';
const REFRESH_TOKEN_KEY = 'packed_refresh_token';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (tokens: TokenPair) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${env.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        tokenStorage.clear();
        return false;
      }

      const data = (await response.json()) as TokenPair;
      tokenStorage.setTokens(data);
      return true;
    } catch {
      tokenStorage.clear();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function parseErrorPayload(payload: unknown, status: number): ApiError {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.detail && typeof obj.detail === 'object') {
      const detailObj = obj.detail as Record<string, unknown>;
      const msg = typeof detailObj.message === 'string' ? detailObj.message : 'Erro na requisição.';
      const code = typeof detailObj.code === 'string' ? detailObj.code : 'API_ERROR';
      return new ApiError(msg, status, code);
    }
    if (typeof obj.detail === 'string') {
      const code = typeof obj.code === 'string' ? obj.code : 'API_ERROR';
      return new ApiError(obj.detail, status, code);
    }
    if (typeof obj.message === 'string') {
      return new ApiError(obj.message, status, 'API_ERROR');
    }
  }
  return new ApiError('Ocorreu um erro ao comunicar com o servidor.', status);
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth = false, headers: customHeaders, ...rest } = options;
  const url = `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const buildHeaders = (): HeadersInit => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(customHeaders as Record<string, string>),
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (!skipAuth) {
      const token = tokenStorage.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    return headers;
  };

  let response = await fetch(url, {
    ...rest,
    headers: buildHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !skipAuth && !path.includes('/auth/login')) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      response = await fetch(url, {
        ...rest,
        headers: buildHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw parseErrorPayload(data, response.status);
  }

  return data as T;
}

