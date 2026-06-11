type Props = {
  cohort: string;
  progress: number;
  modulesCompleted: number;
  totalModules: number;
};

export default function ProgressWidget({
  cohort,
  progress,
  modulesCompleted,
  totalModules,
}: Props) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Programme</p>
          <p className="text-sm font-medium">{cohort}</p>
        </div>
        <span className="text-2xl font-semibold text-blue-600">{progress}%</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-gray-400">
        {modulesCompleted} of {totalModules} modules completed
      </p>
    </div>
  );
}