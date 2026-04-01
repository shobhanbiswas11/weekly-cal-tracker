import { useInitOnBoarding } from "@/features/chat";
import ProfileSetupButton from "@/features/profile/components/profile-setup-button";
import { useDashboard } from "@/hooks/dashboard";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data, isLoading } = useDashboard();
  const { init: initiateOnboarding } = useInitOnBoarding();

  const isProfileSetupComplete = !!data?.profile;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isProfileSetupComplete) {
    return <ProfileSetupButton onClick={initiateOnboarding} />;
  }

  return <div>Profile Setup will go here</div>;
}
