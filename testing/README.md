# CarePulse — Testing Guide

## Demo Credentials

### Admin
- **Passkey:** `111111`
- **How to use:** Click "Admin" on the home page → enter the 6-digit passkey in the OTP modal

### Patient/User
- **Name:** John Doe
- **Email:** john.doe@test.local
- **Phone:** +15551234567

### Local Mock Data (seeded automatically)
- **Demo User ID:** `demo-user-001`
- **Demo Patient ID:** `demo-patient-001`
- **Demo Appointment ID:** `demo-appt-001`

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file (uses mock mode by default)
cp .env.local.example .env.local

# 3. Start the application in mock mode
npm run dev:mock

# 4. Open http://localhost:3000
```

---

## Running Tests

### All Jest Tests (Frontend + Backend + API)
```bash
npm run test:all
```

### Individual Jest Suites
```bash
npm run test:frontend    # Frontend component tests (Jest + RTL)
npm run test:backend     # Backend/server logic tests (Jest)
npm run test:api         # API validation tests (Jest)
```

### Playwright E2E Tests
```bash
npm run test:e2e              # Headless Chromium
npm run test:e2e:headed       # Visible browser window
npm run test:e2e:report       # Open HTML report
```

### Coverage
```bash
npm run test:coverage
```

---

## Architecture

### Mock Appwrite Layer
The project includes a complete in-memory mock of the Appwrite SDK:
- `testing/mock-appwrite.ts` — MockDatabases, MockUsers, MockStorage, MockMessaging
- `lib/appwrite.config.ts` — Switches between real and mock based on `USE_MOCK_APPWRITE` env var
- `scripts/dev-mock.js` — Starts Next.js dev server with mock mode enabled
- `app/api/mock-reset/route.ts` — API endpoint to reset mock data between E2E tests

### Test Structure
```
testing/
├── frontend/          # Jest + React Testing Library
│   ├── homepage.test.tsx
│   ├── patient-form.test.tsx
│   ├── validation.test.ts
│   └── utils.test.ts
├── backend/           # Jest (Node environment)
│   ├── validation.test.ts
│   ├── utils.test.ts
│   └── appwrite-operations.test.ts
├── api-testing/       # Jest (validation & schema tests)
│   └── api.test.ts
├── e2e/               # Playwright (Chromium)
│   ├── landing-page.spec.ts
│   ├── patient-flow.spec.ts
│   ├── appointment-flow.spec.ts
│   ├── navigation.spec.ts
│   └── error-handling.spec.ts
└── test-data/         # Reusable test fixtures
    ├── patient.ts
    └── appointment.ts
```

---

## Routes Discovered

| Route | Purpose | Backend Dependency |
|-------|---------|-------------------|
| `/` | Landing page + patient form | `createUser()` → Appwrite |
| `/?admin=true` | Admin passkey modal | `NEXT_PUBLIC_ADMIN_PASSKEY` env var |
| `/admin` | Admin dashboard (stat cards + data table) | `getRecentAppointmentList()` → Appwrite |
| `/patients/{userId}/register` | Patient registration form | `getUser()`, `getPatient()`, `registerPatient()` → Appwrite |
| `/patients/{userId}/new-appointment` | Appointment booking form | `getPatient()`, `createAppointment()` → Appwrite |
| `/patients/{userId}/new-appointment/success` | Appointment confirmation | `getAppointment()` → Appwrite |

---

## What Is Mocked
- ✅ Appwrite Users API (create, get, list)
- ✅ Appwrite Databases API (create, get, list, update documents)
- ✅ Appwrite Storage API (create, get, delete files)
- ✅ Appwrite Messaging API (create SMS)
- ✅ Admin passkey verification (client-side)

## What Still Requires Real Appwrite
- ❌ SMS delivery (Twilio via Appwrite)
- ❌ Real file storage and retrieval
- ❌ Real user authentication across sessions
- ❌ Real-time data persistence between server restarts
- ❌ Sentry error reporting (disabled in mock mode)

---

## Environment Variables

| Variable | Required | Mock Value | Purpose |
|----------|----------|------------|---------|
| `NEXT_PUBLIC_ENDPOINT` | Yes | `https://mock-appwrite.io/v1` | Appwrite endpoint |
| `PROJECT_ID` | Yes | `mock-project-id` | Appwrite project |
| `API_KEY` | Yes | `mock-api-key` | Appwrite server key |
| `DATABASE_ID` | Yes | `mock-db` | Database identifier |
| `PATIENT_COLLECTION_ID` | Yes | `patients` | Patient collection |
| `APPOINTMENT_COLLECTION_ID` | Yes | `appointments` | Appointment collection |
| `NEXT_PUBLIC_BUCKET_ID` | Yes | `mock-bucket` | Storage bucket |
| `NEXT_PUBLIC_ADMIN_PASSKEY` | Yes | `111111` | Admin passkey |
| `USE_MOCK_APPWRITE` | No | `true` | Enable mock mode |
