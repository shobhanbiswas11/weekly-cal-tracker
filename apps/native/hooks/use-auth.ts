import { useAuth, useUser } from "@clerk/expo";

export function useAppAuth() {
  const { getToken } = useAuth();
  const { user } = useUser();

  return {
    getToken,
    username: user?.username ?? user?.firstName ?? null,
    avatarUrl: user?.imageUrl ?? null,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
  };
}
