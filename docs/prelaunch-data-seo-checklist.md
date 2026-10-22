# Pre-launch data and search readiness checklist

This checklist is intentionally non-destructive. Do not clear the production database until each gate below is complete.

## Before any database reset

- [ ] Confirm the exact production database host and environment; never assume local and production share a database.
- [ ] Take a full PostgreSQL backup and verify restore into a separate temporary database.
- [ ] Export a count of each important table (User, Subscription, Upload, DataRow, Insight, Recommendation, Booking, Message, Review, Ticket, BlogPost).
- [ ] Decide in writing which rows are disposable test data and which must be retained (admins, paid subscriptions, audit/payment references, published blog posts).
- [ ] Apply schema changes to a staging database first; verify generated Prisma Client and production build.
- [ ] Prefer a targeted cleanup script in a transaction with explicit IDs/criteria over `prisma db push --force-reset` or dropping all tables.
- [ ] Run smoke tests after cleanup: Google sign-in, OTP sign-in and phone change, upload, append, mapping, analysis, billing, admin and blog.
- [ ] Keep the backup until the new system has passed smoke tests and the retention window has expired.

## Identity and phone number

- Google identity proves access to the Google account, not ownership of a phone number.
- A phone is verified only after a valid OTP. Store the verification timestamp separately from the phone field.
- Never create a second user when a signed-in user changes their phone number.
- Reject a phone number already attached to a different account; do not transfer accounts automatically.
- Before deployment, confirm the SMS provider is configured and test rate limits, expiry, wrong codes and duplicate-phone conflicts.

## Upload append acceptance tests

- Append a file with the same headers: new rows are added, existing rows remain, row count and file size update.
- Append a file with missing/renamed mapped columns: request is rejected before writing rows.
- Verify all derived insights and recommendations are invalidated/recomputed after append.
- Test a repeated file and repeated order IDs. The current schema does not enforce deduplication of business rows; define a business key before promising duplicate prevention.
- Test failure during a large upload. If partial rows can be written, implement transactional/chunk-recovery handling before relying on append for critical data.
- Verify currency, dates, quantity and customer normalization are identical between initial upload and append.

## SEO and GEO release checks

- Set `NEXT_PUBLIC_APP_URL=https://foorooshyaar.ir` in the production environment.
- Check `/robots.txt` and `/sitemap.xml` on the deployed domain; ensure they contain production absolute URLs.
- Confirm only public, canonical, indexable pages are in the sitemap; do not include account, login, admin, API or utility pages.
- Add the domain to Google Search Console and submit `https://foorooshyaar.ir/sitemap.xml`.
- Inspect important URLs using URL Inspection; fix noindex, canonical, 404, redirect and rendered-content problems.
- Add unique page titles/descriptions, clear H1/H2 structure, internal links and useful Persian content based on real search intent.
- Add structured data only where it accurately represents visible page content. Never add fake reviews, prices or organization claims.
- Track impressions, clicks, CTR, indexed URLs and conversions monthly. Search rankings and AI citations cannot be guaranteed.

## Rollout order

1. Review this PR and run CI/build.
2. Deploy additive schema changes and verify Prisma generation.
3. Configure/test SMS and verify phone change in staging.
4. Deploy upload display names and append safeguards; test using synthetic spreadsheets.
5. Verify SEO files on the live domain and Search Console.
6. Only then decide whether any production data should be cleaned.
