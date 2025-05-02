import { QueryCache, QueryClient } from "@tanstack/react-query";
import { handleError } from "./handleError";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      handleError(error);
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
