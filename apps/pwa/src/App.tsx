import { SignIn } from "@/components/auth/SignIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Show, UserButton } from "@clerk/react";

function App() {
  return (
    <>
      <Show when="signed-out">
        <SignIn />
      </Show>
      <Show when="signed-in">
        <div className="h-svh bg-background p-4 pb-safe">
          <div className="mx-auto max-w-md">
            <header className="mb-6 pt-safe flex items-center justify-between">
              <h1 className="text-2xl font-bold">Weekly Calorie Tracker</h1>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </header>

            <main className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Calories</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Start tracking your calories!
                  </p>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </Show>
    </>
  );
}

export default App;
