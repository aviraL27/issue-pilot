import mongoose from 'mongoose';

const repoCacheSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true, index: true },
    repo: { type: String, required: true, index: true },
    fetchedAt: { type: Date, required: true },
    health: mongoose.Schema.Types.Mixed,
    issues: [mongoose.Schema.Types.Mixed],
    expiresAt: { type: Date, index: { expires: 0 } }
  },
  { timestamps: true }
);

repoCacheSchema.index({ owner: 1, repo: 1 }, { unique: true });

export default mongoose.model('RepoCache', repoCacheSchema);
