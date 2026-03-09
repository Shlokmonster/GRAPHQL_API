import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
    {
        application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
        date: { type: String, required: true },
        result: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
    },
    { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);
