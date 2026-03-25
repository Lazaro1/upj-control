-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ativo', 'inativo', 'licenciado', 'remido');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('pendente', 'parcialmente_paga', 'paga', 'cancelada', 'estornada');

-- CreateEnum
CREATE TYPE "CashTransactionType" AS ENUM ('entrada', 'saida');

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'ativo',
    "joined_at" TIMESTAMP(3),
    "notes_internal" TEXT,
    "credit_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charge_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_amount" DECIMAL(10,2),
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charge_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charges" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "charge_type_id" TEXT NOT NULL,
    "competence_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'pendente',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "payment_date" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" TEXT,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "charge_id" TEXT NOT NULL,
    "allocated_amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "owner_type" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_charge_rules" (
    "id" TEXT NOT NULL,
    "charge_type_id" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "amount" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "params_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_charge_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_transactions" (
    "id" TEXT NOT NULL,
    "type" "CashTransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "transaction_date" DATE NOT NULL,
    "related_member_id" TEXT,
    "related_payment_id" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_data_json" JSONB,
    "new_data_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_closings" (
    "id" TEXT NOT NULL,
    "competence_month" INTEGER NOT NULL,
    "competence_year" INTEGER NOT NULL,
    "closed_by" TEXT,
    "closed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_charged" DECIMAL(10,2) NOT NULL,
    "total_received" DECIMAL(10,2) NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "period_closings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_clerk_user_id_key" ON "members"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "period_closings_competence_month_competence_year_key" ON "period_closings"("competence_month", "competence_year");

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_charge_type_id_fkey" FOREIGN KEY ("charge_type_id") REFERENCES "charge_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "charges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_charge_rules" ADD CONSTRAINT "recurring_charge_rules_charge_type_id_fkey" FOREIGN KEY ("charge_type_id") REFERENCES "charge_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_related_payment_id_fkey" FOREIGN KEY ("related_payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "members"("clerk_user_id") ON DELETE SET NULL ON UPDATE CASCADE;
