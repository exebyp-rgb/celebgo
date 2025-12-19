import { format, parseISO, isToday, isThisWeek, isFuture, isPast } from "date-fns";

/**
 * Formats a date string for display
 */
export function formatDate(dateStr: string, formatStr: string = "PP"): string {
    return format(parseISO(dateStr), formatStr);
}

/**
 * Formats a date with time for display
 */
export function formatDateTime(dateStr: string): string {
    return format(parseISO(dateStr), "PPpp");
}

/**
 * Checks if an event is happening today
 */
export function isEventToday(dateStr: string): boolean {
    return isToday(parseISO(dateStr));
}

/**
 * Checks if an event is happening this week
 */
export function isEventThisWeek(dateStr: string): boolean {
    return isThisWeek(parseISO(dateStr));
}

/**
 * Checks if an event is in the future
 */
export function isEventFuture(dateStr: string): boolean {
    return isFuture(parseISO(dateStr));
}

/**
 * Checks if an event is in the past
 */
export function isEventPast(dateStr: string): boolean {
    return isPast(parseISO(dateStr));
}

/**
 * Returns relative date string (e.g., "Tonight", "Tomorrow", "Jan 15")
 */
export function getRelativeDateString(dateStr: string): string {
    const date = parseISO(dateStr);

    if (isToday(date)) {
        return "Tonight";
    }

    // Return formatted date
    return format(date, "MMM d");
}
