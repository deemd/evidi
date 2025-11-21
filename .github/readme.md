# Evidi – AI Job Response Assistant

**Evidi** is an AI-assisted platform designed to simplify and accelerate the job-search process.
Instead of manually browsing job boards, reviewing long descriptions, and writing tailored responses, Evidi automates the workflow from end to end: collecting job offers, filtering them based on user preferences, summarizing them with LLMs, and generating customizable motivation-letter drafts.

The system is built for clarity, modularity, and cloud deployment. It integrates **n8n** for workflow automation, **FastAPI** for backend services, **MongoDB Atlas** for data storage, **React + TypeScript** for the user interface, and **OpenAI models** for all AI-powered features. The result is a transparent and extensible architecture that can be reused, audited, or expanded by students and developers.

---

## Main Capabilities

Evidi automatically retrieves job postings from RSS feeds, APIs, or email alerts. These offers are standardized and filtered using user-defined criteria such as keywords, skills, job type, or location. Relevant offers are enriched with concise AI-generated summaries that highlight responsibilities, required skills, and key information.

Users may upload their CV, allowing the platform to extract skills and profile details that guide both filtering and AI prompting. For any selected offer, the system can produce a draft motivation letter tailored to the user’s background and the job requirements. Notifications can be sent when strong matches appear, ensuring timely visibility of opportunities.

All interactions take place through a focused dashboard where users manage job feeds, criteria, summaries, letters, CV analysis, and personal settings.

---

## 🧱 System Architecture

Evidi follows a clean separation of concerns:

```
┌────────────────────────┐
│    Job Sources         │
│  RSS / APIs / Email    │
└───────────┬────────────┘
            ↓
     ┌───────────────┐
     │     n8n       │
     │ Ingestion     │
     │ Filtering     │
     │ Summaries     │
     │ Notifications │
     └───────┬───────┘
             ↓
     ┌────────────────┐
     │   FastAPI      │
     │ API + Webhooks │
     │ Auth / Logic   │
     └───────┬────────┘
             ↓
     ┌────────────────┐
     │  MongoDB Atlas │
     │ Users / Jobs   │
     │ Summaries etc. │
     └───────┬────────┘
             ↓
     ┌────────────────┐
     │ React Frontend │
     └────────────────┘
```

---

## 📁 Repository Structure

```
job-response-assistant/
│
├── backend/                           # FastAPI application
│   ├── app/
│   │   ├── main.py                    # Entry point
│   │   ├── api/                       # Routes: auth, jobs, ai, criteria...
│   │   ├── core/                      # Config, security, JWT, hashing
│   │   ├── db/                        # MongoDB client & collections
│   │   ├── services/                  # Business logic (AI, matching, ingestion)
│   │   └── utils/                     # Helpers and shared functions
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/                          # React + TypeScript web interface
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── n8n/                               # Workflow automation layer
│   ├── workflows/                     # JSON exports of automation workflows
│   ├── docs/
│   │   └── workflow_diagram.png       # Architecture diagram
│   └── README.md                      # Explanation of workflow logic
│
├── docs/                              # Technical documentation (LaTeX, specs, diagrams)
│
├── .github/
│   └── ISSUE_TEMPLATE.md
│
├── docker-compose.yml                 # Orchestration for local multi-service setup
└── README.md
```

---

## Technology Overview

The backend uses **FastAPI** for clean API design, authentication, and communication with n8n and the database. **MongoDB Atlas** provides a flexible schema suited for heterogeneous job listings and AI-generated content. **React + TypeScript** powers the frontend with a modular, responsive interface. **n8n** orchestrates ingestion, filtering, summarization, and notifications. AI processing relies on **OpenAI GPT-4/GPT-4o models**, enabling high-quality summarization, CV analysis, and letter generation.
