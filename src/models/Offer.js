import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
    {
        application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
        salary: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    },
    { timestamps: true }
);

export default mongoose.model('Offer', offerSchema);
