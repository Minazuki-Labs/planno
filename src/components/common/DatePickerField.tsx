import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerFieldProps {
  startDate: Date | null;
  endDate?: Date | null;
  isRange?: boolean;
  inline?: boolean;
  minDate?: Date;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
  onRangeToggle?: (isRange: boolean) => void;
  className?: string;
}

export const DatePickerField = ({
  startDate,
  endDate = null,
  isRange = false,
  inline = false,
  minDate,
  onChange,
  onRangeToggle,
  className = "w-full min-h-[38px] bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 outline-none transition-all",
}: DatePickerFieldProps) => {
  const handleStartDateChange = (date: Date | null) => {
    onChange(date, null);
  };

  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    onChange(start, end);
  };

  if (inline) {
    return (
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={handleRangeChange}
        inline
      />
    );
  }

  return (
    <div className="space-y-2">
      {onRangeToggle && (
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => {
              onRangeToggle(false);
              if (endDate) onChange(startDate, null);
            }}
            className={`py-1 text-[11px] font-medium rounded transition-all min-h-[28px] ${
              !isRange ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Single Day
          </button>
          <button
            type="button"
            onClick={() => onRangeToggle(true)}
            className={`py-1 text-[11px] font-medium rounded transition-all min-h-[28px] ${
              isRange ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Date Range
          </button>
        </div>
      )}

      <div className="w-full relative min-h-[38px]">
        {isRange ? (
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleRangeChange}
            minDate={minDate}
            isClearable
            placeholderText="Select range (Start → End)"
            dateFormat="yyyy/MM/dd"
            className={className}
            wrapperClassName="w-full"
          />
        ) : (
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            minDate={minDate}
            isClearable
            placeholderText="Select Date"
            dateFormat="yyyy/MM/dd"
            className={className}
            wrapperClassName="w-full"
          />
        )}
      </div>
    </div>
  );
};
