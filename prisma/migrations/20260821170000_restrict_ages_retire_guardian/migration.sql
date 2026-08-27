-- The strict MVP serves ages 15–18 in one learning mode.
-- Keep legacy columns and the GuardianApproval table for migration compatibility,
-- while removing all approval data and active gating.
UPDATE "Profile"
SET "ageGroup" = 'YOUTH',
    "contentLevel" = 'FOUNDATIONAL',
    "guardianStatus" = 'NOT_REQUIRED'
WHERE "age" BETWEEN 15 AND 18;

UPDATE "Profile"
SET "age" = NULL,
    "ageGroup" = NULL,
    "contentLevel" = NULL,
    "guardianStatus" = 'NOT_REQUIRED'
WHERE "age" IS NOT NULL
  AND ("age" < 15 OR "age" > 18);

DELETE FROM "GuardianApproval";
