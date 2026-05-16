import type { Application } from "express";
import { authRouter } from "./auth.routes";
import { loanRouter } from "./loan.routes";
import { paymentRouter } from "./payment.routes";
import { adminRouter } from "./admin.routes";

export function registerRoutes(app: Application) {
	app.use("/auth", authRouter);
	app.use("/loans", loanRouter);
	app.use("/payments", paymentRouter);
	app.use("/admin", adminRouter);
}
