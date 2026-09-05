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

/**
 * Calculates the true all-time best streak (longest consecutive run of completed dates).
 */
export const calculateBestHabitStreak = (completedDates: string[] = []): number => {
  if (!completedDates || completedDates.length === 0) return 0;

  const sortedUnique = Array.from(new Set(completedDates)).sort();
  if (sortedUnique.length === 0) return 0;

  let maxStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedUnique.length; i++) {
    const prevParts = sortedUnique[i - 1].split('-').map(Number);
    const currParts = sortedUnique[i].split('-').map(Number);

    const prevDate = new Date(prevParts[0], prevParts[1] - 1, prevParts[2]);
    const currDate = new Date(currParts[0], currParts[1] - 1, currParts[2]);

    // Check if currDate is exactly 1 day after prevDate
    const expectedNext = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 1);

    if (
      expectedNext.getFullYear() === currDate.getFullYear() &&
      expectedNext.getMonth() === currDate.getMonth() &&
      expectedNext.getDate() === currDate.getDate()
    ) {
      currentRun++;
    } else {
      currentRun = 1;
    }

    if (currentRun > maxStreak) {
      maxStreak = currentRun;
    }
  }

  return maxStreak;
};

/**
 * Formats a Date object or string (YYYY-MM-DD or DD-MM-YYYY or ISO) to DD-MM-YYYY.
 */
export const formatDateDDMMYYYY = (input?: string | Date | null): string => {
  if (!input) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return '';
    const day = String(input.getDate()).padStart(2, '0');
    const month = String(input.getMonth() + 1).padStart(2, '0');
    const year = input.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const str = input.trim();
  // If already DD-MM-YYYY (e.g. 05-09-2026 or 5-9-2026)
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = ddmmyyyyMatch[1].padStart(2, '0');
    const month = ddmmyyyyMatch[2].padStart(2, '0');
    const year = ddmmyyyyMatch[3];
    return `${day}-${month}-${year}`;
  }

  // If YYYY-MM-DD (e.g. 2026-09-05 or ISO 2026-09-05T...)
  const yyyymmddMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (yyyymmddMatch) {
    const year = yyyymmddMatch[1];
    const month = yyyymmddMatch[2].padStart(2, '0');
    const day = yyyymmddMatch[3].padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  return str;
};

/**
 * Parses any date string (DD-MM-YYYY or YYYY-MM-DD or Date) into standard ISO YYYY-MM-DD.
 */
export const parseDateToISO = (input?: string | Date | null): string => {
  if (!input) {
    return getLocalDateString();
  }

  if (input instanceof Date) {
    return getLocalDateString(input);
  }

  const str = input.trim();
  // Check DD-MM-YYYY
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = ddmmyyyyMatch[1].padStart(2, '0');
    const month = ddmmyyyyMatch[2].padStart(2, '0');
    const year = ddmmyyyyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Check YYYY-MM-DD
  const yyyymmddMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (yyyymmddMatch) {
    const year = yyyymmddMatch[1];
    const month = yyyymmddMatch[2].padStart(2, '0');
    const day = yyyymmddMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return str;
};

/**
 * Returns today's date formatted as DD-MM-YYYY.
 */
export const getTodayDDMMYYYY = (): string => {
  return formatDateDDMMYYYY(new Date());
};

/**
 * Adjusts a DD-MM-YYYY date by a specified number of days (e.g., +1, -1).
 */
export const shiftDateDDMMYYYY = (currentDDMMYYYY: string, daysDelta: number): string => {
  const iso = parseDateToISO(currentDDMMYYYY);
  const parts = iso.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const d = new Date(parts[0], parts[1] - 1, parts[2] + daysDelta);
    return formatDateDDMMYYYY(d);
  }
  const now = new Date();
  now.setDate(now.getDate() + daysDelta);
  return formatDateDDMMYYYY(now);
};
