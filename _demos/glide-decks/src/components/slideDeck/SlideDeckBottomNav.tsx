import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { glassBottomBarSx, precisionLedgerColors } from "../../slideDeck/precisionLedgerUi";
import { tokens } from "../../theme/tokens";

export type SlideDeckBottomNavVariant = "slide" | "layout" | "themeMaster";

export interface SlideDeckBottomNavProps {
  variant?: SlideDeckBottomNavVariant;
  /** When variant is layout, shown in the center instead of slide counts */
  layoutName?: string | null;
  /** When variant is themeMaster, theme name in the center */
  themeName?: string | null;
  slideCount: number;
  /** 0-based index in visible slide list */
  activeIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  /** Insert a slide after the current one (slide mode only); placed between slide count and next chevron. */
  onAddSlideAfterCurrent?: () => void;
}

export function SlideDeckBottomNav({
  variant = "slide",
  layoutName,
  themeName,
  slideCount,
  activeIndex,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  onAddSlideAfterCurrent,
}: SlideDeckBottomNavProps) {
  const layoutMode = variant === "layout";
  const themeMasterMode = variant === "themeMaster";
  const masterMode = layoutMode || themeMasterMode;

  return (
    <Box
      component="nav"
      aria-label={themeMasterMode ? "Slide master editing" : layoutMode ? "Layout editing" : "Slide navigation"}
      sx={glassBottomBarSx}
    >
      <IconButton
        aria-label="Previous slide"
        size="small"
        onClick={onPrevious}
        disabled={masterMode || !canGoPrevious}
        sx={{
          color: precisionLedgerColors.secondaryText,
          "&:hover": { color: tokens.colorPrimary, bgcolor: "rgba(232, 71, 42, 0.06)" },
        }}
      >
        <ChevronLeftIcon />
      </IconButton>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
        {!masterMode && slideCount > 0 ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }} aria-hidden>
              {Array.from({ length: slideCount }, (_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: i === activeIndex ? 12 : 6,
                    height: 6,
                    borderRadius: 999,
                    bgcolor: i === activeIndex ? tokens.colorPrimary : "grey.300",
                    transition: "width 0.2s ease",
                  }}
                />
              ))}
            </Box>
            {/* Use explicit 1px — numeric `width: 1` in `sx` is theme spacing (~8px), not a hairline */}
            <Box
              aria-hidden
              sx={{
                width: "1px",
                flexShrink: 0,
                alignSelf: "stretch",
                minHeight: 24,
                bgcolor: "rgba(0, 0, 0, 0.12)",
              }}
            />
          </>
        ) : null}
        <Typography
          component="span"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "11px",
            fontWeight: 700,
            color: precisionLedgerColors.onSurfaceVariant,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 220,
          }}
        >
          {themeMasterMode
            ? (themeName ?? "Theme").toUpperCase()
            : layoutMode
              ? (layoutName ?? "Layout").toUpperCase()
              : `${activeIndex + 1} / ${slideCount}`}
        </Typography>
      </Box>
      {!masterMode && onAddSlideAfterCurrent ? (
        <IconButton
          aria-label="Add slide after current slide"
          size="small"
          onClick={onAddSlideAfterCurrent}
          sx={{
            color: precisionLedgerColors.secondaryText,
            "&:hover": { color: tokens.colorPrimary, bgcolor: "rgba(232, 71, 42, 0.06)" },
          }}
        >
          <AddIcon />
        </IconButton>
      ) : null}
      <IconButton
        aria-label="Next slide"
        size="small"
        onClick={onNext}
        disabled={masterMode || !canGoNext}
        sx={{
          color: precisionLedgerColors.secondaryText,
          "&:hover": { color: tokens.colorPrimary, bgcolor: "rgba(232, 71, 42, 0.06)" },
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}
