import {
  Subject,
  SubjectContent,
  User,
  VideoProgress,
  VideoWithNavigation,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshTokens(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken: string };
    accessToken = data.accessToken;
    return data.accessToken;
  } catch {
    return null;
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // 401 → try token refresh once and retry
  if (res.status === 401 && retry) {
    const newToken = await refreshTokens();
    if (newToken) {
      return apiFetch<T>(endpoint, options, false);
    }
    // Signal caller that auth completely failed
    throw new AuthError("Session expired. Please log in again.");
  }

  if (!res.ok) {
    let message = "Request failed";
    try {
      const body = (await res.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiSignup(
  email: string,
  password: string,
  name: string
): Promise<{ user: User }> {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ accessToken: string; user: User }> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogout(): Promise<void> {
  return apiFetch("/auth/logout", { method: "POST" });
}

export async function apiGetMe(): Promise<{ user: User }> {
  return apiFetch("/users/me");
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

export async function apiGetSubjects(): Promise<{ subjects: Subject[] }> {
  return apiFetch("/subjects");
}

export async function apiGetSubject(
  slug: string
): Promise<{ subject: Subject }> {
  return apiFetch(`/subjects/${slug}`);
}

export async function apiGetSubjectContent(
  slug: string
): Promise<{ content: SubjectContent }> {
  return apiFetch(`/subjects/${slug}/content`);
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export async function apiGetVideo(
  id: string
): Promise<VideoWithNavigation> {
  return apiFetch(`/videos/${id}`);
}

// ─── Progress ────────────────────────────────────────────────────────────────

export async function apiGetProgress(
  videoId: string
): Promise<{ progress: VideoProgress | null }> {
  return apiFetch(`/progress/${videoId}`);
}

export async function apiSaveProgress(
  videoId: string,
  lastPositionSeconds: number,
  isCompleted: boolean
): Promise<{ progress: VideoProgress }> {
  return apiFetch("/progress", {
    method: "POST",
    body: JSON.stringify({
      video_id: videoId,
      last_position_seconds: lastPositionSeconds,
      is_completed: isCompleted,
    }),
  });
}