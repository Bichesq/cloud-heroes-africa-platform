type LastAssessment = {
  title: string;
  score: number;
  maxScore: number;
  date: string;
  status: "passed" | "failed";
};

type NextAssessment = {
  title: string;
  due: string;
  type: string;
};

type Props = {
  last: LastAssessment;
  next: NextAssessment;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function AssessmentCard({ last, next }: Props) {
  const passed = last.status === "passed";

  return (
    <div className="card flex flex-col gap-5">
      {/* Last assessment */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Last assessment</p>
        <p className="text-sm font-medium mb-1">{last.title}</p>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              passed
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {passed ? "Passed" : "Failed"}
          </span>
          <span className="text-sm font-semibold">
            {last.score}/{last.maxScore}
          </span>
          <span className="text-xs text-gray-400">{formatDate(last.date)}</span>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Next assessment */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Next assessment</p>
        <p className="text-sm font-medium mb-1">{next.title}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {next.type}
          </span>
          <span className="text-xs text-gray-400">Due {formatDate(next.due)}</span>
        </div>
      </div>
    </div>
  );
}