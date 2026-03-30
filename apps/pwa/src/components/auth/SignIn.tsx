import { SignIn as ClerkSignIn } from "@clerk/react";

export function SignIn() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Weekly Calorie Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to track your calories
          </p>
        </div>
        <ClerkSignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-border shadow-lg",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              formFieldLabel: "text-foreground",
              formFieldInput:
                "bg-background border-input text-foreground focus:ring-ring",
              footerActionLink: "text-primary hover:text-primary/80",
            },
          }}
          routing="hash"
          signUpUrl={undefined}
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
}
