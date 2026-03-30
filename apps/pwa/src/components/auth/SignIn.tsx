import { SignIn as ClerkSignIn } from "@clerk/react";

export function SignIn() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-50">
            Weekly Calorie Tracker
          </h1>
          <p className="text-zinc-400 mt-2">Sign in to track your calories</p>
        </div>
        <ClerkSignIn
          routing="hash"
          signUpUrl={undefined}
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
}
