"use client";

import { useMemo, useState } from "react";
import {
  calculateDeadline,
  type DeadlineUnit,
  type PauseRange,
} from "@/app/lib/deadlineCalculator";

const unitLabels: Record<DeadlineUnit, string> = {
  days: "dni",
  weeks: "tygodnie",
  months: "miesiące",
  years: "lata",
};
const calendarWeekdays = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

function getTodayInputValue(): string {
  const now = new Date();
  const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return localDate.toLocaleDateString("sv-SE");
}

function createPause(): PauseRange {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    from: "",
    to: "",
    includeStart: true,
    includeEnd: true,
  };
}

function formatDayCount(days: number): string {
  if (days === 1) {
    return "1 dzień";
  }

  return `${days} dni`;
}

function parseInputDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function formatCalendarMonth(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(parseInputDate(value));
}

function buildCalendarDays(selectedDate: string) {
  const selected = parseInputDate(selectedDate);
  const year = selected.getUTCFullYear();
  const month = selected.getUTCMonth();
  const selectedDay = selected.getUTCDate();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leadingEmptyDays = (firstDay.getUTCDay() + 6) % 7;

  return [
    ...Array.from({ length: leadingEmptyDays }, (_, index) => ({
      key: `empty-${index}`,
      day: null,
      isSelected: false,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;

      return {
        key: `day-${day}`,
        day,
        isSelected: day === selectedDay,
      };
    }),
  ];
}

export default function Home() {
  const [startDate, setStartDate] = useState(() => getTodayInputValue());
  const [amount, setAmount] = useState(14);
  const [unit, setUnit] = useState<DeadlineUnit>("days");
  const [pauses, setPauses] = useState<PauseRange[]>([]);
  const [shiftNonWorkingDeadline, setShiftNonWorkingDeadline] = useState(true);

  const result = useMemo(
    () =>
      calculateDeadline({
        startDate: startDate || getTodayInputValue(),
        amount,
        unit,
        pauses,
        shiftNonWorkingDeadline,
      }),
    [amount, pauses, shiftNonWorkingDeadline, startDate, unit],
  );
  const effectiveAmount = Math.max(1, Math.floor(amount || 1));
  const explanationSteps = [
    `Zaczynamy od daty: ${result.startDate}. Tego dnia nie wliczamy do terminu.`,
    `Liczymy ${effectiveAmount} ${unitLabels[unit]}. Bez przerw daje to datę ${result.baseDeadline}.`,
    result.pauseDays > 0
      ? `Przerwy zatrzymują licznik na ${formatDayCount(result.pauseDays)}. Po ich doliczeniu wychodzi ${result.deadlineBeforeBusinessDayShift}.`
      : "Nie dodano przerw, więc nic nie wydłuża terminu.",
    result.businessDayShiftDays > 0
      ? `Ta data wypada w sobotę, niedzielę albo święto, więc przesuwamy ją o ${formatDayCount(result.businessDayShiftDays)}.`
      : shiftNonWorkingDeadline
        ? "Data końcowa nie wymaga przesunięcia z weekendu ani święta."
        : "Przesunięcie z weekendu i święta jest wyłączone.",
    `Ostateczny ostatni dzień terminu: ${result.finalDeadline}.`,
  ];
  const calendarDays = buildCalendarDays(result.finalDeadline);

  function updatePause(id: string, field: "from" | "to", value: string) {
    setPauses((current) =>
      current.map((pause) =>
        pause.id === id
          ? {
              ...pause,
              [field]: value,
            }
          : pause,
      ),
    );
  }

  function togglePauseEdge(id: string, field: "includeStart" | "includeEnd") {
    setPauses((current) =>
      current.map((pause) =>
        pause.id === id
          ? {
              ...pause,
              [field]: !pause[field],
            }
          : pause,
      ),
    );
  }

  return (
    <main className="app-shell">
      <section className="intro">
        <p className="eyebrow">Kalkulator terminów</p>
        <h1>Terminy sądowe</h1>
        <p className="lead">
          Oblicz datę końcową terminu od zdarzenia, doręczenia albo ogłoszenia.
          Możesz dodać okresy, w których termin ma nie biec.
        </p>
      </section>

      <section className="calculator-grid" aria-label="Kalkulator terminu">
        <form className="panel form-panel">
          <label className="field">
            <span>Data początkowa</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <div className="split-fields">
            <label className="field">
              <span>Długość</span>
              <input
                min="1"
                type="number"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
            </label>

            <label className="field">
              <span>Jednostka</span>
              <select
                value={unit}
                onChange={(event) =>
                  setUnit(event.target.value as DeadlineUnit)
                }
              >
                {Object.entries(unitLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="pause-header">
            <div>
              <h2>Przerwy w biegu</h2>
              <p>Pierwszy i ostatni dzień są domyślnie wliczane.</p>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                setPauses((current) => [...current, createPause()])
              }
            >
              Dodaj
            </button>
          </div>

          <div className="pause-list">
            {pauses.map((pause, index) => (
              <div className="pause-row" key={pause.id}>
                <div className="pause-title">Przerwa {index + 1}</div>
                <label className="field compact-field">
                  <span>Od</span>
                  <input
                    type="date"
                    value={pause.from}
                    onChange={(event) =>
                      updatePause(pause.id, "from", event.target.value)
                    }
                  />
                </label>
                <label className="field compact-field">
                  <span>Do</span>
                  <input
                    type="date"
                    value={pause.to}
                    onChange={(event) =>
                      updatePause(pause.id, "to", event.target.value)
                    }
                  />
                </label>
                <button
                  className="icon-button"
                  type="button"
                  aria-label={`Usuń przerwę ${index + 1}`}
                  onClick={() =>
                    setPauses((current) =>
                      current.filter(
                        (currentPause) => currentPause.id !== pause.id,
                      ),
                    )
                  }
                >
                  ×
                </button>
                <div className="pause-options">
                  <button
                    className="toggle-chip"
                    type="button"
                    aria-pressed={pause.includeStart}
                    title="Wlicz pierwszy dzień przerwy"
                    onClick={() => togglePauseEdge(pause.id, "includeStart")}
                  >
                    <span aria-hidden="true">←</span>
                    Pierwszy
                  </button>
                  <button
                    className="toggle-chip"
                    type="button"
                    aria-pressed={pause.includeEnd}
                    title="Wlicz ostatni dzień przerwy"
                    onClick={() => togglePauseEdge(pause.id, "includeEnd")}
                  >
                    Ostatni
                    <span aria-hidden="true">→</span>
                  </button>
                  <span className="pause-days">
                    {formatDayCount(
                      result.normalizedPauses.find(
                        (normalizedPause) => normalizedPause.id === pause.id,
                      )?.totalDays ?? 0,
                    )}{" "}
                    w przerwie
                  </span>
                </div>
              </div>
            ))}
          </div>

          <label className="switch-row">
            <span>
              <strong>Przesuwaj koniec z weekendu i święta</strong>
              <small>
                Gdy ostatni dzień wypada w sobotę, niedzielę albo święto.
              </small>
            </span>
            <input
              checked={shiftNonWorkingDeadline}
              onChange={(event) =>
                setShiftNonWorkingDeadline(event.target.checked)
              }
              type="checkbox"
            />
          </label>
        </form>

        <aside className="panel result-panel" aria-live="polite">
          <p className="result-label">Termin upływa</p>
          <div className="result-date">{result.finalDeadline}</div>

          <div className="calendar-preview" aria-label="Podgląd miesiąca">
            <div className="calendar-header">
              <span>Kalendarz</span>
              <strong>{formatCalendarMonth(result.finalDeadline)}</strong>
            </div>
            <div className="calendar-grid" aria-hidden="true">
              {calendarWeekdays.map((weekday) => (
                <span className="calendar-weekday" key={weekday}>
                  {weekday}
                </span>
              ))}
              {calendarDays.map((item) =>
                item.day === null ? (
                  <span className="calendar-day is-empty" key={item.key} />
                ) : (
                  <span
                    className={
                      item.isSelected
                        ? "calendar-day is-selected"
                        : "calendar-day"
                    }
                    key={item.key}
                  >
                    {item.day}
                  </span>
                ),
              )}
            </div>
          </div>

          <dl className="result-stats">
            <div>
              <dt>Bez przerw</dt>
              <dd>{result.baseDeadline}</dd>
            </div>
            <div>
              <dt>Po przerwach</dt>
              <dd>{result.deadlineBeforeBusinessDayShift}</dd>
            </div>
            <div>
              <dt>Dni przerwy</dt>
              <dd>{formatDayCount(result.pauseDays)}</dd>
            </div>
            <div>
              <dt>Przesunięcie końca</dt>
              <dd>{formatDayCount(result.businessDayShiftDays)}</dd>
            </div>
          </dl>

          <div className="timeline">
            <h2>Jak policzono</h2>
            <ul>
              {explanationSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="legal-note">
        <h2>Założenia</h2>
        <p>
          Kalkulator stosuje ogólne reguły z k.c. dla terminów cywilnych oraz
          sądowych w KPC. Przerwy są ręcznym założeniem kalkulacyjnym i powinny
          wynikać z właściwego przepisu albo decyzji sądu w konkretnej sprawie.
        </p>
      </section>
    </main>
  );
}
