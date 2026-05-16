import mongoose, { Schema, Types, Model } from "mongoose";

export interface IPayment {
  _id: Types.ObjectId;

  loanId: Types.ObjectId;
  borrowerId: Types.ObjectId;

  utrNumber: string;
  amount: number;
  paidAt: Date;

  recordedBy: Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentModel = Model<IPayment>;

const PaymentSchema = new Schema<IPayment>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true, index: true },
    borrowerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    utrNumber: { type: String, required: true, trim: true, unique: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    paidAt: { type: Date, required: true },

    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

PaymentSchema.index({ loanId: 1, paidAt: -1 });
export const Payment =
  (mongoose.models.Payment as PaymentModel) || mongoose.model<IPayment>("Payment", PaymentSchema);