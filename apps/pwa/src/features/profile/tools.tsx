import { Card, CardContent } from "@/components/ui/card";
import type { Toolkit } from "@/features/chat";
import { schemaCreateProfile } from "@weekly-cal/core";
import { ProfileSetupPreview } from "./components/profile-setup-preview";
import type { ProfileResult } from "./types";

export const profileTools: Toolkit = {
  preview_profile_setup: {
    description:
      "Preview the user's profile information for confirmation before saving.",
    parameters: schemaCreateProfile,
    render: ({ args, result, addResult }) => {
      const parsedArgs = schemaCreateProfile.safeParse(args);
      const typedResult = result as ProfileResult | undefined;

      // Show receipt if action was already taken
      if (typedResult?.action === "saved") {
        return (
          <Card size="sm">
            <CardContent className="text-muted-foreground">
              Profile saved successfully.
            </CardContent>
          </Card>
        );
      }

      if (typedResult?.action === "canceled") {
        return (
          <Card size="sm">
            <CardContent className="text-muted-foreground">
              Profile setup canceled.
            </CardContent>
          </Card>
        );
      }

      if (parsedArgs.success) {
        return (
          <ProfileSetupPreview
            profile={parsedArgs.data}
            onSaved={() =>
              addResult({ action: "saved" } satisfies ProfileResult)
            }
            onCanceled={() =>
              addResult({ action: "canceled" } satisfies ProfileResult)
            }
          />
        );
      }

      return (
        <Card size="sm">
          <CardContent className="text-muted-foreground">
            Preparing profile...
          </CardContent>
        </Card>
      );
    },
  },
};
