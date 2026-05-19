import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { env } from "./env";

const cookieName = "transfer_session";
const sessionValue = "authenticated";

function sign(value: string) {
  return createHmac("sha256", env.sessionSecret).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyPassword(password: string) {
  return safeEqual(password, env.appPassword);
}

export function createSessionCookie() {
  return `${sessionValue}.${sign(sessionValue)}`;
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(cookieName)?.value;

  if (!cookie) {
    return false;
  }

  const [value, signature] = cookie.split(".");

  return value === sessionValue && Boolean(signature) && safeEqual(signature, sign(value));
}

export async function setSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(cookieName, createSessionCookie(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(cookieName);
}

export function authError() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
