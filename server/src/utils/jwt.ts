import jwt from "jsonwebtoken";
import type { Role } from "../constants/roles";

export type JwtUserPayload = {
  sub: string;
  role: Role;
  email: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

type JwtExpiresIn = jwt.SignOptions["expiresIn"];

function getJwtExpiresIn(): JwtExpiresIn {
  const raw = process.env.JWT_EXPIRES_IN;
  if (!raw) return "1h";

  const trimmed = raw.trim();
  if (!trimmed) return "1h";

  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (/^\d+(\.\d+)?(ms|s|m|h|d|w|y)$/i.test(trimmed)) {
    return trimmed as JwtExpiresIn;
  }

  throw new Error(
    "JWT_EXPIRES_IN is invalid (expected number of seconds or duration like 1h, 30m)"
  );
}

export function signAccessToken(payload: JwtUserPayload) {
  const expiresIn = getJwtExpiresIn();
  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as JwtUserPayload & jwt.JwtPayload;
}