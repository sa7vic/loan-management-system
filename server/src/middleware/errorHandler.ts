import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http";
import multer from "multer";

export function errorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	if (err instanceof HttpError) {
		return res.status(err.status).json({ message: err.message, details: err.details });
	}

	if (err instanceof multer.MulterError) {
		return res.status(400).json({ message: err.message });
	}

	if (err instanceof Error) {
		return res.status(500).json({ message: err.message });
	}

	return res.status(500).json({ message: "Unexpected error" });
}
