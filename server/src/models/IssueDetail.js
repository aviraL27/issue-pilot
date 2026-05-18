import mongoose from 'mongoose';

const issueDetailSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true },
    repo: { type: String, required: true },
    issueNumber: { type: Number, required: true },
    aiSummary: String,
    aiCategory: String,
    verdict: String,
    verdictReason: String,
    lastChecked: Date,
    expiresAt: { type: Date, index: { expires: 0 } }
  },
  { timestamps: true }
);

issueDetailSchema.index({ owner: 1, repo: 1, issueNumber: 1 }, { unique: true });

export default mongoose.model('IssueDetail', issueDetailSchema);
