import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

export const useAuthBootstrap = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  return useQuery({
    queryKey: ["auth", "bootstrap"],
    queryFn: async () => {
      await checkAuth();
      return true;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
};
