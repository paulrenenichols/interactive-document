import { useState, type MouseEvent, type ReactElement } from "react";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryIcon from "@mui/icons-material/Category";
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RoundedCornerIcon from "@mui/icons-material/RoundedCorner";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import UndoIcon from "@mui/icons-material/Undo";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import StyleIcon from "@mui/icons-material/Style";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useSlideDeck } from "../../data/SlideDeckContext";
import { useSlideAuthoringShell } from "../../data/SlideAuthoringShellContext";
import type { MilestoneShapeKind } from "../../slideDeck/createSlideShapeElement";
import { MILESTONE_SHAPE_LABELS } from "../../slideDeck/milestoneShapeUi";
import { precisionLedgerColors, SLIDE_CANVAS_VISUAL_INSET_X_CSS } from "../../slideDeck/precisionLedgerUi";
import { tokens } from "../../theme/tokens";
import { InsertChartPickerModal } from "./InsertChartPickerModal";
import { SlideLayoutPickerModal } from "./SlideLayoutPickerModal";

export interface SlideInsertionToolbarProps {
  onInsertTextBox?: () => void;
  /** Called when user picks a milestone shape kind from the Insert Shape menu. */
  onInsertShape?: (kind: MilestoneShapeKind) => void;
  /** Called after user picks a chart from the insert dialog. */
  onChartPicked?: (chartId: string) => void;
  /** Reset layout placeholders on the active slide to layout geometry and typography; keep text. */
  onRevertSlide?: () => void;
  /** Enter slide deck preview (presentation-style, read-only). */
  onPreview?: () => void;
}

const addButtonSx = { fontWeight: 700, whiteSpace: "nowrap" as const };

const SHAPE_MENU_ITEMS: Array<{
  kind: MilestoneShapeKind;
  label: string;
  icon: ReactElement;
}> = [
  { kind: "rectangle", label: MILESTONE_SHAPE_LABELS.rectangle, icon: <CropSquareIcon fontSize="small" /> },
  {
    kind: "rounded_rectangle",
    label: MILESTONE_SHAPE_LABELS.rounded_rectangle,
    icon: <RoundedCornerIcon fontSize="small" />,
  },
  { kind: "circle", label: MILESTONE_SHAPE_LABELS.circle, icon: <RadioButtonUncheckedIcon fontSize="small" /> },
  { kind: "ellipse", label: MILESTONE_SHAPE_LABELS.ellipse, icon: <CircleOutlinedIcon fontSize="small" /> },
  { kind: "triangle", label: MILESTONE_SHAPE_LABELS.triangle, icon: <ChangeHistoryIcon fontSize="small" /> },
  { kind: "line", label: MILESTONE_SHAPE_LABELS.line, icon: <HorizontalRuleIcon fontSize="small" /> },
  { kind: "arrow", label: MILESTONE_SHAPE_LABELS.arrow, icon: <ArrowRightAltIcon fontSize="small" /> },
];

/**
 * Above slide preview; row of buttons aligned with the scaled inner slide card’s left edge.
 * Includes **Slide Layout**, which opens a picker to choose a theme (strip) and layout (grid); the chosen
 * layout applies to the **active slide** immediately and persists after the dialog closes.
 */
export function SlideInsertionToolbar({
  onInsertTextBox,
  onInsertShape,
  onChartPicked,
  onRevertSlide,
  onPreview,
}: SlideInsertionToolbarProps) {
  const [layoutPickerOpen, setLayoutPickerOpen] = useState(false);
  const [chartPickerOpen, setChartPickerOpen] = useState(false);
  const [shapeMenuAnchor, setShapeMenuAnchor] = useState<null | HTMLElement>(null);
  const shapeMenuOpen = Boolean(shapeMenuAnchor);
  const shapeMenuId = shapeMenuOpen ? "insert-shape-menu" : undefined;
  const { theme } = useSlideDeck();
  const { enterThemeMasterEdit } = useSlideAuthoringShell();

  const handleShapeMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setShapeMenuAnchor(event.currentTarget);
  };

  const handleShapeMenuClose = () => {
    setShapeMenuAnchor(null);
  };

  const handlePickShapeKind = (kind: MilestoneShapeKind) => {
    onInsertShape?.(kind);
    handleShapeMenuClose();
  };

  return (
    <Box
      role="toolbar"
      aria-label="Insert objects on slide"
      sx={{
        flexShrink: 0,
        alignSelf: "stretch",
        pl: SLIDE_CANVAS_VISUAL_INSET_X_CSS,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          p: 1.5,
          borderRadius: 1,
          bgcolor: precisionLedgerColors.surfaceContainerLowest,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          disableElevation
          startIcon={<TextFieldsIcon />}
          onClick={onInsertTextBox}
          sx={addButtonSx}
        >
          Insert Text Box
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          disableElevation
          startIcon={<CategoryIcon />}
          id="insert-shape-button"
          aria-controls={shapeMenuId}
          aria-haspopup="true"
          aria-expanded={shapeMenuOpen ? "true" : undefined}
          onClick={handleShapeMenuOpen}
          sx={addButtonSx}
        >
          Insert Shape
        </Button>
        <Menu
          id="insert-shape-menu"
          anchorEl={shapeMenuAnchor}
          open={shapeMenuOpen}
          onClose={handleShapeMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ list: { "aria-labelledby": "insert-shape-button" } }}
        >
          {SHAPE_MENU_ITEMS.map(({ kind, label, icon }) => (
            <MenuItem
              key={kind}
              onClick={() => handlePickShapeKind(kind)}
              dense
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
              <ListItemText primaryTypographyProps={{ variant: "body2" }}>{label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          disableElevation
          startIcon={<BarChartIcon />}
          onClick={() => setChartPickerOpen(true)}
          sx={addButtonSx}
        >
          Insert Chart
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          disableElevation
          startIcon={<ViewQuiltIcon />}
          onClick={() => setLayoutPickerOpen(true)}
          sx={addButtonSx}
        >
          Change Layout
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          disableElevation
          startIcon={<UndoIcon />}
          disabled={!onRevertSlide}
          onClick={() => onRevertSlide?.()}
          sx={addButtonSx}
        >
          Revert Slide
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          disableElevation
          startIcon={<StyleIcon />}
          onClick={() => enterThemeMasterEdit(theme.id)}
          sx={addButtonSx}
        >
          Slide master
        </Button>
        </Box>
        {onPreview ? (
          <Button
            size="small"
            variant="contained"
            disableElevation
            startIcon={<SlideshowIcon />}
            onClick={onPreview}
            sx={{
              ...addButtonSx,
              ml: "auto",
              flexShrink: 0,
              bgcolor: tokens.colorDanger,
              color: "#fff",
              "&:hover": { bgcolor: tokens.colorDanger, filter: "brightness(0.92)" },
            }}
          >
            Preview
          </Button>
        ) : null}
      </Box>
      <SlideLayoutPickerModal open={layoutPickerOpen} onClose={() => setLayoutPickerOpen(false)} />
      <InsertChartPickerModal
        open={chartPickerOpen}
        onClose={() => setChartPickerOpen(false)}
        onSelectChart={(chartId) => {
          onChartPicked?.(chartId);
          setChartPickerOpen(false);
        }}
      />
    </Box>
  );
}
