import { findUserById, UserProfile } from "./repository";

export async function getMyProfile(userId: number): Promise<UserProfile> {
  const user = await findUserById(userId.toString());
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }
  return user;
}
