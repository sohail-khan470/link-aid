import { FC } from "react";

type Mode = "hourly" | "weekly" | "monthly";

interface ChartTabProps {
  value: Mode;
  onChange: (mode: Mode) => void;
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const ChartTab: FC<ChartTabProps> = ({
  value,
  onChange,
  availableYears,
  selectedYear,
  onYearChange,
}) => {
  const getButtonClass = (option: Mode) =>
    value === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
        {(["hourly", "weekly", "monthly"] as Mode[]).map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-3 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
              option
            )}`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
        {/* Year dropdown */}
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="px-3 py-2 rounded text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-white"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ChartTab;
