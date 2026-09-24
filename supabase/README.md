
## Community member profiles

Apply `migrations/20260924214849_community_member_profiles.sql` after the base
`schema.sql`. It stores first name, full surname and optional bio separately from
private exchange questionnaires. Members can read their own profile and profiles
of members sharing a cohort **and** group; only the owner can insert/update.
Existing signup names are backfilled without copying emails. New members are
initialized without overwriting later edits.

`tests/member_profiles.sql` verifies ownership, shared-group access, loss of access
after leaving, name validation and anonymous restrictions. Run it against a test
project after migration; its synthetic fixtures are enclosed in a rolled-back
transaction. The frontend validation/request tests also run in `npm test`.
