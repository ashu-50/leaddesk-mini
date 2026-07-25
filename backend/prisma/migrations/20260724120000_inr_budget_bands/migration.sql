-- Rebrand the budget bands from USD to INR.
--
-- Prisma would otherwise drop and recreate the enum type, which destroys the
-- column data. Postgres can rename enum values in place, so the existing rows
-- keep their meaning and no lead loses its budget.
ALTER TYPE "BudgetRange" RENAME VALUE 'UNDER_1K'        TO 'UNDER_50K';
ALTER TYPE "BudgetRange" RENAME VALUE 'FROM_1K_TO_5K'   TO 'FROM_50K_TO_2L';
ALTER TYPE "BudgetRange" RENAME VALUE 'FROM_5K_TO_10K'  TO 'FROM_2L_TO_5L';
ALTER TYPE "BudgetRange" RENAME VALUE 'FROM_10K_TO_25K' TO 'FROM_5L_TO_10L';
ALTER TYPE "BudgetRange" RENAME VALUE 'ABOVE_25K'       TO 'ABOVE_10L';
