import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRIMARY = "#5b3df5";
const PRIMARY_HOVER = "#4527d1";
const PRIMARY_FOREGROUND = "#ffffff";
const ACCENT = "#ff7a45";

const STORE_NAME: Record<string, string> = {
  en: "7oor Store",
  ar: "متجر 7oor",
};

const TAGLINE: Record<string, string> = {
  en: "Everything for your phone and your desk, in one place.",
  ar: "كل ما تحتاجه لموبايلك ومكتبك في مكان واحد.",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = locale === "ar";
  const storeName = STORE_NAME[locale] ?? STORE_NAME.en;
  const tagline = TAGLINE[locale] ?? TAGLINE.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: isRtl ? "flex-end" : "flex-start",
          justifyContent: "center",
          padding: 96,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_HOVER} 100%)`,
          textAlign: isRtl ? "right" : "left",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            width: 128,
            height: 128,
            borderRadius: 36,
            background: PRIMARY_FOREGROUND,
            marginBottom: 48,
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1,
              color: PRIMARY,
            }}
          >
            7
          </span>
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: ACCENT,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: PRIMARY_FOREGROUND,
            marginBottom: 24,
          }}
        >
          {storeName}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: PRIMARY_FOREGROUND,
            opacity: 0.85,
            maxWidth: 900,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
