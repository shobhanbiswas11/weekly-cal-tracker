import { ProfileSetupButton, useIsProfileSetupDone } from "@/features/profile";
import { useDashboard } from "@/hooks/dashboard";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { isLoading, data } = useDashboard();
  const isProfileSetupDone = useIsProfileSetupDone();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    // TODO: If no data is found despite of having a 200, then that's an error, handle that
    return <div>data loading failed</div>;
  }

  if (!isProfileSetupDone) {
    return <ProfileSetupButton />;
  }

  console.log(data);

  return <div></div>;
}
