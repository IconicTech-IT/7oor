import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const PRIMARY = "#5b3df5";
const PRIMARY_FOREGROUND = "#ffffff";
const ACCENT = "#ff7a45";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          background: PRIMARY,
          borderRadius: 9,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1,
            color: PRIMARY_FOREGROUND,
          }}
        >
          7
        </span>
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: ACCENT,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
