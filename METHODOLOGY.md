# Global Standard for Project Documentation

**Status:** Adopted standard for full-stack and product applications  
**Scope:** README and linked project documentation (API, env, deployment, schema)  
**Objective:** Ensure every project can be understood, run, and maintained by any developer in minimal time, with consistent structure across repositories.

---

## 1. Principles

| Principle | Requirement |
|-----------|-------------|
| **Clarity** | Every section answers a single question. No jargon without definition. |
| **Completeness** | A new team member can go from clone to running app (and deploy) using only this repo's docs. |
| **Consistency** | Section order and naming follow this standard so readers know where to find what. |
| **Maintainability** | Docs are part of the product: update them with code changes; link to single sources of truth. |
| **Emphasis** | Critical information (security, env, deploy) is clearly highlighted; optional vs required is explicit. |

**Non-goals:** This standard does not define coding style, architecture patterns, or tooling choices—only how we document them.

---

## 2. Mandatory Sections (in order)

Projects **MUST** include the following sections in the README in this order. Each section has a clear purpose and acceptance criteria.

---

### 2.1 Project overview

**Purpose:** Answer "What is this and why does it exist?"

**Required content:**
- **One-sentence summary:** What the application does and for whom (e.g. "Platform for citizen engagement with elections: vote, news, comments, and live chat.").
- **Feature list:** 5–15 bullet points; each starts with a **bold** label and one line of description. Group by domain (e.g. Core, Admin, Integrations) if the list is long.
- **Target users (optional but recommended):** e.g. "Citizens, election admins, moderators."

**Acceptance criteria:**
- A stakeholder can decide in under 60 seconds whether this repo is the right one.
- No reader needs to open the code to understand the product's value.

---

### 2.2 Architecture and data flow

**Purpose:** Show how the system is built and how data and control move through it.

**Required content:**
- **High-level architecture:** Frontend (SPA/SSR, entry routes), backend (API style, runtime), database, external services. One short paragraph or a bullet list.
- **Data flow:** Who talks to whom (e.g. "Browser → Vite dev server / static build → Express API → Supabase"). Call out any serverless or proxy (e.g. `/api` → serverless backend).
- **Boundaries:** Public vs authenticated vs admin; where auth is enforced (middleware, route guards). Where primary state lives (e.g. React context, Supabase, Redis).

**Acceptance criteria:**
- A new developer can draw a one-page diagram from this section alone.
- Security boundaries (public vs protected vs admin) are explicit.

**Emphasis:** Use a **Security & boundaries** sub-bullet if the app has sensitive roles or data.

---

### 2.3 Project structure | 2.4 Tech stack | 2.5 User flows | 2.6 Quick start | 2.7 API overview | 2.8 Database | 2.9 Authentication | 2.10 Frontend services | 2.11 Admin and special areas | 2.12 Documentation index | 2.13 Development | 2.14 Deployment | 2.15 License and contributing

*(Full definitions, acceptance criteria, and emphasis rules for each section are as in the canonical standard. See the repository that owns the canonical METHODOLOGY.md for the complete text.)*

**Summary:** Project structure (tree + conventions) → Tech stack (frontend, backend, infra) → User flows (primary personas, step-by-step) → Quick start (prerequisites, **required** env, DB, run, troubleshooting) → API overview (base URL, auth, endpoint groups, link to full doc) → Database (system, schema summary, setup) → Authentication (register/login, client usage) → Frontend services (location, list, one example) → Admin/special areas (URLs, capabilities) → Documentation index (links) → Development (commands) → Deployment (**required** and **security-sensitive** env called out) → License and contributing.

---

## 3. Compliance and maintenance

- **Adoption:** Projects declare adherence in the README (e.g. "This README follows the [Global Standard for Project Documentation](./METHODOLOGY.md).").
- **Reviews:** When adding major features or changing architecture, update the README (overview, architecture, user flows, API, deploy) in the same PR.
- **Single source of truth:** Prefer linking to one file (e.g. ENV.md, CRUD_IMPLEMENTATION.md) over duplicating long lists in the README.

---

## 4. Summary checklist

Before considering the README "done," confirm: overview (summary + features) → architecture and data flow (with security boundaries) → project structure → tech stack → user flows → quick start (required env, troubleshooting) → API overview → database → authentication → frontend services → admin/special areas → documentation index → development → deployment (required and security-sensitive env) → license and contributing.

---

*This standard is maintained as part of the project documentation practice. Use it across repositories to keep onboarding fast and structure consistent.*
