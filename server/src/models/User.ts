import mongoose, { Schema, Types, Model } from "mongoose";
import type { Role } from "../constants/roles";

export interface IUser {
  _id: Types.ObjectId;

  fullName: string;
  email: string;
  phone?: string;

  role: Role;
  passwordHash: string;

  pan?: string;
  dob?: Date;
  monthlySalary?: number;
  employmentMode?: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type UserModel = Model<IUser>;

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: false, trim: true },

    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "SALES", "SANCTION", "DISBURSEMENT", "COLLECTION", "BORROWER"],
      index: true,
    },

    passwordHash: { type: String, required: true },

    pan: { type: String, required: false, uppercase: true, trim: true },
    dob: { type: Date, required: false },
    monthlySalary: { type: Number, required: false, min: 0 },
    employmentMode: { type: String, required: false, trim: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = (mongoose.models.User as UserModel) || mongoose.model<IUser>("User", UserSchema);