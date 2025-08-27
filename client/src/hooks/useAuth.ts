import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/user", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Non authentifié");
      }
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user?.user || null,
    isLoading,
    isAuthenticated: !!user?.user,
    isError: !!error,
  };
}

export async function logout() {
  await fetch("/api/auth/logout", { 
    method: "POST",
    credentials: "include"
  });
  window.location.href = "/login";
}