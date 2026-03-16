## 2. Editor: Google Slides-Inspired Experience

**Objective**  
Refine the three-panel layout (left sidebar → central canvas → right properties) with a top toolbar, drag-and-drop reordering, contextual tools, and keyboard shortcuts — making editing feel fast and familiar like Google Slides.

### Key Design Decisions

- Full-height layout with fixed top `AppBar`/`Toolbar` for actions (undo/redo, insert chart/block, share, present)
- Left permanent `Drawer` (fixed width ~256px) with `@dnd-kit` for draggable slide/block list
- Central flexible `Paper` canvas displaying live Recharts components
- Right contextual `Paper` (~320px) that appears/disappears based on selection (chart data, style, etc.)
- Global shortcuts via `use-hotkeys` or native listener
- Optimistic UI + TanStack Query for smooth data flow

### Proposed Keyboard Shortcuts

| Action          | Shortcut       | Google Slides Parallel |
| --------------- | -------------- | ---------------------- |
| New block/slide | Ctrl + M       | Ctrl + M (new slide)   |
| Duplicate       | Ctrl + D       | Ctrl + D               |
| Undo            | Ctrl + Z       | Ctrl + Z               |
| Redo            | Ctrl + Y       | Ctrl + Y               |
| Insert chart    | Ctrl + Alt + C | (contextual insert)    |
| Present mode    | F5 / Ctrl + F5 | Ctrl + F5              |

### Reference Structure (`app/edit/[deckId]/page.tsx`)

```tsx
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Paper,
  List,
  ListItem,
} from '@interactive-document/material-ui';
import { useQuery } from '@tanstack/react-query';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import api from '@/lib/api';
import BarChart from '@/components/BarChart'; // example

export default function Editor({ params: { deckId } }) {
  const { data: deck } = useQuery(['deck', deckId], () =>
    api.get(`/decks/${deckId}`),
  );

  // Placeholder drag handlers...

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppBar position="static" elevation={1}>
        <Toolbar variant="dense">
          <IconButton edge="start" color="inherit" aria-label="undo">
            {/* Undo icon */}
          </IconButton>
          {/* Insert, share, present buttons */}
          <div className="flex-1" />
          {/* Theme toggle, user avatar, etc. */}
        </Toolbar>
      </AppBar>

      <div className="flex flex-1">
        <Drawer variant="permanent" className="w-64 shrink-0">
          <DndContext collisionDetection={closestCenter}>
            <SortableContext
              items={deck?.slides || []}
              strategy={verticalListSortingStrategy}
            >
              <List dense>{/* Sortable ListItem for each slide/block */}</List>
            </SortableContext>
          </DndContext>
        </Drawer>

        <Paper className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-800">
          {/* Render selected block, e.g. <BarChart data={selectedBlock.data} /> */}
        </Paper>

        <Paper className="w-80 border-l overflow-y-auto p-5">
          {/* Contextual properties: shown only when block selected */}
        </Paper>
      </div>
    </div>
  );
}
```
