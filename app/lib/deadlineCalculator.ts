export type DeadlineUnit = "days" | "weeks" | "months" | "years";

export type PauseRange = {
  id: string;
  from: string;
  to: string;
  includeStart: boolean;
  includeEnd: boolean;
};

export type NormalizedPauseRange = {
  id: string;
  from: string;
  to: string;
  totalDays: number;
  daysInTerm: number;
};

export type DeadlineCalculationInput = {
  startDate: string;
  amount: number;
  unit: DeadlineUnit;
  pauses: PauseRange[];
  shiftNonWorkingDeadline: boolean;
};

export type DeadlineCalculationResult = {
  startDate: string;
  baseDeadline: string;
  deadlineBeforeBusinessDayShift: string;
  finalDeadline: string;
  pauseDays: number;
  businessDayShiftDays: number;
  normalizedPauses: NormalizedPauseRange[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addMonthsClamped(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(year, month + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

function addYearsClamped(date: Date, years: number): Date {
  return addMonthsClamped(date, years * 12);
}

function compareDates(a: string, b: string): number {
  return parseDate(a).getTime() - parseDate(b).getTime();
}

function enumerateDateRange(from: string, to: string): string[] {
  const start = parseDate(from);
  const end = parseDate(to);
  const days = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);

  return Array.from({ length: days + 1 }, (_, index) =>
    formatDate(addDays(start, index)),
  );
}

function getPauseDates(pause: PauseRange): string[] {
  return enumerateDateRange(pause.from, pause.to).filter((date) => {
    if (!pause.includeStart && date === pause.from) {
      return false;
    }

    if (!pause.includeEnd && date === pause.to) {
      return false;
    }

    return true;
  });
}

function calculateBaseDeadline(
  startDate: string,
  amount: number,
  unit: DeadlineUnit,
): string {
  const start = parseDate(startDate);

  if (unit === "days") {
    return formatDate(addDays(start, amount));
  }

  if (unit === "weeks") {
    return formatDate(addDays(start, amount * 7));
  }

  if (unit === "months") {
    return formatDate(addMonthsClamped(start, amount));
  }

  return formatDate(addYearsClamped(start, amount));
}

function normalizePauses(pauses: PauseRange[]): PauseRange[] {
  return pauses
    .filter((pause) => pause.from && pause.to)
    .map((pause) => {
      if (compareDates(pause.from, pause.to) <= 0) {
        return pause;
      }

      return {
        ...pause,
        from: pause.to,
        to: pause.from,
        includeStart: pause.includeEnd,
        includeEnd: pause.includeStart,
      };
    });
}

function countPausedDaysInRunningPeriod(
  startDate: string,
  deadline: string,
  pauses: PauseRange[],
): { pauseDays: number; normalizedPauses: NormalizedPauseRange[] } {
  const countedDays = new Set<string>();
  const daysByPause = new Map<string, Set<string>>();

  for (const pause of normalizePauses(pauses)) {
    const pauseDays = new Set<string>();

    for (const date of getPauseDates(pause)) {
      if (
        compareDates(date, startDate) > 0 &&
        compareDates(date, deadline) <= 0
      ) {
        countedDays.add(date);
        pauseDays.add(date);
      }
    }

    daysByPause.set(pause.id, pauseDays);
  }

  const normalizedPauses = normalizePauses(pauses).map((pause) => ({
    id: pause.id,
    from: pause.from,
    to: pause.to,
    totalDays: getPauseDates(pause).length,
    daysInTerm: daysByPause.get(pause.id)?.size ?? 0,
  }));

  return {
    pauseDays: countedDays.size,
    normalizedPauses,
  };
}

function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(Date.UTC(year, month - 1, day));
}

export function getPolishPublicHolidays(year: number): Set<string> {
  const easter = getEasterSunday(year);
  const fixedHolidays = [
    `${year}-01-01`,
    `${year}-01-06`,
    `${year}-05-01`,
    `${year}-05-03`,
    `${year}-08-15`,
    `${year}-11-01`,
    `${year}-11-11`,
    `${year}-12-25`,
    `${year}-12-26`,
  ];

  if (year >= 2025) {
    fixedHolidays.push(`${year}-12-24`);
  }

  return new Set([
    ...fixedHolidays,
    formatDate(easter),
    formatDate(addDays(easter, 1)),
    formatDate(addDays(easter, 49)),
    formatDate(addDays(easter, 60)),
  ]);
}

export function isNonWorkingDeadlineDay(date: Date): boolean {
  const day = date.getUTCDay();

  if (day === 0 || day === 6) {
    return true;
  }

  return getPolishPublicHolidays(date.getUTCFullYear()).has(formatDate(date));
}

function moveToNextWorkingDeadlineDay(date: string): {
  finalDeadline: string;
  shiftDays: number;
} {
  let current = parseDate(date);
  let shiftDays = 0;

  while (isNonWorkingDeadlineDay(current)) {
    current = addDays(current, 1);
    shiftDays += 1;
  }

  return {
    finalDeadline: formatDate(current),
    shiftDays,
  };
}

export function calculateDeadline(
  input: DeadlineCalculationInput,
): DeadlineCalculationResult {
  const amount = Math.max(1, Math.floor(input.amount || 1));
  const baseDeadline = calculateBaseDeadline(
    input.startDate,
    amount,
    input.unit,
  );
  let deadlineBeforeBusinessDayShift = baseDeadline;
  let pauseData = countPausedDaysInRunningPeriod(
    input.startDate,
    deadlineBeforeBusinessDayShift,
    input.pauses,
  );
  for (let guard = 0; guard < 3660; guard += 1) {
    const nextDeadline = formatDate(
      addDays(parseDate(baseDeadline), pauseData.pauseDays),
    );

    if (nextDeadline === deadlineBeforeBusinessDayShift) {
      break;
    }

    deadlineBeforeBusinessDayShift = nextDeadline;
    pauseData = countPausedDaysInRunningPeriod(
      input.startDate,
      deadlineBeforeBusinessDayShift,
      input.pauses,
    );
  }

  const { finalDeadline, shiftDays } = input.shiftNonWorkingDeadline
    ? moveToNextWorkingDeadlineDay(deadlineBeforeBusinessDayShift)
    : {
        finalDeadline: deadlineBeforeBusinessDayShift,
        shiftDays: 0,
      };

  return {
    startDate: input.startDate,
    baseDeadline,
    deadlineBeforeBusinessDayShift,
    finalDeadline,
    pauseDays: pauseData.pauseDays,
    businessDayShiftDays: shiftDays,
    normalizedPauses: pauseData.normalizedPauses,
  };
}
