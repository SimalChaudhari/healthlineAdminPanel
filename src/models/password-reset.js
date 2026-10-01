import mongoose from 'mongoose';

/** One active reset request per email. OTP and reset token are stored as hashes only. */
const passwordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, required: true },
    /** Set after OTP is verified — lets the user set a new password once. */
    resetTokenHash: { type: String, default: '' },
    resetTokenExpiresAt: { type: Date },
    /** MongoDB removes the document after this time. */
    expireAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export const PasswordReset =
  mongoose.models.PasswordReset || mongoose.model('PasswordReset', passwordResetSchema);
