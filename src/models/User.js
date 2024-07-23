const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true  },
  name:{ type: String, required: true},
  email: { type: String, required: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true, match: [/^\d{10}$/, 'Please fill a valid phone number'], },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String }
  },
  upiNumber: { type: String, required: true },
  referralCode: { type: String, required: true },
  sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.statics.getTotalUsersCount = async function() {
  return this.countDocuments();
};

// Static method to get count of users joined today
userSchema.statics.getUsersJoinedTodayCount = async function() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return this.countDocuments({ createdAt: { $gte: startOfToday } });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
