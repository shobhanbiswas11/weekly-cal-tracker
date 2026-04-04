import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInvalidateDashboard } from "@/hooks/dashboard";
import { createProfile } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import type z from "zod";
import type { ProfileSchema } from "../schemas";

interface ProfileSetupPreviewProps extends z.infer<typeof ProfileSchema> {
  onSaved?: () => void;
  onCanceled?: () => void;
}

export function ProfileSetupPreview({
  profile,
  onSaved,
  onCanceled,
}: ProfileSetupPreviewProps) {
  const invalidateDashboard = useInvalidateDashboard();

  const mutation = useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      invalidateDashboard();
      // Notify parent that profile was saved (persists in message state)
      onSaved?.();
    },
  });

  const handleConfirm = () => {
    const body = profile.reduce(
      (acc, { property, value }) => {
        acc[property] = value;
        return acc;
      },
      {} as Record<string, string>,
    );

    mutation.mutate(body);
  };

  const handleCancel = () => {
    // Notify parent that profile setup was canceled (persists in message state)
    onCanceled?.();
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Confirm Profile</CardTitle>
        <CardDescription>
          Please review your profile details before saving.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {profile.map((info) => (
          <p key={info.property}>
            <span className="font-medium">{info.property}:</span> {info.value}
          </p>
        ))}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "An error occurred"}
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleConfirm} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Confirm"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
