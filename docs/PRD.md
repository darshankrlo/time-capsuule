# Product Requirements Document: Time Capsule

## 1. Problem Statement
People write notes to their future selves, but existing tools (notes apps, emails) offer no real "lock until a date" experience, no reflection on how they have changed, and no reliable delivery. Time Capsule lets users write a letter that stays sealed until a chosen date, then delivers it with an AI-generated reflection.

## 2. Goals
- Let users create sealed letters with a future unlock date.
- Guarantee a letter cannot be read before its unlock date.
- On unlock, analyse mood and themes with an LLM and notify the user by email.
- Let users revisit past capsules and see how their mood has changed over time.

## 3. Non-Goals
- Social sharing or public capsules
- Mobile app
- Real-time collaboration

## 4. Target Users
- Students and young professionals who journal or set goals.
- Anyone who wants to send a message to their future self.

## 5. User Stories
1. As a user, I can sign up and log in so my capsules are private.
2. As a user, I can create a capsule with a title, letter, unlock date, and optional attachment.
3. As a user, I can see all my capsules, split into locked and unlocked.
4. As a user, I cannot open a locked capsule before its unlock date.
5. As a user, I get an email when a capsule unlocks.
6. As a user, I can read an unlocked capsule along with its AI analysis (mood, themes, summary, reflection question).
7. As a user, I can edit or delete a capsule while it is still locked.
8. As an admin, I can view usage statistics and remove abusive content.

## 6. Functional Requirements
| ID | Requirement |
|----|-------------|
| FR1 | Registration and login with hashed passwords and JWT |
| FR2 | CRUD for capsules (letter content in MongoDB, metadata in PostgreSQL) |
| FR3 | The server rejects content requests for capsules where `unlock_at` is in the future |
| FR4 | A scheduled job runs every hour to find capsules due to unlock |
| FR5 | On unlock, the LLM returns structured JSON: mood, themes, summary, reflection_question |
| FR6 | Email notification on unlock via a third-party email API |
| FR7 | Role-based access: user and admin |
| FR8 | Form validation on the client, request validation on the server |
| FR9 | Rate limiting on auth and capsule creation endpoints |

## 7. Non-Functional Requirements
- Passwords hashed, secrets only in environment variables.
- API responses under 500 ms (excluding LLM calls).
- Responsive UI for mobile and desktop.
- LLM failures must not lose a capsule: retry and fall back to unlocking without analysis.

## 8. Success Metrics
- A letter is delivered within one hour of its unlock time.
- LLM output parses successfully in over 95% of runs.

## 9. Risks
| Risk | Mitigation |
|------|-----------|
| LLM returns invalid JSON | Validate the schema, retry, then fall back |
| Cron job misses a run | Query by `unlock_at <= now()` and `status = 'locked'`, so missed capsules are picked up next run |
| Prompt injection via letter text | Treat the letter as data, use a strict system prompt, validate the output |
| Email delivery fails | Store the status and retry |