# Cruitor.com — System Architecture

## Product Overview

Cruitor.com is an automation platform that helps users find company hiring emails and send outreach messages directly from their Gmail account.

The system allows users to:

1. Login securely
2. Connect their Gmail account
3. Search for company HR / careers emails
4. Send outreach emails with one click

The platform automates email discovery, validation, and sending.

---

## Core Technologies

| Component | Technology |
|-----------|------------|
| Authentication | AWS Cognito |
| Backend | AWS Lambda |
| API Layer | API Gateway |
| Database | DynamoDB |
| Search | Web Search API |
| AI Filtering | LLM |
| Email Sending | Gmail API |

---

## High-Level System Flow

```
User Login
    ↓
Cognito Authentication
    ↓
User Onboarding
    ↓
Connect Gmail (OAuth)
    ↓
Store Gmail Tokens
    ↓
User enters company name
    ↓
Lambda searches company emails
    ↓
Emails returned to frontend
    ↓
User selects email template
    ↓
Lambda validates emails
    ↓
Lambda sends emails via Gmail API
    ↓
Success response
```

---

## Step 1 — User Authentication

Users authenticate using **AWS Cognito**.

### Flow

1. User visits `cruitor.com`
2. User signs in / signs up
3. Cognito authenticates user
4. Cognito returns a JWT token
5. Token is used for authenticated API calls

### Result

```
User authenticated
UserId available in backend
```

---

## Step 2 — Gmail Onboarding

Users must connect their Gmail account. This allows Cruitor to send emails on their behalf.

### OAuth Flow

```
User clicks "Connect Gmail"
    ↓
Google OAuth authorization
    ↓
User grants permission
    ↓
Access token + refresh token returned
```

### Required Gmail Scope

```
https://www.googleapis.com/auth/gmail.send
```

### Stored Data

Tokens are securely stored in the database.

```
UserId
gmail_access_token
gmail_refresh_token
gmail_connected = true
```

> Tokens should be encrypted before storage.

---

## Step 3 — Company Search

User enters a company name in the UI.

**Example inputs:**
```
Nvidia
Stripe
Microsoft
OpenAI
```

Frontend sends request:

```
POST /search-company
```

**Example request body:**

```json
{
  "company": "Stripe"
}
```

---

## Step 4 — Email Discovery Lambda

Backend Lambda performs email discovery.

**Responsibilities:**

1. Identify company domain
2. Search for relevant company pages
3. Crawl discovered pages
4. Extract all email addresses
5. Filter HR-related emails

---

## Step 5 — Search Phase

Lambda queries a search API.

**Example search queries:**

```
site:company.com careers email
site:company.com hr contact
company hiring email
```

**Possible APIs:**
- Brave Search API
- Google Custom Search API

---

## Step 6 — Crawling Phase

Crawler visits pages such as:

```
company.com/careers
company.com/contact
company.com/jobs
```

All emails are extracted using regex.

### Regex Pattern

```
[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}
```

### Example Extracted Emails

```
support@company.com
press@company.com
careers@company.com
jobs@company.com
hr@company.com
john@company.com
```

---

## Step 7 — LLM Filtering

The system uses an LLM to identify relevant hiring emails.

### Input

List of extracted emails.

**Example:**
```
support@company.com
press@company.com
careers@company.com
admin@company.com
```

### LLM Task

Return only emails related to:
- HR
- Recruitment
- Hiring
- Careers

### Expected Output

```
careers@company.com
jobs@company.com
hr@company.com
```

---

## Step 8 — Return Emails to Frontend

Lambda returns the filtered email list.

**Example response:**

```json
{
  "emails": [
    "careers@company.com",
    "jobs@company.com"
  ]
}
```

Frontend displays discovered emails.

---

## Step 9 — Email Template

User selects or writes a message template.

**Example template:**

```
Subject: Internship Opportunity Inquiry

Hello,

I hope you are doing well.

I am reaching out to explore internship opportunities at your company.

Best regards
```

User clicks **Send Email**.

---

## Step 10 — Email Validation Lambda

Before sending, emails are validated.

**Checks include:**
- Correct email format
- Domain validity
- Optional SMTP verification

Invalid emails are removed before sending.

---

## Step 11 — Email Sending Lambda

Emails are sent through the Gmail API.

### Endpoint

```
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
```

Email must be RFC-822 formatted and Base64 encoded.

### Example Structure

```
From: user@gmail.com
To: careers@company.com
Subject: Internship Inquiry

Message body...
```

---

## Step 12 — Success Response

Backend returns sending results.

**Example:**

```json
{
  "status": "success",
  "sent": 2,
  "failed": 0
}
```

Frontend shows confirmation:

```
✅ Emails sent successfully
```

---

## System Architecture Diagram

```
Frontend (cruitor.com)
        │
        ▼
  API Gateway
        │
        ▼
Lambda (Email Discovery)
        │
        ▼
   Search API
        │
        ▼
    Crawler
        │
        ▼
  LLM Filter
        │
        ▼
 Return Emails
        │
        ▼
 User Template
        │
        ▼
Lambda (Validate + Send)
        │
        ▼
   Gmail API
```

---

## User Experience

The final user experience is a one-click outreach workflow.

```
Login
  ↓
Connect Gmail
  ↓
Enter Company
  ↓
Emails Found
  ↓
Click Send
  ↓
Emails Sent ✅
```

---

## Future Enhancements

Possible improvements for future versions:

- Follow-up automation
- Reply detection
- Lead tracking
- CRM integration
- Outreach analytics