import { db } from "../../config/db";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: Date;
}

export async function findUserById(id: string): Promise<UserProfile | null> {
  const result = await db.query<UserProfile>(
    `SELECT id, email, name, role, created_at FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}
