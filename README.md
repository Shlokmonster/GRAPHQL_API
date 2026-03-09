# 🧑‍💼 Recruitment Management System — GraphQL API

A production-ready **GraphQL API** for end-to-end recruitment: job postings, applicant tracking, interview scheduling, and offer management — built with **Node.js**, **Apollo Server v5**, and **MongoDB**.

---

## ✨ Features

- 📋 **Company & Job Management** — Create companies and post jobs with open/closed status
- 👤 **Applicant Tracking** — Register applicants and track their full application history
- 🔒 **Business Rule Enforcement**
  - ❌ Cannot apply to a **closed job**
  - ❌ **Duplicate applications** are rejected
- 🗓️ **Interview Scheduling** — Schedule interviews and update results (pending / passed / failed)
- 💼 **Offer Management** — Issue salary offers and track acceptance status
- ✅ **Full Hiring Workflow** — `applied → shortlisted → hired`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| GraphQL Server | Apollo Server v5 (Standalone) |
| Database | MongoDB via Mongoose v9 |
| Dev tooling | Nodemon, dotenv |

---

## 📁 Project Structure

```
GRAPHQL_PROJECT/
├── src/
│   ├── models/
│   │   ├── Company.js          # Company schema
│   │   ├── Job.js              # Job schema (status: open | closed)
│   │   ├── Applicant.js        # Applicant schema
│   │   ├── Application.js      # Application schema (compound unique index)
│   │   ├── Interview.js        # Interview schema
│   │   └── Offer.js            # Offer schema
│   ├── schema/
│   │   └── typeDefs.js         # All GraphQL types, queries & mutations
│   ├── resolvers/
│   │   └── resolvers.js        # All resolvers with business logic
│   └── db.js                   # MongoDB connection helper
├── index.js                    # Server entry point
├── .env                        # Environment variables (not committed)
└── package.json
```

---

## 🗄 Data Models

```
Company ──< Job ──< Application >── Applicant
                        │
                   ┌────┴────┐
               Interview    Offer
```

| Model | Key Fields | Status Enum |
|---|---|---|
| **Company** | name, industry | — |
| **Job** | company, title, description | `open` \| `closed` |
| **Applicant** | name, email *(unique)*, resume_link | — |
| **Application** | applicant, job | `applied` \| `shortlisted` \| `rejected` \| `hired` |
| **Interview** | application, date | `pending` \| `passed` \| `failed` |
| **Offer** | application, salary | `pending` \| `accepted` \| `declined` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongodb://localhost:27017`)

### Installation

```bash
git clone https://github.com/Shlokmonster/GRAPHQL_API.git
cd GRAPHQL_API
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/recruitment_db
```

### Run the Server

```bash
npm run dev     # Development (nodemon, auto-restart)
npm start       # Production
```

GraphQL API available at: **http://localhost:4000/**

---

## 📡 GraphQL Schema

### Queries

```graphql
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

# Interview & Offer
getInterview(id: ID!): Interview
getOffer(id: ID!): Offer
```

### Mutations

```graphql
# Setup
createCompany(input: CreateCompanyInput!): Company
createJob(input: CreateJobInput!): Job
createApplicant(input: CreateApplicantInput!): Applicant
closeJob(id: ID!): Job

# Recruitment Workflow
applyJob(input: ApplyJobInput!): ApplyJobPayload          # validates open status + no duplicates
updateApplicationStatus(id: ID!, status: String!): Application

# Interview
scheduleInterview(input: ScheduleInterviewInput!): Interview
updateInterviewResult(id: ID!, result: String!): Interview

# Offer
createOffer(input: CreateOfferInput!): Offer
updateOfferStatus(id: ID!, status: String!): Offer
```

---

## 🧪 Example Mutations

### 1. Apply for a Job
```graphql
mutation {
  applyJob(input: {
    applicantId: "APPLICANT_ID"
    jobId: "JOB_ID"
  }) {
    application {
      id
      status
    }
  }
}
```

### 2. Schedule an Interview
```graphql
mutation {
  scheduleInterview(input: {
    applicationId: "APPLICATION_ID"
    date: "2026-04-15"
  }) {
    id
    date
    result
  }
}
```

### 3. Issue & Accept an Offer
```graphql
mutation {
  createOffer(input: { applicationId: "APPLICATION_ID", salary: 85000 }) {
    id salary status
  }
}

mutation {
  updateOfferStatus(id: "OFFER_ID", status: "accepted") {
    id status
  }
}
```

### 4. View Full Applicant History
```graphql
query {
  getApplicationsByApplicant(applicantId: "APPLICANT_ID") {
    id
    status
    job { title status }
  }
}
```

---

## 🔒 Business Rules

| Rule | Behaviour |
|---|---|
| Apply to closed job | ❌ Throws `JOB_CLOSED` GraphQL error |
| Duplicate application | ❌ Throws `DUPLICATE_APPLICATION` error |
| Invalid status value | ❌ Throws `BAD_USER_INPUT` error |
| Applicant history | ✅ All past applications queryable via `getApplicationsByApplicant` |

---

## 📜 License

MIT © [Shlok Kadam](https://github.com/Shlokmonster)
