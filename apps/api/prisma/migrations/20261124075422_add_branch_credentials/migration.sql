-- CreateTable
CREATE TABLE "branch_credentials" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "key_prefix" VARCHAR(32) NOT NULL,
    "key_hash" VARCHAR(64) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branch_credentials_key_hash_key" ON "branch_credentials"("key_hash");

-- CreateIndex
CREATE INDEX "branch_credentials_branch_id_is_active_idx" ON "branch_credentials"("branch_id", "is_active");

-- AddForeignKey
ALTER TABLE "branch_credentials" ADD CONSTRAINT "branch_credentials_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
