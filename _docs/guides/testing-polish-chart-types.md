# Testing guide: Polish — chart types (03-post-mvp/01-polish)

Use this after rebuilding Docker and restarting the stack to verify multiple chart types, the chart type selector, axis/labels/legend, and viewer rendering.

## Prerequisites

- Stack running: `docker compose up -d` (or `pnpm start`)
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001

---

## 1. Setup: user, deck, and data

1. Open http://localhost:3000 and register or log in.
2. Go to **Edit**, click **Create deck**.
3. Add 2–3 slides; on the first slide add a **chart block**.
4. Upload a CSV (e.g. 2–3 columns: category, value; optional third column for series) via **Upload CSV** in the canvas header.
5. Select the chart block. In **Properties**, choose the **Data source** and set **Category (X axis)** and **Value (Y axis)** (and **Series** if your CSV has a third column).

---

## 2. Chart type selector (editor)

1. With a chart block selected, check the **Properties** panel.
2. **Check:** A **Chart type** dropdown appears above **Data source**, with options: **Bar**, **Line**, **Pie**, **Area**.
3. Default for a new chart block should be **Bar**.
4. Change to **Line**. **Check:** Canvas preview updates to a line chart.
5. Change to **Pie**. **Check:** Canvas preview updates to a pie chart.
6. Change to **Area**. **Check:** Canvas preview updates to an area chart.
7. Change back to **Bar**. **Check:** Bar chart renders again.
8. Add a second chart block on another slide; leave it as Bar, configure data. **Check:** Second block keeps Bar until you change it.

---

## 3. Each chart type in editor

For the same data source and column mapping, verify each type in the canvas:

| Type  | What to check |
|-------|----------------|
| **Bar**  | Bars render; category on X, value on Y; optional series = grouped bars; axis labels show (category/value key names). |
| **Line** | Line(s) render; category on X, value on Y; optional series = multiple lines; axis labels; legend if series. |
| **Pie**  | Slices by category; values as percentages/labels; legend; tooltip on hover. |
| **Area** | Filled area(s); category on X, value on Y; optional series = multiple areas; axis labels; legend if series. |

For all types:

- **Tooltip:** Hover a data point; tooltip shows label/value and (for bar/line/area) extra row data.
- **No crash** when switching type with the same data.

---

## 4. Axis labels and legend

1. **Bar / Line / Area:** Confirm axis labels appear (e.g. category column name under X axis, value column name on Y axis).
2. **Bar / Line / Area with Series:** Confirm a legend appears (e.g. series names).
3. **Pie:** Confirm slice labels (name + percent) and legend.

---

## 5. Viewer: correct chart type

1. From the editor, click **View** or **Present** to open the full-screen viewer.
2. **Check:** The chart on the slide matches the type selected in the editor (Bar / Line / Pie / Area).
3. Change chart type in the editor (e.g. to **Pie**), save (change is persisted on blur/select). Re-open the viewer.
4. **Check:** Viewer shows the updated type (Pie).
5. For each type in the viewer: confirm tooltips work on hover and chart looks correct (no wrong chart type).

---

## 6. Multiple slides with different chart types

1. In the editor: Slide 1 — Bar chart; Slide 2 — Line chart; Slide 3 — Pie chart; Slide 4 — Area chart (add slides and chart blocks as needed).
2. Configure each chart with the same or different data source.
3. Open the viewer and step through slides (Next/Previous or keyboard).
4. **Check:** Each slide shows the correct chart type and data; no type “bleed” between slides.

---

## 7. Persistence and reload

1. Set a chart to **Line**, select another block or slide, then select the chart again.
2. **Check:** Chart type remains **Line** in the dropdown and canvas.
3. Reload the editor page (F5). **Check:** Chart type is still **Line** (and data source/columns unchanged).
4. Open viewer again. **Check:** Line chart still displays.

---

## 8. Edge cases (optional)

- **Chart block with no chart type set (legacy):** If a block has no `chart_type`, it should default to Bar. Verify one such block (or create via API) shows Bar in editor and viewer.
- **Pie with many categories:** Upload CSV with many rows; use as Pie. **Check:** Renders without crash; legend/slices readable or scrollable as appropriate.
- **Empty data / loading:** New chart block before data source selected shows “Configure chart…”. After selecting data and columns, chart appears. **Check:** No errors in console.

---

## Quick checklist

| Item | Pass |
|------|------|
| Chart type dropdown in Properties (Bar/Line/Pie/Area) | ☐ |
| Changing type updates canvas preview immediately | ☐ |
| Bar chart: bars, axis labels, tooltip | ☐ |
| Line chart: line(s), axis labels, legend if series, tooltip | ☐ |
| Pie chart: slices, labels, legend, tooltip | ☐ |
| Area chart: area(s), axis labels, legend if series, tooltip | ☐ |
| Viewer shows same chart type as editor | ☐ |
| Switching type in editor and re-opening viewer shows new type | ☐ |
| Multiple slides with different chart types render correctly | ☐ |
| Chart type persists after reload | ☐ |

---

## Rebuild and restart (reference)

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

Frontend: http://localhost:3000 — API: http://localhost:3001
