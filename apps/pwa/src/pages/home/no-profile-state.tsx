import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { useNavigate } from "react-router";

export function NoProfileState() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Target className="h-9 w-9 text-primary" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">No profile set up yet</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Set up your profile so we can calculate your personalized daily
          calorie budget, macros, and weekly goals.
        </p>
      </div>
      <Button onClick={() => navigate("/chat")}>
        Set Up with AI Assistant
      </Button>
    </div>
  );
}
