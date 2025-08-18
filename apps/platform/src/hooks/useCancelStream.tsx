import { UseStream } from "@langchain/langgraph-sdk/react";
import { PlannerGraphState } from "@open-swe/shared/open-swe/planner/types";
import { GraphState } from "@open-swe/shared/open-swe/types";
import { useState } from "react";
import { toast } from "sonner";

interface UseCancelStreamProps<State extends PlannerGraphState | GraphState> {
  stream: UseStream<State>;
  threadId?: string;
  runId?: string;
  streamName: "Planner" | "Programmer";
}

export function useCancelStream<State extends PlannerGraphState | GraphState>({
  stream,
  threadId,
  runId,
  streamName,
}: UseCancelStreamProps<State>) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const cancelRun = async () => {
    if (!threadId || !runId) {
      toast.error(`Não é possível cancelar ${streamName}: Thread ou run ID ausente`);
      return;
    }

    try {
      setCancelLoading(true);
      await stream.client.runs.cancel(threadId, runId, true);
      toast.success(`${streamName} cancelado com sucesso`, {
        description: "A operação em execução foi interrompida",
        duration: 5000,
        richColors: true,
      });
    } catch (error) {
      const errorStr = String(error);
      const isAbortError = errorStr.toLowerCase().includes("abort");

      if (isAbortError) {
        toast.info(`Operação ${streamName} cancelada`, {
          description: "O stream foi interrompido com sucesso",
          duration: 5000,
          richColors: true,
        });
      } else {
        console.error(`Error cancelling ${streamName} run:`, error);
        toast.error(`Falha ao cancelar ${streamName}`, {
          description: errorStr || "Erro desconhecido",
          duration: 5000,
          richColors: true,
        });
      }
    } finally {
      setCancelLoading(false);
    }
  };

  return { cancelRun, cancelLoading };
}
