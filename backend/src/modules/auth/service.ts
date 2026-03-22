import {
  createUser,
  findUserByEmail,
  findUserById,
  storeRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
  UserRow,
} from "./repository";
import { hashPassword, comparePassword, hashToken } from "../../utils/hashing";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function signup(
  email: string,
  password: string,
  name: string
): Promise<Omit<UserRow, "password_hash">> {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw Object.assign(new Error("Email already in use"), { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(email, name, passwordHash);

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function login(
  email: string,
  password: string
): Promise<{ tokens: AuthTokens; user: Omit<UserRow, "password_hash"> }> {
  const user = await findUserByEmail(email);
  if (!user) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  const passwordValid = await comparePassword(password, user.password_hash);
  if (!passwordValid) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  const payload = { userId: Number(user.id), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Refresh token expires in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await storeRefreshToken(Number(user.id), hashToken(refreshToken), expiresAt);

  const { password_hash, ...safeUser } = user;
  return { tokens: { accessToken, refreshToken }, user: safeUser };
}

export async function logout(refreshToken: string): Promise<void> {
  let payload: { userId: number };
  try {
    payload = verifyRefreshToken(refreshToken) as { userId: number };
  } catch {
    throw Object.assign(new Error("Invalid refresh token"), { status: 401 });
  }

  const tokenHash = hashToken(refreshToken);
  await revokeRefreshToken(payload.userId, tokenHash);
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  let payload: { userId: number; email: string };
  try {
    payload = verifyRefreshToken(refreshToken) as {
      userId: number;
      email: string;
    };
  } catch {
    throw Object.assign(new Error("Invalid or expired refresh token"), {
      status: 401,
    });
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await findValidRefreshToken(payload.userId, tokenHash);
  if (!storedToken) {
    throw Object.assign(new Error("Refresh token revoked or not found"), {
      status: 401,
    });
  }

  const user = await findUserById(payload.userId.toString());
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  return signAccessToken({ userId: Number(user.id), email: user.email });
}
