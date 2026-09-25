import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

import { db } from "./db";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-secret-change-me"
);

type SessionRole = "CUSTOMER" | "ADMIN";

type SessionPayload = {
  sub: string;
  role: SessionRole;
};

export async function createSession(
  userId: string,
  role: SessionRole
) {
  const token = await new SignJWT({
    sub: userId,
    role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  cookies().set("sveston_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get("sveston_session")?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, secret);

    if (
      typeof verified.payload.sub !== "string" ||
      (verified.payload.role !== "CUSTOMER" &&
        verified.payload.role !== "ADMIN")
    ) {
      return null;
    }

    return {
      sub: verified.payload.sub,
      role: verified.payload.role as SessionRole,
    };
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().set("sveston_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function loginCustomer(
  email: string,
  password: string
) {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return null;
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    return null;
  }

  await createSession(user.id, "CUSTOMER");

  return user;
}

export async function registerCustomer(
  name: string,
  email: string,
  password: string
) {
  const hash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: hash,
    },
  });

  await createSession(user.id, "CUSTOMER");

  return user;
}

export async function requireRole(
  role: SessionRole
) {
  const session = await getSession();

  if (!session || session.role !== role) {
    return null;
  }

  return session;
}