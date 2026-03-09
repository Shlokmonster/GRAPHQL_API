import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
    {
        applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        status: {
            type: String,
            enum: ['applied', 'shortlisted', 'rejected', 'hired'],
            default: 'applied',
        },
    },
    { timestamps: true }
);

// Compound unique index – one application per applicant per job
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
