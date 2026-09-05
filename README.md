# MedLens — Hospital Clinical Information Management System

MedLens is an AI-powered medical information management application designed for Indian healthcare institutions and outpatient clinics. It helps healthcare staff and patients collect, organize, and structure medical records into clean clinical profiles.

> **Notice:** MedLens organizes and displays medical information. It does not replace professional medical diagnosis, clinical judgment, or treatment recommendations.

---

## 🌟 Key Features

### 1. Dual-Role Architecture
- **Role Selection Landing Page**: Clear entry point for Patients and Medical Doctors.
- **Patient Portal**:
  - Self-report symptoms, allergies, ongoing medications, and reasons for visit.
  - Upload medical documents (PDF, JPG, JPEG, PNG).
  - Review AI-extracted laboratory results and explicitly confirm them prior to persistence.
- **Doctor Clinical Dashboard**:
  - Review complete patient records with clear provenance tagging (*Provided by Patient*, *Report Extracted*, *AI Generated*).
  - Two-panel report viewer comparing original scans directly alongside structured extracted data.
  - Clinical verification actions: **Doctor Verify**, **Staff Edit** (with audit preservation), and **Reject**.
  - Patient-friendly, non-diagnostic clinical summaries.

### 2. Strict Source-Only Reference Range Policy
- The system evaluates laboratory parameters **only** against biological reference ranges explicitly printed in the source report.
- Missing ranges are never guessed or inferred from external libraries; they are clearly flagged as `NOT DETERMINABLE` (*"Reference range not provided in source report"*).

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript
- **Bundler & Tooling**: Vite, Oxlint
- **Icons & UI**: Lucide React, Custom Clinical Design System
- **State & Persistence**: LocalStorage with schema validation

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/medepallycharan2008/medlens.git

# Navigate to project folder
cd medlens

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser to `http://localhost:5180/` to test the application.

---

## 🧑‍⚕️ Demo Credentials

| Role | Name | ID / Identifier | Description |
|---|---|---|---|
| **Doctor** | Dr. A. Deshmukh, MD | `DOC-2026-001` or `doctor@apollo.in` | Apollo OPD Ward 3 |
| **Patient** | Ramesh Sharma | `ML-2026-1001` | Pre-seeded patient with CBC tests |
| **Patient** | Priya Patel | `ML-2026-1003` | Pre-seeded patient record |

---

## 🧪 Automated Testing & Verification

MedLens has a comprehensive automated testing suite with **59 passing tests** across 7 test suites covering domain rules, UI workflows, and OCR pipelines.

For detailed test architecture, mocks, and methodology, see [`TESTING.md`](./TESTING.md).

### Run Test Suites
```bash
# Run all 59 tests in headless CI mode
npm run test:run

# Run with V8 code coverage report
npm run test:coverage

# Interactive watch mode
npm test
```

### Test Coverage Highlights
- **100% Deterministic & Headless**: Built on Vitest 5, React Testing Library, and jsdom.
- **Reference Range Policy Tests**: Verifies strict non-inference rules for lab ranges (`NOT_DETERMINABLE`).
- **Clinical Workflow Tests**: Tests verification state machine (`PENDING_VERIFICATION` ➔ `PATIENT_CONFIRMED` ➔ `DOCTOR_VERIFIED`), staff edit audit preservation, and rejection.
- **Dual-Role Auth Tests**: Tests patient ID/phone logins, doctor credential validation, and session persistence.

