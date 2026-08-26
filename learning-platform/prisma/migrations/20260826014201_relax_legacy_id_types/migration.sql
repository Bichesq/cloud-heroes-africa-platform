-- AlterTable
ALTER TABLE "approved_emails" DROP CONSTRAINT "approved_emails_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "approved_emails_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "todos" DROP CONSTRAINT "todos_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "todos_pkey" PRIMARY KEY ("id");
