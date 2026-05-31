import { ImageResponse } from "next/og";

export const alt = "Terminy sądowe - kalkulator biegu terminów";
export const contentType = "image/png";
export const dynamic = "force-static";
export const size = {
  width: 1200,
  height: 630,
};

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#f8f5eb",
        color: "#191a17",
        display: "flex",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: 64,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 650,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              color: "#2e6b47",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 0,
              textTransform: "uppercase",
            }}
          >
            Kalkulator terminów
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 0.95,
            }}
          >
            <span>Terminy</span>
            <span>sądowe</span>
          </div>
          <div
            style={{
              color: "#4d5049",
              fontSize: 34,
              lineHeight: 1.3,
            }}
          >
            Oblicz datę końcową terminu, dodaj przerwy i sprawdź weekendy oraz
            święta.
          </div>
        </div>
        <div
          style={{
            color: "#5f655a",
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          terminy-sadowe
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          background: "#20251f",
          borderRadius: 32,
          color: "#f9f7ee",
          display: "flex",
          flexDirection: "column",
          height: 420,
          justifyContent: "center",
          padding: 34,
          width: 360,
        }}
      >
        <div
          style={{
            color: "#c8d4c4",
            fontSize: 25,
            fontWeight: 900,
            marginBottom: 28,
            textTransform: "uppercase",
          }}
        >
          Termin upływa
        </div>
        <div
          style={{
            background: "#f8f5eb",
            borderRadius: 24,
            color: "#20251f",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            padding: 28,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {["Pn", "Wt", "Śr", "Cz", "Pt"].map((day) => (
              <div
                key={day}
                style={{
                  color: "#7d8275",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                {day}
              </div>
            ))}
          </div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 16,
            }}
          >
            {[12, 13, 14].map((day) => (
              <div
                key={day}
                style={{
                  alignItems: "center",
                  background: "#fffdf7",
                  borderRadius: 14,
                  display: "flex",
                  fontSize: 34,
                  fontWeight: 900,
                  height: 66,
                  justifyContent: "center",
                  width: 66,
                }}
              >
                {day}
              </div>
            ))}
            <div
              style={{
                alignItems: "center",
                background: "#2e6b47",
                borderRadius: 18,
                color: "#ffffff",
                display: "flex",
                fontSize: 38,
                fontWeight: 900,
                height: 76,
                justifyContent: "center",
                width: 76,
              }}
            >
              15
            </div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
