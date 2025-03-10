import { useState, useCallback } from "react";
import { toast } from "sonner";
type ServerAction<T extends any[], R = any> = (...args: T) => Promise<R>;
export type QueryFunction<T extends any[], R = any> = ServerAction<T, R>;

export const useAction = <T extends any[], R = any>(
  serverAction: ServerAction<T, R>,
): [action: ServerAction<T, R>, isLoading: boolean] => {
  const [isLoading, setIsLoading] = useState(false);

  const action = useCallback(
    async (...args: T): Promise<R> => {
      setIsLoading(true);
      try {
        const result = await serverAction(...args);

        if (result && typeof result === "object") {
          if ("message" in result) {
            toast.success((result as { message: string }).message);
          }
          if ("error" in result) {
            toast.error((result as { error: string }).error);
          }
        }

        return result;
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [serverAction],
  );

  return [action, isLoading];
};
