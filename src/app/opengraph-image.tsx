import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Previously Lab — an open-source personal AI agent with episodic memory";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image(): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "Raleway, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Previously Lab
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "#6b7280",
            marginTop: 20,
            letterSpacing: "0.02em",
          }}
        >
          Previously on you.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
