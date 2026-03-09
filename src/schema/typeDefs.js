const typeDefs = `#graphql

  # ──────────────────────────────
  # Types
  # ──────────────────────────────

  type Company {
    id: ID!
    name: String!
    industry: String!
    jobs: [Job]
  }

  type Job {
    id: ID!
    company: Company!
    title: String!
    description: String!
    status: String!
  }

  type Applicant {
    id: ID!
    name: String!
    email: String!
    resume_link: String!
    applications: [Application]
  }

  type Application {
    id: ID!
    applicant: Applicant!
    job: Job!
    status: String!
    interviews: [Interview]
    offer: Offer
  }

  type Interview {
    id: ID!
    application: Application!
    date: String!
    result: String!
  }

  type Offer {
    id: ID!
    application: Application!
    salary: Float!
    status: String!
  }

  # ──────────────────────────────
  # Input Types
  # ──────────────────────────────

  input CreateCompanyInput {
    name: String!
    industry: String!
  }

  input CreateJobInput {
    companyId: ID!
    title: String!
    description: String!
    status: String
  }

  input CreateApplicantInput {
    name: String!
    email: String!
    resumeLink: String!
  }

  input ApplyJobInput {
    applicantId: ID!
    jobId: ID!
  }

  input ScheduleInterviewInput {
    applicationId: ID!
    date: String!
  }

  input CreateOfferInput {
    applicationId: ID!
    salary: Float!
  }

  # ──────────────────────────────
  # Payload / Response Wrappers
  # ──────────────────────────────

  type ApplyJobPayload {
    application: Application
  }

  # ──────────────────────────────
  # Queries
  # ──────────────────────────────

  type Query {
    # Company
    getCompany(id: ID!): Company
    getAllCompanies: [Company]

    # Job
    getJob(id: ID!): Job
    getAllJobs: [Job]

    # Applicant
    getApplicant(id: ID!): Applicant
    getAllApplicants: [Applicant]

    # Application
    getApplication(id: ID!): Application
    getApplicationsByApplicant(applicantId: ID!): [Application]
    getApplicationsByJob(jobId: ID!): [Application]

    # Interview
    getInterview(id: ID!): Interview

    # Offer
    getOffer(id: ID!): Offer
  }

  # ──────────────────────────────
  # Mutations
  # ──────────────────────────────

  type Mutation {
    # Company
    createCompany(input: CreateCompanyInput!): Company

    # Job
    createJob(input: CreateJobInput!): Job
    closeJob(id: ID!): Job

    # Applicant
    createApplicant(input: CreateApplicantInput!): Applicant

    # Application
    applyJob(input: ApplyJobInput!): ApplyJobPayload
    updateApplicationStatus(id: ID!, status: String!): Application

    # Interview
    scheduleInterview(input: ScheduleInterviewInput!): Interview
    updateInterviewResult(id: ID!, result: String!): Interview

    # Offer
    createOffer(input: CreateOfferInput!): Offer
    updateOfferStatus(id: ID!, status: String!): Offer
  }
`;

export default typeDefs;
