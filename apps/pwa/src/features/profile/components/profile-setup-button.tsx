import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function ProfileSetupButton({
  onClick,
}: {
  onClick: () => unknown;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center gap-6  p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Welcome! 👋</h2>
          <p className="text-sm text-muted-foreground">
            Set up your profile to start tracking your calories and reach your
            health goals.
          </p>
        </div>
        <Button size="lg" className="w-full gap-2" onClick={onClick}>
          Get Started
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
