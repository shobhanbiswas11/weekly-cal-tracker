import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Toolkit } from "@assistant-ui/react";
import { z } from "zod";

// Schema for the save_profile tool parameters
const SaveProfileSchema = z.object({
  name: z.string().describe("The user's name"),
  dateOfBirth: z.string().describe("Date of birth in YYYY-MM-DD format"),
  biologicalSex: z
    .enum(["male", "female"])
    .describe("Biological sex for metabolic calculations"),
  height: z
    .string()
    .describe("Height value. Include the unit (e.g., 180 cm or 5 ft 11 in)"),
  weight: z.string().describe("Current weight value"),
  primaryGoal: z
    .enum([
      "lose_weight",
      "gain_muscle",
      "maintain",
      "body_recomposition",
      "improve_health",
    ])
    .default("maintain")
    .describe("The user's primary fitness/health goal"),
  additionalNotes: z
    .string()
    .optional()
    .default("")
    .describe(
      "Additional notes like dietary restrictions, allergies, medical conditions, activity level",
    ),
});

// Toolkit with frontend tools
export const toolkit: Toolkit = {
  save_profile: {
    description:
      "Save the user's profile information. Shows a confirmation card before saving.",
    parameters: SaveProfileSchema,
    execute: async (params, { human }) => {
      const confirmed = await human({
        type: "confirmation",
        action: "save-profile",
        details: params,
      });

      if (!confirmed) {
        return { status: "cancelled" };
      }

      // TODO: Save to backend later
      console.log("Saving profile:", params);
      return { status: "saved", profile: params };
    },
    render: ({ result, interrupt, resume }) => {
      if (interrupt) {
        const payload = interrupt.payload as {
          details: z.infer<typeof SaveProfileSchema>;
        };
        const details = payload.details;
        return (
          <Card size="sm">
            <CardHeader>
              <CardTitle>Confirm Profile</CardTitle>
              <CardDescription>
                Please review your profile details before saving.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Name:</span> {details.name}
              </p>
              <p>
                <span className="font-medium">Date of Birth:</span>{" "}
                {details.dateOfBirth}
              </p>
              <p>
                <span className="font-medium">Biological Sex:</span>{" "}
                {details.biologicalSex}
              </p>
              <p>
                <span className="font-medium">Height:</span> {details.height}
              </p>
              <p>
                <span className="font-medium">Weight:</span> {details.weight}
              </p>
              <p>
                <span className="font-medium">Primary Goal:</span>{" "}
                {details.primaryGoal?.replace(/_/g, " ")}
              </p>
              {details.additionalNotes && (
                <p>
                  <span className="font-medium">Notes:</span>{" "}
                  {details.additionalNotes}
                </p>
              )}
            </CardContent>
            <CardFooter className="gap-2">
              <Button onClick={() => resume(true)}>Confirm</Button>
              <Button variant="outline" onClick={() => resume(false)}>
                Cancel
              </Button>
            </CardFooter>
          </Card>
        );
      }

      if (result) {
        return (
          <Card size="sm">
            <CardContent className="pt-4">
              {result.status === "saved"
                ? "✓ Profile saved successfully"
                : "✗ Profile save cancelled"}
            </CardContent>
          </Card>
        );
      }

      return (
        <Card size="sm">
          <CardContent className="pt-4 text-muted-foreground">
            Preparing profile...
          </CardContent>
        </Card>
      );
    },
  },
};
