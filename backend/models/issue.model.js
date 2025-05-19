import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ward: {
    type: String,
    required: true,
    index: true // allows for faster queries on this field by creating an index when doing .find()
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  images: {
    type: [String], // URLs or paths
    default: []
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'resolved', 'cancelled'],
    default: 'pending',
    index: true
  },
  commentCount: {
  type: Number,
  default: 0
  },
  adminFeedback: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Issue', issueSchema);
