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
        {/* Gradient glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "10%",
            width: "80%",
            height: "60%",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.25), transparent 70%)",
          }}
        />

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
              fontSize: 28,
              color: "rgba(255,255,255,0.5)",
              maxWidth: 700,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            AI Copilot for Shopify Sellers
          </div>
          <div
            style={{
              marginTop: 32,
              padding: "12px 32px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
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
