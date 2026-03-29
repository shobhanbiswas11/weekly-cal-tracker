import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function App() {
  return (
    <div className="min-h-screen bg-background p-4 pb-safe">
      <div className="mx-auto max-w-md">
        <header className="mb-6 pt-safe">
          <h1 className="text-2xl font-bold text-center">
            Weekly Calorie Tracker
          </h1>
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
  )
}

export default App
