import { useServerFn } from "@tanstack/react-start";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { runAi } from "@/lib/ai.functions";

export function useAi() {
  const call = useServerFn(runAi);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (args: {
      system: string;
      prompt: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    }): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await call({ data: args });
        if (result.error) {
          setError(result.error);
          toast.error(result.error);
          return null;
        }
        return result.text;
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Something went wrong while contacting the AI.";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [call],
  );

  return { generate, loading, error };
}
