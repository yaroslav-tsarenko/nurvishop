import { ImageResponse } from "next/og";

// Default share image (Telegram/WhatsApp/Facebook link previews) for pages
// without a product photo of their own. Served at /og-default.png, which the
// middleware matcher skips because of the .png suffix.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "linear-gradient(135deg, #1f1a17 0%, #3a2c24 100%)",
          color: "#f6efe7",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              background: "#d9825b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            n
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2 }}>nurvishop</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 52, fontWeight: 600, lineHeight: 1.2 }}>
          Fresh finds, friendly prices
        </div>
        <div style={{ marginTop: 20, fontSize: 30, color: "#d8c8b8" }}>
          Home décor · Kitchen · Textiles · Everyday favourites
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
