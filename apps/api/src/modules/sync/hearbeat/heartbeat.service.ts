import type {
  SyncHeartbeatInput,
  SyncHeartbeatResponse,
} from "@repo/shared";

import {
  saveHeartbeatRepo,
} from "./heartbeat.repository";

export async function saveHeartbeatService(
  branch: {
    id: string;
    branchCode: string;
  },
  input: SyncHeartbeatInput
): Promise<SyncHeartbeatResponse> {
  const result = await saveHeartbeatRepo(
    branch.id,
    input
  );

  return {
    branchId: branch.id,

    branchCode: branch.branchCode,

    localVersion:
      result.heartbeat.localVersion.toString(),

    centralVersion:
      result.centralVersion.toString(),

    receivedAt:
      result.heartbeat.lastHeartbeatAt.toISOString(),
  };
}