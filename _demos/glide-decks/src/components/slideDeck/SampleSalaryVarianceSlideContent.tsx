import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useSlideDeck } from "../../data/SlideDeckContext";
import { useAppDocument } from "../../state/AppDocumentContext";
import {
  fontHeadline,
  fontMono,
  precisionLedgerColors,
  precisionPrimaryAccent,
} from "../../slideDeck/precisionLedgerUi";
import { resolveSpecialRunKind } from "../../slideDeck/specialRuns";
import { SALARY_VARIANCE_TITLE_ACCENT_SHAPE_SPEC } from "../../slideDeck/salaryVarianceLayout";
import { tokens } from "../../theme/tokens";
import { SlideShapeRectPreview } from "./SlideShapeRectPreview";

export interface SampleSalaryVarianceSlideContentProps {
  /** 1-based index among visible slides */
  slideIndex: number;
  slideCount: number;
}

/** Static preview matching design/sample-slide-deck-design/code.html (Phase A). */
export function SampleSalaryVarianceSlideContent({
  slideIndex,
  slideCount,
}: SampleSalaryVarianceSlideContentProps) {
  const { theme } = useSlideDeck();
  const { documentTitle } = useAppDocument();

  const footerDocumentTitle = resolveSpecialRunKind("document_title", {
    documentTitle,
    slideOrderIndex: slideIndex,
    totalNonHiddenSlides: slideCount,
  });

  const bars = [
    { label: "ENG", pct: 85, opacity: 1 },
    { label: "MKT", pct: 62, opacity: 0.8 },
    { label: "OPS", pct: 44, opacity: 0.6 },
    { label: "FIN", pct: 71, opacity: 1, dark: true },
  ];

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        bgcolor: precisionLedgerColors.surfaceContainerLowest,
      }}
    >
      <Box component="header" sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontFamily: fontHeadline,
            fontSize: "2.5rem",
            fontWeight: 800,
            color: precisionLedgerColors.onSurface,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            mb: 0.5,
          }}
        >
          Salary Variance Overview
        </Typography>
        {/* Fixed px matches prior Box; spec uses theme palette accent_1 (see SALARY_VARIANCE_TITLE_ACCENT_SHAPE_SPEC). */}
        <SlideShapeRectPreview
          spec={SALARY_VARIANCE_TITLE_ACCENT_SHAPE_SPEC}
          theme={theme}
          widthPx={96}
          heightPx={4}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2.5,
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 1 }}>
            <Typography
              sx={{
                fontFamily: fontHeadline,
                fontSize: "1.125rem",
                fontWeight: 700,
                color: precisionLedgerColors.onSurfaceVariant,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              Comp Demographics
            </Typography>
            <Typography sx={{ fontFamily: fontMono, fontSize: "0.75rem", color: precisionLedgerColors.secondaryText }}>
              REF_ID: 942-D
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              bgcolor: precisionLedgerColors.surfaceContainerLow,
              borderRadius: 2,
              p: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {bars.map((row) => (
                <Box key={row.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: fontMono,
                      fontSize: "10px",
                      width: 28,
                      textAlign: "right",
                      color: precisionLedgerColors.secondaryText,
                    }}
                  >
                    {row.label}
                  </Typography>
                  <Box sx={{ flex: 1, height: 32, bgcolor: precisionLedgerColors.surfaceContainerHigh, position: "relative", borderRadius: 0.5 }}>
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${row.pct}%`,
                        bgcolor: row.dark ? tokens.colorChrome : precisionPrimaryAccent,
                        opacity: row.opacity,
                        borderRadius: "2px",
                      }}
                    />
                    <Typography
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        fontFamily: fontMono,
                        fontSize: "11px",
                        fontWeight: 700,
                        color: precisionLedgerColors.onSurface,
                      }}
                    >
                      {row.pct}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 1 }}>
            <Typography
              sx={{
                fontFamily: fontHeadline,
                fontSize: "1.125rem",
                fontWeight: 700,
                color: precisionLedgerColors.onSurfaceVariant,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              Salary Variance
            </Typography>
            <Typography sx={{ fontFamily: fontMono, fontSize: "0.75rem", color: precisionLedgerColors.secondaryText }}>
              FY24_PROJECTED
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              bgcolor: precisionLedgerColors.surfaceContainerLow,
              borderRadius: 2,
              p: 2,
              position: "relative",
              minHeight: 160,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                pointerEvents: "none",
                opacity: 0.2,
              }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ borderTop: "1px solid", borderColor: "grey.900", width: "100%" }} />
              ))}
            </Box>
            <Box sx={{ position: "relative", height: "100%", minHeight: 140 }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 200"
                preserveAspectRatio="none"
                style={{ display: "block" }}
              >
                <title>Salary variance trend</title>
                <path
                  d="M0 180 Q 50 150, 100 160 T 200 80 T 300 110 T 400 40 L 400 200 L 0 200 Z"
                  fill="rgba(179, 32, 6, 0.15)"
                />
                <path
                  d="M0 180 Q 50 150, 100 160 T 200 80 T 300 110 T 400 40"
                  fill="none"
                  stroke={precisionPrimaryAccent}
                  strokeWidth={3}
                />
                <circle cx={200} cy={80} r={4} fill={precisionPrimaryAccent} />
              </svg>
              <Box sx={{ position: "absolute", top: 8, right: 16, display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: tokens.colorPrimary }} />
                <Typography sx={{ fontFamily: fontMono, fontSize: "10px", color: precisionLedgerColors.onSurfaceVariant }}>
                  Real-time Flux
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          mt: 3,
          pt: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${precisionLedgerColors.surfaceContainerHigh}`,
          fontFamily: fontMono,
          fontSize: "10px",
          color: precisionLedgerColors.secondaryText,
        }}
      >
        <Typography sx={{ fontFamily: fontMono, fontSize: "10px" }}>{footerDocumentTitle}</Typography>
        <Typography sx={{ fontFamily: fontMono, fontSize: "10px" }}>
          {slideIndex} / {slideCount}
        </Typography>
        <Typography sx={{ fontFamily: fontMono, fontSize: "10px" }}>CONFIDENTIAL</Typography>
      </Box>
    </Box>
  );
}
