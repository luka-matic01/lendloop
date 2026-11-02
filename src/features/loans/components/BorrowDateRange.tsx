import { InlineRange } from "@/components/ui";
import { formatBorrowCalendarDate } from "@/lib/format-borrow-due";
import { cn } from "@/lib/utils";

type BorrowDateRangeProps = {
  startDate: string;
  endDate: string;
  className?: string;
};

export function BorrowDateRange({
  startDate,
  endDate,
  className,
}: BorrowDateRangeProps) {
  return (
    <InlineRange
      className={cn("whitespace-nowrap", className)}
      start={
        <time dateTime={startDate}>
          {formatBorrowCalendarDate(startDate)}
        </time>
      }
      end={
        <time dateTime={endDate}>{formatBorrowCalendarDate(endDate)}</time>
      }
    />
  );
}
