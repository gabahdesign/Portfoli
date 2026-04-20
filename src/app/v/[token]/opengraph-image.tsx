import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "Portfolio Marc";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { token: string } }) {
  const supabase = await createClient();
  const { data: tokenData } = await supabase
    .from("access_tokens")
    .select("label")
    .eq("token", params.token)
    .single();

  const label = tokenData?.label || "Confidencial";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0014",
          color: "white",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background: "radial-gradient(circle at center, rgba(255, 10, 10, 0.2) 0%, transparent 50%)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>
          <h1
            style={{
              fontSize: 100,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              marginBottom: 20,
              background: "linear-gradient(to bottom right, #ffffff, #aaaaaa)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Marc Portfolio
          </h1>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 32px",
            background: "rgba(255, 10, 10, 0.1)",
            border: "1px solid rgba(255, 10, 10, 0.3)",
            borderRadius: 100,
            marginTop: 40
          }}>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Per a l&apos;equip de {label}
            </p>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
