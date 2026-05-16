import type { Request, Response, NextFunction } from "express";
import type { Role } from "../constants/roles";

export function requireRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!allowed.includes(req.user.role as Role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}