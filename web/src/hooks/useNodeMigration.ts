import { useEffect } from "react";
import { useConnection } from "./useConnection";

export function useNodeMigration(
  onMigrate: (from: string, to: string) => void,
) {
  const { nodeId, previousNodeId } = useConnection();

  useEffect(() => {
    if (nodeId && previousNodeId && nodeId !== previousNodeId) {
      onMigrate(previousNodeId, nodeId);
    }
  }, [nodeId, previousNodeId, onMigrate]);
}
