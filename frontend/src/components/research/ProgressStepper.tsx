import { RESEARCH_STAGES } from "../../utils/constants";

interface ProgressStepperProps {
  activeStep: number;
  status: "idle" | "loading" | "success" | "error";
}

export function ProgressStepper({ activeStep, status }: ProgressStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {RESEARCH_STAGES.map((label, index) => (
          <div key={label} className="flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm mb-1 
                ${
                  index <= activeStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-xs ${
                index <= activeStep
                  ? "text-blue-400"
                  : "text-gray-500"
              } hidden md:inline`}
            >
              {label.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      <div className="relative bg-gray-900 h-2 rounded overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500 ease-in-out ${
            status === "loading" ? "animate-pulse" : ""
          }`}
          style={{
            width: `${
              status === "success"
                ? "100"
                : status === "loading"
                ? Math.min((activeStep / (RESEARCH_STAGES.length - 1)) * 100, 100)
                : "0"
            }%`,
          }}
        />
      </div>
    </div>
  );
}
