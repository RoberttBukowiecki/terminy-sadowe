const checklist = [
  "Next.js App Router",
  "TypeScript strict mode",
  "ESLint core web vitals",
  "Prettier",
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Starter aplikacji</p>
        <h1>Terminy Sadowe</h1>
        <p className="lead">
          Minimalny fundament pod aplikacje Next.js: aktualne paczki, App
          Router, TypeScript, lint i formatowanie.
        </p>
        <div className="checklist">
          {checklist.map((item) => (
            <div className="checklistItem" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
