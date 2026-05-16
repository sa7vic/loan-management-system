import mongoose, { Schema, Types, Model } from "mongoose";
import type { LoanStatus } from "../constants/loanStatus";

export interface ILoanDocumentMeta {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storage: "LOCAL" | "S3"; 
  pathOrKey: string; 
  uploadedAt: Date;
}

export interface ILoan {
  _id: Types.ObjectId;

  borrowerId: Types.ObjectId;

  personalDetailsSnapshot?: {
    fullName: string;
    pan: string;
    dob: Date;
    monthlySalary: number;
    employmentMode: string;
  };

  salarySlip?: ILoanDocumentMeta;

  principal: number;
  tenureDays: number;
  annualInterestRate: number;
  simpleInterest: number;
  totalRepayment: number; 

  status: LoanStatus;

  sanctionedBy?: Types.ObjectId;
  sanctionedAt?: Date;

  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;

  disbursedBy?: Types.ObjectId;
  disbursedAt?: Date;
  disbursementUtr?: string; 
  closedAt?: Date;

  totalPaid: number;
  outstanding: number;

  createdAt: Date;
  updatedAt: Date;
}

export type LoanModel = Model<ILoan>;

const LoanDocumentMetaSchema = new Schema<ILoanDocumentMeta>(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true, min: 0 },
    storage: { type: String, required: true, enum: ["LOCAL", "S3"], default: "LOCAL" },
    pathOrKey: { type: String, required: true },
    uploadedAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false }
);

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    personalDetailsSnapshot: {
      fullName: { type: String, required: false },
      pan: { type: String, required: false, uppercase: true, trim: true },
      dob: { type: Date, required: false },
      monthlySalary: { type: Number, required: false, min: 0 },
      employmentMode: { type: String, required: false, trim: true },
    },

    salarySlip: { type: LoanDocumentMetaSchema, required: false },

    principal: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    annualInterestRate: { type: Number, required: true, default: 12, min: 0 },

    simpleInterest: { type: Number, required: true, min: 0 },
    totalRepayment: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      required: true,
      enum: ["APPLIED", "SANCTIONED", "DISBURSED", "CLOSED", "REJECTED"],
      default: "APPLIED",
      index: true,
    },

    sanctionedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
    sanctionedAt: { type: Date, required: false },

    rejectedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
    rejectedAt: { type: Date, required: false },
    rejectionReason: { type: String, required: false, trim: true, maxlength: 500 },

    disbursedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
    disbursedAt: { type: Date, required: false },
    disbursementUtr: { type: String, required: false, trim: true },

    closedAt: { type: Date, required: false },

    totalPaid: { type: Number, required: true, default: 0, min: 0 },
    outstanding: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

LoanSchema.index({ borrowerId: 1, status: 1 });
LoanSchema.index({ status: 1, createdAt: -1 });

export const Loan = (mongoose.models.Loan as LoanModel) || mongoose.model<ILoan>("Loan", LoanSchema);