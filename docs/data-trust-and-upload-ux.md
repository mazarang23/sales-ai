# Data trust and privacy UX — فروش‌یار

## Product objective
Reduce uncertainty without frightening users or making claims the implementation cannot substantiate. The user should understand what the file is used for, what they can remove before upload, and where to find the actual privacy policy.

## User-facing copy (use only after confirming it matches the actual data flow)
**Near upload button**
«فایل فروش شما برای تهیه تحلیل استفاده می‌شود. اگر فایل شامل اطلاعاتی نیست که برای تحلیل لازم‌اند، می‌توانید پیش از بارگذاری آن‌ها را حذف کنید. جزئیات نگهداری و حذف داده را در سیاست حریم خصوصی بخوانید.»

**Optional concise reassurance**
«برای تحلیل‌های فروش معمولاً شناسه مشتری، تاریخ خرید، مبلغ و در صورت نیاز محصول کافی است؛ نام، شماره تماس و نشانی را فقط وقتی لازم‌اند نگه دارید.»

Avoid saying “فایل شما کاملاً امن است”، “هیچ‌کس به داده‌ها دسترسی ندارد”، “فایل بلافاصله حذف می‌شود” or “داده‌ها به AI ارسال نمی‌شوند” unless verified technically and legally.

## Required technical review before publishing privacy claims
- Trace the upload endpoint and determine whether data is processed in the browser, server, database, logs, object storage, or external providers.
- Check request limits, authentication/authorization, tenant isolation, storage encryption, retention/deletion, backups, and log redaction.
- Identify whether any model/API provider receives raw rows or transformed data, what fields are sent, and applicable provider retention terms.
- Add a clear delete action only if the system can delete all relevant copies or clearly explain remaining backup retention.
- Link a privacy notice describing purpose, processing locations/providers, retention, deletion, and contact route based on verified implementation.
- If external AI processing exists, explain it in plain language and obtain consent where required. Offer a no-AI route only if it is genuinely available.

## File quality and cleanup UX
1. Parse without mutating the uploaded source.
2. Show a pre-analysis report: recognized columns, missing values, invalid dates/amounts, suspicious duplicates, and sample rows.
3. Automatically normalize only high-confidence reversible formatting issues (trim whitespace, normalize digit representation where unambiguous).
4. Suggest, don't silently perform, ambiguous changes: merging similar customer identities, deleting likely duplicates, inferring dates/amounts, or imputing missing values.
5. Show before/after examples and counts; let the user accept or reject each class of change.
6. Keep original input immutable; preserve a clear path to rerun analysis on original or cleaned data.
7. Do not send raw customer data to a third-party AI solely to infer column mapping or clean files unless the user has been informed and the system has an explicit, appropriate consent path. Prefer deterministic mapping first and minimized/obfuscated examples for AI suggestions.

## Acceptance criteria
- No unverified security or deletion promises in marketing or upload UI.
- User can understand data use before uploading.
- Ambiguous data changes require user approval.
- Original file remains unchanged.
- AI processing, if present, is disclosed accurately and can be declined where product design allows.
- Security and retention statements are verified against code, deployment config, and provider terms before publication.
