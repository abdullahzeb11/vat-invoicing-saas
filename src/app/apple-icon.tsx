import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          fontWeight: 700,
          color: "white",
          background: "hsl(158, 64%, 32%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-0.04em",
          borderRadius: 32,
        }}
      >
        F
      </div>
    ),
    { ...size }
  );
}
