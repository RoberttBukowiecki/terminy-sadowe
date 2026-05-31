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

export default function Home() {
  const [startDate, setStartDate] = useState(() => getTodayInputValue());
  const [amount, setAmount] = useState(14);
  const [unit, setUnit] = useState<DeadlineUnit>("days");
  const [pauses, setPauses] = useState<PauseRange[]>([]);

  const result = useMemo(
    () =>
      calculateDeadline({
        startDate: startDate || getTodayInputValue(),
        amount,
        unit,
        pauses,
      }),
    [amount, pauses, startDate, unit],
  );

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
        </form>

        <aside className="panel result-panel" aria-live="polite">
          <p className="result-label">Termin upływa</p>
          <div className="result-date">{result.finalDeadline}</div>

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
              <li>Nie liczymy dnia początkowego.</li>
              {result.timeline.map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li>
                Jeśli ostatni dzień wypada w sobotę, niedzielę albo święto
                ustawowe, termin przesuwa się na najbliższy dzień roboczy.
              </li>
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
