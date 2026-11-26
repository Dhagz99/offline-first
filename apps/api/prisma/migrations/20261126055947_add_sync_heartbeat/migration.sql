-- CreateTable
CREATE TABLE "SyncHeartbeat" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "local_version" BIGINT NOT NULL DEFAULT 0,
    "last_known_central_version" BIGINT NOT NULL DEFAULT 0,
    "sync_enabled" BOOLEAN NOT NULL DEFAULT true,
    "interval_ms" INTEGER NOT NULL DEFAULT 10000,
    "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
    "last_successful_sync_at" TIMESTAMP(3),
    "next_retry_at" TIMESTAMP(3),
    "last_error_code" VARCHAR(100),
    "last_heartbeat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncHeartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SyncHeartbeat_branch_id_key" ON "SyncHeartbeat"("branch_id");

-- CreateIndex
CREATE INDEX "SyncHeartbeat_last_heartbeat_at_idx" ON "SyncHeartbeat"("last_heartbeat_at");

-- AddForeignKey
ALTER TABLE "SyncHeartbeat" ADD CONSTRAINT "SyncHeartbeat_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
