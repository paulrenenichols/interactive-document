import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import FunctionsIcon from "@mui/icons-material/Functions";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { tokens } from "../../theme/tokens";
import type { SeriesCreationKind } from "../../types/dataModel";

const PATHS: {
  kind: SeriesCreationKind;
  title: string;
  description: string;
  icon: typeof AnalyticsIcon;
  descriptionMono?: boolean;
}[] = [
  {
    kind: "index",
    title: "Make an index out of another series",
    description:
      "Extract unique values and define default ordering to enable grouping and join logic.",
    icon: AnalyticsIcon,
  },
  {
    kind: "formula",
    title: "Write an Excel-Style formula",
    description:
      "Reference other series by name and use common business logic functions like SUM and MEDIAN.",
    icon: FunctionsIcon,
  },
  {
    kind: "manual",
    title: "Enter data manually",
    description: "Directly input values into a grid view.",
    icon: EditNoteIcon,
  },
];

export interface CreateDataSeriesStepSelectProps {
  onSelect: (kind: SeriesCreationKind) => void;
  /** When true (authoring canvas overlay), omit outer card chrome and use a wide three-column row. */
  inAuthoringCanvas?: boolean;
}

/** Step 1 — choose authoring class (Stitch: Data Model · Creation Selection). */
export function CreateDataSeriesStepSelect({
  onSelect,
  inAuthoringCanvas = false,
}: CreateDataSeriesStepSelectProps) {
  const introMaxWidth = inAuthoringCanvas ? "100%" : 720;
  const gridColumns = inAuthoringCanvas
    ? { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }
    : { xs: "1fr", md: "repeat(3, 1fr)" };

  const body = (
    <>
      {!inAuthoringCanvas && (
        <>
          <Typography variant="overline" sx={{ letterSpacing: 1, color: "text.secondary", display: "block", mb: 0.5 }}>
            Schema · Data model
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700, mb: 1 }}>
            Create New Data Series
          </Typography>
        </>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: introMaxWidth }}>
        Data series are 1-dimensional arrays of data that can be defined semantically or entered directly. All data
        series are available globally in your project.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: gridColumns,
          gap: 2,
        }}
      >
        {PATHS.map(({ kind, title, description, icon: Icon, descriptionMono }) => (
          <ButtonBase
            key={kind}
            focusRipple
            onClick={() => onSelect(kind)}
            aria-label={`${title}. ${description}`}
            sx={{
              display: "block",
              width: "100%",
              textAlign: "left",
              borderRadius: 1,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: "100%",
                minHeight: inAuthoringCanvas ? 160 : 140,
                borderColor: tokens.colorBorder,
                bgcolor: "#ffffff",
                transition: "background-color 150ms ease-out, box-shadow 150ms ease-out",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                "&:hover": {
                  bgcolor: "rgba(184, 200, 232, 0.35)",
                  boxShadow: `0 0 0 1px ${tokens.colorPrimary}33`,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: "rgba(232, 71, 42, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ color: tokens.colorPrimary, fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.5,
                      ...(descriptionMono
                        ? {
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.8125rem",
                          }
                        : {}),
                    }}
                  >
                    {description}
                  </Typography>
                </Box>
                <ChevronRightIcon sx={{ color: tokens.colorSecondary, flexShrink: 0, mt: 0.25 }} aria-hidden />
              </Box>
            </Paper>
          </ButtonBase>
        ))}
      </Box>
    </>
  );

  if (inAuthoringCanvas) {
    return (
      <Box sx={{ width: "100%", minWidth: 0, alignSelf: "stretch" }}>
        <Box sx={{ width: "100%", minWidth: 0 }}>{body}</Box>
      </Box>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        p: 2,
        bgcolor: "background.paper",
        borderColor: tokens.colorBorder,
      }}
    >
      {body}
    </Paper>
  );
}
