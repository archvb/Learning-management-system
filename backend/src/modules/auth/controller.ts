import { Request, Response } from "express";
import { signup, login, logout, refreshAccessToken } from "./service";

const REFRESH_COOKIE_NAME = "refreshToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  domain: process.env.COOKIE_DOMAIN || "localhost",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function signupController(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password, name } = req.body as {
    email: string;
    password: string;
    name: string;
  };

  if (!email || !password || !name) {
    res.status(400).json({ error: "email, password, and name are required" });
    return;
  }

  try {
    const user = await signup(email, password, name);
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  try {
    const { tokens, user } = await login(email, password);

    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      accessToken: tokens.accessToken,
      user,
    });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}

export async function logoutController(
  req: Request,
  res: Response
): Promise<void> {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;

  if (!refreshToken) {
    res.status(400).json({ error: "No refresh token provided" });
    return;
  }

  try {
    await logout(refreshToken);
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN || "localhost",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}

export async function refreshController(
  req: Request,
  res: Response
): Promise<void> {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;

  if (!refreshToken) {
    res.status(400).json({ error: "No refresh token provided" });
    return;
  }

  try {
    const accessToken = await refreshAccessToken(refreshToken);
    res.status(200).json({ accessToken });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status ?? 500).json({ error: error.message });
  }
}
