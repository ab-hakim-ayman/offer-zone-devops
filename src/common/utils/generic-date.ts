import { startOfWeek, endOfWeek, subDays, startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subYears } from 'date-fns';

export function calculateDateRange(dateRange: string): { start: Date, end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (dateRange.toUpperCase()) {
        case 'THIS_WEEK':
            start = startOfWeek(now);
            end = endOfWeek(now);
            break;
        case 'LAST_WEEK':
            const lastWeek = subDays(now, 7);
            start = startOfWeek(lastWeek);
            end = endOfWeek(lastWeek);
            break;
        case 'THIS_MONTH':
            start = startOfMonth(now);
            end = endOfMonth(now);
            break;
        case 'LAST_MONTH':
            const lastMonth = subMonths(now, 1);
            start = startOfMonth(lastMonth);
            end = endOfMonth(lastMonth);
            break;
        case 'THIS_QUARTER':
            start = startOfQuarter(now);
            end = endOfQuarter(now);
            break;
        case 'LAST_QUARTER':
            const lastQuarter = subMonths(now, 3);
            start = startOfQuarter(lastQuarter);
            end = endOfQuarter(lastQuarter);
            break;
        case 'THIS_HALF_YEAR':
            const startOfHalfYear = subMonths(now, 6);
            start = startOfQuarter(startOfHalfYear);
            end = endOfQuarter(startOfHalfYear);
            break;
        case 'LAST_HALF_YEAR':
            const lastHalfYear = subMonths(now, 6);
            start = startOfQuarter(lastHalfYear);
            end = endOfQuarter(lastHalfYear);
            break;
        case 'THIS_YEAR':
            start = startOfYear(now);
            end = endOfYear(now);
            break;
        case 'LAST_YEAR':
            const lastYear = subYears(now, 1);
            start = startOfYear(lastYear);
            end = endOfYear(lastYear);
            break;
        default:
            throw new Error(`Unknown date range: ${dateRange}`);
    }

    return { start, end };
}
