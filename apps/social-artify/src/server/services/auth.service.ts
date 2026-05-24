import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { signToken } from "@/server/middleware/auth";
import type { User } from "@/types";

export async function register(
  name: string,
  email: string,
  password: string,
  role: "viewer" | "artist" = "viewer"
) {
  const users = db.users.getAll();
  if (users.find((u) => u.email === email)) throw new Error("Email already used");

  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
  };

  db.users.save([...users, { ...user, password: await bcrypt.hash(password, 10) }]);
  const token = await signToken(user.id, user.role);
  return { user, token };
}

export async function login(email: string, password: string) {
  const record = db.users.getAll().find((u) => u.email === email);
  if (!record || !(await bcrypt.compare(password, record.password)))
    throw new Error("Invalid credentials");

  const { password: _, ...user } = record; // strip the hash before returning
  const token = await signToken(user.id, user.role);
  return { user, token };
}

export function me(userId: string) {
  const record = db.users.getAll().find((u) => u.id === userId);
  if (!record) throw new Error("User not found");
  const { password: _, ...user } = record;
  return user;
}

export async function updateUser(
  userId: string,
  fields: { name?: string; email?: string; password?: string }
) {
  const users = db.users.getAll();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");

  if (fields.email && users.some((u) => u.email === fields.email && u.id !== userId))
    throw new Error("Email already used");

  if (fields.name) users[idx].name = fields.name;
  if (fields.email) users[idx].email = fields.email;
  if (fields.password) users[idx].password = await bcrypt.hash(fields.password, 10);

  db.users.save(users);
  const { password: _, ...user } = users[idx];
  return user;
}
