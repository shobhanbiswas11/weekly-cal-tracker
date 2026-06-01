import { useAuth, useUser } from "@clerk/expo";

export function useAppAuth() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return {
    getToken,
    isSignedIn,
    isLoaded,
    userId: user?.id ?? null,
    username: user?.username ?? user?.firstName ?? null,
    avatarUrl: user?.imageUrl ?? null,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
  };
}
