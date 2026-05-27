import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#06060a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            ShopPilot
          </div>
          <div
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.62)",
              maxWidth: 760,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            Pet Cleaning Ad Pack Generator
          </div>
          <div
            style={{
              marginTop: 32,
              padding: "12px 32px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #10b981, #2563eb)",
              color: "white",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            shoppilot.help
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
