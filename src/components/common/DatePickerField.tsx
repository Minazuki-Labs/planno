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
  className = "w-full bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-sm text-slate-200",
}: DatePickerFieldProps) => {
  const handleStartDateChange = (date: Date | null) => {
    let newEnd = endDate;
    if (date && endDate && date > endDate) {
      newEnd = date;
    }
    onChange(date, newEnd);
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
        <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => onRangeToggle(false)}
            className={`py-0.5 text-[10px] font-medium rounded transition-all ${
              !isRange ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Single Day
          </button>
          <button
            type="button"
            onClick={() => onRangeToggle(true)}
            className={`py-0.5 text-[10px] font-medium rounded transition-all ${
              isRange ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Date Range
          </button>
        </div>
      )}

      {isRange ? (
        <div className="space-y-1.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2">
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            minDate={minDate}
            isClearable
            placeholderText="Start Date"
            dateFormat="yyyy/MM/dd"
            className={className}
            wrapperClassName="w-full"
          />
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => onChange(startDate, date)}
            minDate={startDate || minDate}
            isClearable
            placeholderText="End Date"
            dateFormat="yyyy/MM/dd"
            className={className}
            wrapperClassName="w-full"
          />
        </div>
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
  );
};
