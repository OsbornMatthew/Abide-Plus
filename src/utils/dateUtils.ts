/**
 * Local timezone-safe Date utilities for Abide+
 * Avoids UTC boundary drift from toISOString() in non-UTC timezones (e.g. IST, EDT, PST).
 */

/**
 * Returns YYYY-MM-DD in local timezone
 */
export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns YYYY-MM-DD for yesterday in local timezone
 */
export const getYesterdayLocalDateString = (d: Date = new Date()): string => {
  const yesterday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  return getLocalDateString(yesterday);
};

/**
 * Returns an array of past N days in local timezone
 */
export const getPastNDays = (
  numDays: number = 7,
  locale: string = 'en-US'
): { dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] => {
  const todayStr = getLocalDateString();
  const now = new Date();

  return Array.from({ length: numDays }, (_, i) => {
    const offset = numDays - 1 - i;
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const dateStr = getLocalDateString(d);
    const dayName = d.toLocaleDateString(locale, { weekday: 'narrow' });
    const dayNum = d.getDate();
    return {
      dateStr,
      dayName,
      dayNum,
      isToday: dateStr === todayStr,
    };
  });
};

/**
 * Calculates current active streak for a habit based on local calendar dates.
 * Rule:
 * - A streak is active if completed TODAY or YESTERDAY.
 * - If not completed today and not completed yesterday, streak is broken (0).
 * - A streak CANNOT continue from the day before yesterday if yesterday was missed.
 */
export const calculateHabitStreak = (completedDates: string[] = []): number => {
  if (!completedDates || completedDates.length === 0) return 0;

  const datesSet = new Set(completedDates);
  const todayStr = getLocalDateString();
  const yesterdayStr = getYesterdayLocalDateString();

  const isCompletedToday = datesSet.has(todayStr);
  const isCompletedYesterday = datesSet.has(yesterdayStr);

  // If completed neither today nor yesterday, streak is broken
  if (!isCompletedToday && !isCompletedYesterday) {
    return 0;
  }

  let streak = 0;
  const now = new Date();
  let currentCheckDate = isCompletedToday
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  while (true) {
    const checkStr = getLocalDateString(currentCheckDate);
    if (datesSet.has(checkStr)) {
      streak++;
      // Step back exactly one calendar day
      currentCheckDate = new Date(
        currentCheckDate.getFullYear(),
        currentCheckDate.getMonth(),
        currentCheckDate.getDate() - 1
      );
    } else {
      break;
    }
  }

  return streak;
};
