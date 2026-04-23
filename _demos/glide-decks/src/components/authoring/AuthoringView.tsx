import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import SchemaIcon from "@mui/icons-material/Schema";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import { tokens } from "../../theme/tokens";
import type { AuthoringContext } from "../../types/appView";
import { useDocumentDataModel } from "../../data/DocumentDataModelContext";
import { AuthoringImportOverlay } from "./AuthoringImportOverlay";
import { DataModelWorkspaceCanvas } from "./DataModelWorkspaceCanvas";
import { SlideDeckWorkspace } from "./SlideDeckWorkspace";

const surfaceBright = "#f8f9fb";
const surfaceContainerHigh = "#e7e8ea";
const surfaceContainerHighest = "#e1e2e4";
const onSurfaceSecondary = "#565e72";
const outlineVariant = tokens.colorBorder;

export interface AuthoringViewProps {
  slideDeckPreviewActive?: boolean;
  onSlideDeckPreviewActiveChange?: (active: boolean) => void;
}

export function AuthoringView({
  slideDeckPreviewActive = false,
  onSlideDeckPreviewActiveChange,
}: AuthoringViewProps) {
  const [authoringContext, setAuthoringContext] = useState<AuthoringContext>("dataModel");
  const { importOverlayVisible, importFileLabel } = useDocumentDataModel();

  useEffect(() => {
    if (slideDeckPreviewActive) {
      setAuthoringContext("slideDeck");
    }
  }, [slideDeckPreviewActive]);

  return (
    <Box
    className="authorship-wrapper"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: slideDeckPreviewActive ? 0 : 2,
        width: "100%",
        flex: 1,
        minHeight: 0,
      }}
    >
      {!slideDeckPreviewActive ? (
      <Box
        sx={{
          width: "100%",
          height: 56,
          mt: 0.625, // 5px
          mx: { xs: -2, sm: -2 },
          px: { xs: 2, sm: 2 },
          boxSizing: "border-box",
          bgcolor: `${surfaceBright}e6`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${outlineVariant}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ToggleButtonGroup
          exclusive
          value={authoringContext}
          onChange={(_, v: AuthoringContext | null) => v != null && setAuthoringContext(v)}
          aria-label="Authoring context"
          sx={{
            p: 0.5,
            bgcolor: surfaceContainerHigh,
            borderRadius: 2,
            width: "fit-content",
            gap: 0,
            "& .MuiToggleButtonGroup-grouped": {
              margin: 0,
              border: "none",
              "&:not(:first-of-type)": { borderLeft: "none", ml: 0 },
            },
          }}
        >
          <ToggleButton
            value="dataModel"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.25,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.875rem",
              fontFamily: '"Plus Jakarta Sans", "Poppins", sans-serif',
              color: onSurfaceSecondary,
              bgcolor: "transparent",
              "&:not(.Mui-selected) .MuiSvgIcon-root": { color: onSurfaceSecondary },
              "&:hover": {
                bgcolor: surfaceContainerHighest,
              },
              "&.Mui-selected": {
                bgcolor: `${tokens.colorChrome} !important`,
                color: "#fff !important",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: `${tokens.colorChrome} !important`,
                },
                "& .MuiSvgIcon-root": { color: "#fff !important" },
              },
            }}
          >
            <SchemaIcon sx={{ fontSize: 20 }} />
            Data Model
          </ToggleButton>
          <ToggleButton
            value="slideDeck"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.25,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.875rem",
              fontFamily: '"Plus Jakarta Sans", "Poppins", sans-serif',
              color: onSurfaceSecondary,
              bgcolor: "transparent",
              "&:not(.Mui-selected) .MuiSvgIcon-root": { color: onSurfaceSecondary },
              "&:hover": {
                bgcolor: surfaceContainerHighest,
              },
              "&.Mui-selected": {
                bgcolor: `${tokens.colorChrome} !important`,
                color: "#fff !important",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: `${tokens.colorChrome} !important`,
                },
                "& .MuiSvgIcon-root": { color: "#fff !important" },
              },
            }}
          >
            <SlideshowIcon sx={{ fontSize: 20 }} />
            Slide Deck
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      ) : null}

      <AuthoringImportOverlay open={importOverlayVisible} fileLabel={importFileLabel} />
      <Box
        sx={{
          display: authoringContext === "dataModel" ? "flex" : "none",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          width: "100%",
        }}
      >
        <DataModelWorkspaceCanvas />
      </Box>
      <Box
        sx={{
          display: authoringContext === "slideDeck" ? "flex" : "none",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          width: "100%",
        }}
      >
        <SlideDeckWorkspace
          slideDeckTabActive={authoringContext === "slideDeck"}
          previewActive={slideDeckPreviewActive}
          onPreviewChange={onSlideDeckPreviewActiveChange}
        />
      </Box>
    </Box>
  );
}
