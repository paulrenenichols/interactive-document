import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useSlideDeck } from "../../../data/SlideDeckContext";
import { getDefaultNewSlideLayoutId } from "../../../slideDeck/getDefaultNewSlideLayoutId";
import { precisionLedgerColors } from "../../../slideDeck/precisionLedgerUi";
import { readSkipDeleteSlideConfirm } from "../../../utils/slideDeckDeleteSlidePreference";
import { DeleteSlideDialog } from "../DeleteSlideDialog";

function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

export function SlideListPanel() {
  const { slides, layouts, theme, activeSlideId, setActiveSlideId, addSlide, deleteSlide } = useSlideDeck();

  const visibleSlides = useMemo(
    () => [...slides].filter((s) => !s.hidden).sort((a, b) => a.order_index - b.order_index),
    [slides],
  );

  const layoutNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of layouts) m.set(l.id, l.name);
    return m;
  }, [layouts]);

  const [menu, setMenu] = useState<{ mouseX: number; mouseY: number; slideId: string } | null>(null);
  const [deleteDialogSlideId, setDeleteDialogSlideId] = useState<string | null>(null);

  const closeMenu = () => setMenu(null);

  const runDelete = useCallback(
    (slideId: string) => {
      deleteSlide(slideId);
    },
    [deleteSlide],
  );

  const requestDelete = useCallback(
    (slideId: string) => {
      if (readSkipDeleteSlideConfirm()) {
        runDelete(slideId);
        return;
      }
      setDeleteDialogSlideId(slideId);
    },
    [runDelete],
  );

  const handleListKeyDown = useCallback(
    (event: KeyboardEvent, slideId: string) => {
      if (isEditableKeyboardTarget(event.target)) return;
      if (event.key === "Delete") {
        event.preventDefault();
        requestDelete(slideId);
      }
    },
    [requestDelete],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <List dense disablePadding sx={{ flex: 1, overflow: "auto", py: 0 }}>
        {visibleSlides.map((slide, index) => {
          const selected = slide.id === activeSlideId;
          const layoutName = layoutNameById.get(slide.layout_id) ?? "Slide";
          return (
            <ListItemButton
              key={slide.id}
              selected={selected}
              onClick={() => setActiveSlideId(slide.id)}
              onKeyDown={(e) => handleListKeyDown(e, slide.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenu({ mouseX: e.clientX, mouseY: e.clientY, slideId: slide.id });
              }}
              sx={{
                alignItems: "stretch",
                mb: 1,
                borderRadius: 1,
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  bgcolor: precisionLedgerColors.surfaceContainerLowest,
                  borderRadius: 0.5,
                  border: "1px solid",
                  borderColor: selected ? "primary.main" : "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {index + 1}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: "100%" }}>
                {layoutName}
              </Typography>
            </ListItemButton>
          );
        })}
      </List>

      <Button
        variant="outlined"
        color="primary"
        size="small"
        fullWidth
        startIcon={<AddIcon />}
        onClick={() => addSlide(getDefaultNewSlideLayoutId(theme, layouts))}
        sx={{ flexShrink: 0, mt: 1, fontWeight: 700, textTransform: "none" }}
      >
        Add slide
      </Button>

      <Menu
        open={menu != null}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={menu != null ? { top: menu.mouseY, left: menu.mouseX } : undefined}
      >
        <MenuItem
          onClick={() => {
            if (menu) requestDelete(menu.slideId);
            closeMenu();
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <DeleteSlideDialog
        open={deleteDialogSlideId != null}
        onClose={() => setDeleteDialogSlideId(null)}
        onConfirm={() => {
          if (deleteDialogSlideId) runDelete(deleteDialogSlideId);
          setDeleteDialogSlideId(null);
        }}
      />
    </Box>
  );
}
