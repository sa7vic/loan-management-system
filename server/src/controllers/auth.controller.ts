import type { Request, Response } from "express";
import { signupSchema, loginSchema } from "../validators/auth.validators";
import { User } from "../models/User";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAccessToken } from "../utils/jwt";

function publicUser(u: any) {
  return {
    id: String(u._id),
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });
  }

  const { fullName, email, password, phone } = parsed.data;

  const existing = await User.findOne({ email }).lean();
  if (existing) return res.status(400).json({ message: "Email already in use" });

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    fullName,
    email,
    phone,
    role: "BORROWER",
    passwordHash,
    isActive: true,
  });

  const accessToken = signAccessToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
  });

  return res.status(201).json({ user: publicUser(user), accessToken });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", issues: parsed.error.issues });
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid email or password" });
  if (!user.isActive) return res.status(401).json({ message: "User is inactive" });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password" });

  const accessToken = signAccessToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
  });

  return res.json({ user: publicUser(user), accessToken });
}

export async function me(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  return res.json({ user: publicUser(user) });
}