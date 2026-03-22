import { db } from "../../config/db";

export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  created_at: Date;
}

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
}

export async function createUser(
  email: string,
  name: string,
  passwordHash: string
): Promise<UserRow> {
  const result = await db.query<UserRow>(
    `INSERT INTO users (email, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, name, passwordHash]
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await db.query<UserRow>(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const result = await db.query<UserRow>(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function storeRefreshToken(
  userId: number,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

export async function findValidRefreshToken(
  userId: number,
  tokenHash: string
): Promise<RefreshTokenRow | null> {
  const result = await db.query<RefreshTokenRow>(
    `SELECT * FROM refresh_tokens
     WHERE user_id = $1
       AND token_hash = $2
       AND revoked = false
       AND expires_at > NOW()`,
    [userId, tokenHash]
  );
  return result.rows[0] ?? null;
}

export async function revokeRefreshToken(
  userId: number,
  tokenHash: string
): Promise<void> {
  await db.query(
    `UPDATE refresh_tokens
     SET revoked = true
     WHERE user_id = $1 AND token_hash = $2`,
    [userId, tokenHash]
  );
}
