import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    owner: String,
    repo: String,
    addedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const bookmarkSchema = new mongoose.Schema(
  {
    owner: String,
    repo: String,
    issueNumber: Number,
    title: String,
    note: String,
    addedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: String,
    displayName: String,
    photoURL: String,
    githubToken: String,
    githubUsername: String,
    watchlist: [watchlistSchema],
    bookmarks: [bookmarkSchema]
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
