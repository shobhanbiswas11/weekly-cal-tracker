interface DailySummaryCardProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goalCalories?: number;
}

export function DailySummaryCard({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  goalCalories = 2000,
}: DailySummaryCardProps) {
  const progress = Math.min((totalCalories / goalCalories) * 100, 100);
  const isOverGoal = totalCalories > goalCalories;

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="text-3xl font-bold text-zinc-50">
            {totalCalories.toLocaleString()}
          </span>
          <span className="text-zinc-500 ml-1">cal</span>
        </div>
        <span className="text-sm text-zinc-500">
          / {goalCalories.toLocaleString()} goal
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverGoal ? "bg-red-500" : "bg-lime-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Macros grid */}
      <div className="grid grid-cols-3 gap-3">
        <MacroItem label="Protein" value={totalProtein} unit="g" color="blue" />
        <MacroItem label="Carbs" value={totalCarbs} unit="g" color="amber" />
        <MacroItem label="Fat" value={totalFat} unit="g" color="purple" />
      </div>
    </div>
  );
}

interface MacroItemProps {
  label: string;
  value: number;
  unit: string;
  color: "blue" | "amber" | "purple";
}

function MacroItem({ label, value, unit, color }: MacroItemProps) {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };

  return (
    <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="font-semibold">
        {value}
        <span className="text-xs ml-0.5">{unit}</span>
      </p>
    </div>
  );
}
