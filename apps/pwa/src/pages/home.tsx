import { ProfileSetupButton, useIsProfileSetupDone } from "@/features/profile";
import { useDashboard } from "@/hooks/dashboard";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { isLoading } = useDashboard();
  const isProfileSetupDone = useIsProfileSetupDone();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isProfileSetupDone) {
    return <ProfileSetupButton />;
  }

  return <div>Profile Setup will go here</div>;
}
