import { GraphQLError } from 'graphql';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Applicant from '../models/Applicant.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import Offer from '../models/Offer.js';

// When using .lean(), Mongoose returns _id (ObjectId) in place of id (string).
// We add id resolvers on every type to map _id → id string.
const withId = (resolvers) => ({
    ...resolvers,
    id: (parent) => parent._id?.toString() ?? parent.id,
});

const resolvers = {
    Company: withId({ jobs: async (p) => Job.find({ company: p._id }).lean().exec() }),
    Job: withId({ company: async (p) => Company.findById(p.company).lean().exec() }),
    Applicant: withId({ applications: async (p) => Application.find({ applicant: p._id }).lean().exec() }),
    Application: withId({
        applicant: async (p) => Applicant.findById(p.applicant).lean().exec(),
        job: async (p) => Job.findById(p.job).lean().exec(),
        interviews: async (p) => Interview.find({ application: p._id }).lean().exec(),
        offer: async (p) => Offer.findOne({ application: p._id }).lean().exec(),
    }),
    Interview: withId({ application: async (p) => Application.findById(p.application).lean().exec() }),
    Offer: withId({ application: async (p) => Application.findById(p.application).lean().exec() }),

    // ─────────────────────────────────────────────────────────────
    // Queries
    // ─────────────────────────────────────────────────────────────
    Query: {
        getCompany: async (_, { id }) => Company.findById(id).lean().exec(),
        getAllCompanies: async () => Company.find().lean().exec(),

        getJob: async (_, { id }) => Job.findById(id).lean().exec(),
        getAllJobs: async () => Job.find().lean().exec(),

        getApplicant: async (_, { id }) => Applicant.findById(id).lean().exec(),
        getAllApplicants: async () => Applicant.find().lean().exec(),

        getApplication: async (_, { id }) => Application.findById(id).lean().exec(),
        getApplicationsByApplicant: async (_, { applicantId }) =>
            Application.find({ applicant: applicantId }).lean().exec(),
        getApplicationsByJob: async (_, { jobId }) =>
            Application.find({ job: jobId }).lean().exec(),

        getInterview: async (_, { id }) => Interview.findById(id).lean().exec(),
        getOffer: async (_, { id }) => Offer.findById(id).lean().exec(),
    },

    // ─────────────────────────────────────────────────────────────
    // Mutations
    // ─────────────────────────────────────────────────────────────
    Mutation: {
        // ── Company ──────────────────────────────────────────────
        createCompany: async (_, { input }) => {
            const doc = await Company.create(input);
            return doc.toObject();
        },

        // ── Job ──────────────────────────────────────────────────
        createJob: async (_, { input }) => {
            const { companyId, title, description, status } = input;
            const company = await Company.findById(companyId).lean().exec();
            if (!company) throw new GraphQLError('Company not found', { extensions: { code: 'NOT_FOUND' } });
            const doc = await Job.create({ company: companyId, title, description, status: status || 'open' });
            return doc.toObject();
        },

        closeJob: async (_, { id }) => {
            const doc = await Job.findByIdAndUpdate(id, { status: 'closed' }, { new: true }).lean().exec();
            if (!doc) throw new GraphQLError('Job not found', { extensions: { code: 'NOT_FOUND' } });
            return doc;
        },

        // ── Applicant ────────────────────────────────────────────
        createApplicant: async (_, { input }) => {
            const { name, email, resumeLink } = input;
            const doc = await Applicant.create({ name, email, resume_link: resumeLink });
            return doc.toObject();
        },

        // ── Application ──────────────────────────────────────────
        /**
         * Business rules:
         *  1. Job must exist and be open.
         *  2. Applicant must exist.
         *  3. No duplicate applications (compound index + explicit check).
         */
        applyJob: async (_, { input }) => {
            const { applicantId, jobId } = input;

            const job = await Job.findById(jobId).lean().exec();
            if (!job) throw new GraphQLError('Job not found', { extensions: { code: 'NOT_FOUND' } });
            if (job.status === 'closed') {
                throw new GraphQLError(
                    `Cannot apply to a closed job. "${job.title}" is no longer accepting applications.`,
                    { extensions: { code: 'JOB_CLOSED' } }
                );
            }

            const applicant = await Applicant.findById(applicantId).lean().exec();
            if (!applicant) throw new GraphQLError('Applicant not found', { extensions: { code: 'NOT_FOUND' } });

            const existing = await Application.findOne({ applicant: applicantId, job: jobId }).lean().exec();
            if (existing) {
                throw new GraphQLError(
                    `Duplicate application: ${applicant.name} has already applied for this job.`,
                    { extensions: { code: 'DUPLICATE_APPLICATION' } }
                );
            }

            const doc = await Application.create({ applicant: applicantId, job: jobId, status: 'applied' });
            return { application: doc.toObject() };
        },

        updateApplicationStatus: async (_, { id, status }) => {
            const VALID = ['applied', 'shortlisted', 'rejected', 'hired'];
            if (!VALID.includes(status)) {
                throw new GraphQLError(`Invalid status. Must be one of: ${VALID.join(', ')}`, {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }
            const doc = await Application.findByIdAndUpdate(id, { status }, { new: true }).lean().exec();
            if (!doc) throw new GraphQLError('Application not found', { extensions: { code: 'NOT_FOUND' } });
            return doc;
        },

        // ── Interview ────────────────────────────────────────────
        scheduleInterview: async (_, { input }) => {
            const { applicationId, date } = input;
            const app = await Application.findById(applicationId).lean().exec();
            if (!app) throw new GraphQLError('Application not found', { extensions: { code: 'NOT_FOUND' } });
            const doc = await Interview.create({ application: applicationId, date, result: 'pending' });
            return doc.toObject();
        },

        updateInterviewResult: async (_, { id, result }) => {
            const VALID = ['pending', 'passed', 'failed'];
            if (!VALID.includes(result)) {
                throw new GraphQLError(`Invalid result. Must be one of: ${VALID.join(', ')}`, {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }
            const doc = await Interview.findByIdAndUpdate(id, { result }, { new: true }).lean().exec();
            if (!doc) throw new GraphQLError('Interview not found', { extensions: { code: 'NOT_FOUND' } });
            return doc;
        },

        // ── Offer ────────────────────────────────────────────────
        createOffer: async (_, { input }) => {
            const { applicationId, salary } = input;
            const app = await Application.findById(applicationId).lean().exec();
            if (!app) throw new GraphQLError('Application not found', { extensions: { code: 'NOT_FOUND' } });
            const doc = await Offer.create({ application: applicationId, salary, status: 'pending' });
            return doc.toObject();
        },

        updateOfferStatus: async (_, { id, status }) => {
            const VALID = ['pending', 'accepted', 'declined'];
            if (!VALID.includes(status)) {
                throw new GraphQLError(`Invalid status. Must be one of: ${VALID.join(', ')}`, {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }
            const doc = await Offer.findByIdAndUpdate(id, { status }, { new: true }).lean().exec();
            if (!doc) throw new GraphQLError('Offer not found', { extensions: { code: 'NOT_FOUND' } });
            return doc;
        },
    },
};

export default resolvers;
