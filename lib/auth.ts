import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "lf_admin";
const SESSION_DAYS = 7;

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export type AdminSession = {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
};

export async function createSession(user: {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
}) {
  const token = await new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());

  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function getSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role === "ADMIN" ? "ADMIN" : "STAFF",
    };
  } catch {
    return null;
  }
}

/**
 * Guard for admin pages AND admin server actions (actions are public HTTP
 * endpoints — every one of them must call this first).
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function destroySession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
