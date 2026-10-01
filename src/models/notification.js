import mongoose from 'mongoose';

/** Admin push campaign sent to Healthline app users through Expo push. */
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    body: { type: String, required: true, trim: true, maxlength: 240 },
    /** 'All' or a plan code (Free, Plus, Family…) */
    audience: { type: String, default: 'All', trim: true },
    status: { type: String, enum: ['Draft', 'Sent'], default: 'Draft' },
    sentAt: { type: Date, default: null },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/** Admin form / API body → fields we store. */
export function parseNotificationBody(body = {}) {
  return {
    title: String(body.title || '').trim(),
    body: String(body.body || '').trim(),
    audience: String(body.audience || 'All').trim() || 'All',
  };
}

notificationSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: String(this._id),
    title: this.title,
    body: this.body,
    audience: this.audience || 'All',
    status: this.status,
    sentAt: this.sentAt,
    sentCount: this.sentCount || 0,
    failedCount: this.failedCount || 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
