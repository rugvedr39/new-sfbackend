const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['paid', 'unpaid', 'open','pending'], default: 'open' }, // Default to open
  amount: { type: Number, required: true },
  type: { type: String, required: true }, // "joining", "commission", "PMF"
  level: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  paidDate: { type: Date,default:null }, // Date when the transaction was paid
  utrNumber: { type: String,default:null } // UTR (Unique Transaction Reference) number
});

transactionSchema.index({ receiverId: 1 });
transactionSchema.index({ payerId: 1 });
transactionSchema.index({ level: 1 });
transactionSchema.index({ status: 1 });

transactionSchema.statics.getTopReceivers = async function (page = 1, limit = 100) {
  const Transaction = this; // 'this' refers to the Transaction model

  try {
    const skip = (page - 1) * limit;

    const topReceivers = await Transaction.aggregate([
      // Stage 1: Match only paid transactions
      { $match: { status: 'paid' } },

      // Stage 2: Group by receiverId and calculate totalAmount
      { $group: { _id: '$receiverId', totalAmount: { $sum: '$amount' } } },

      // Stage 3: Sort by totalAmount in descending order
      { $sort: { totalAmount: -1 } },

      // Stage 4: Skip documents based on page and limit
      { $skip: skip },
      { $limit: limit },

      // Stage 5: Lookup to join with users collection
      {
        $lookup: {
          from: 'users', // Ensure this is the correct collection name
          localField: '_id',
          foreignField: '_id',
          as: 'receiverInfo'
        }
      },

      // Stage 6: Unwind to deconstruct the receiverInfo array
      { $unwind: { path: '$receiverInfo', preserveNullAndEmptyArrays: true } },

      // Stage 7: Exclude specified usernames
      {
        $match: {
          'receiverInfo.username': { $nin: ["SF812165", "SF922715", "SF421545", "SF564748", "SF258357", "SF357970", "SF131274", "SF802730"] }
        }
      },

      // Stage 8: Project desired fields
      {
        $project: {
          _id: 0,
          receiverId: '$_id',
          totalAmount: 1,
          name: '$receiverInfo.name',
          username: '$receiverInfo.username'
        }
      }
    ]);

    return topReceivers;
  } catch (error) {
    console.error('Error fetching top receivers:', error);
    throw error; // Consider adding more context or handling specific errors
  }
};

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;