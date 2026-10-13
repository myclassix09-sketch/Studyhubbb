# Studyhub Security Specification & Threat Model

## 1. Data Invariants & Zero-Trust Principles
1. **Curriculum & Content Integrity**: Ordinary students have read-only access to published curriculum (`isPublished == true`). Only verified administrators can create, update, or delete subjects, chapters, lessons, quizzes, and PDF documents.
2. **Student Privacy & Isolation**: A student can only create and read their own quiz attempts (`userId == request.auth.uid`) and progress records (`userId == request.auth.uid`). Cross-student inspection or modification is blocked.
3. **No Self-Privilege Escalation**: Students cannot write to `/admins/{adminId}` or alter roles.
4. **Audit Trail Immutability**: `/audit_logs` are write-only for admins and immutable once written.
5. **Contact Submissions**: Anyone signed in or public can submit feedback, but cannot read or alter submissions.
6. **Path Hardening**: Document IDs and foreign keys are verified against length and alphanumeric constraints.

## 2. Dirty Dozen Security Payloads (Rejected by Rules)
1. **Payload 1 (Self-Admin Grant)**: `POST /admins/{studentUid}` by regular student -> REJECTED.
2. **Payload 2 (Ghost Field Attack)**: `POST /lessons/{id}` with `{ title: "Math", isVerifiedAdmin: true }` -> REJECTED.
3. **Payload 3 (Progress Tampering)**: Student `uid_A` writing `POST /student_progress/{doc}` with `userId: "uid_B"` -> REJECTED.
4. **Payload 4 (Fake Quiz Score Injection)**: Student modifying another student's quiz attempt -> REJECTED.
5. **Payload 5 (Unpublished Content Exfiltration)**: Student reading lesson where `isPublished == false` -> REJECTED.
6. **Payload 6 (Oversized Payload / Denial of Wallet)**: Setting `title` with 100,000 characters -> REJECTED.
7. **Payload 7 (Email Spoofing)**: Attacker with unverified email `myclassix09@gmail.com` trying admin writes -> REJECTED (requires `email_verified == true`).
8. **Payload 8 (Orphaned Write)**: Attempting to update immutable `userId` on a completed quiz attempt -> REJECTED.
9. **Payload 9 (Blanket Query Scraping)**: Running an unfiltered list query across all students' progress -> REJECTED.
10. **Payload 10 (Direct PDF Overwrite)**: Non-admin trying to update `pdf_documents` metadata -> REJECTED.
11. **Payload 11 (Audit Log Destruction)**: Deleting audit history records -> REJECTED.
12. **Payload 12 (Settings Tampering)**: Non-admin changing homepage CTA or site settings -> REJECTED.
