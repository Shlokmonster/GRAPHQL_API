import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        status: { type: String, enum: ['open', 'closed'], default: 'open' },
    },
    { timestamps: true }
);

export default mongoose.model('Job', jobSchema);
