import mongoose from 'mongoose';

const applicantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        resume_link: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model('Applicant', applicantSchema);
