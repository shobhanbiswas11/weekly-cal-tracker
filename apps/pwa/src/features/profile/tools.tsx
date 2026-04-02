import { Card, CardContent } from "@/components/ui/card";
import type { Toolkit } from "@/features/chat";
import { ProfileSetupConfirmation } from "./components/profile-setup-confirmation";
import { ProfileSchema } from "./schemas";

export const profileTools: Toolkit = {
  save_profile: {
    description:
      "Save the user's profile information. Shows a confirmation card before saving.",
    parameters: ProfileSchema,
    render: ({ args }) => {
      const parsedArgs = ProfileSchema.safeParse(args);

      if (parsedArgs.success) {
        return <ProfileSetupConfirmation profile={parsedArgs.data.profile} />;
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
