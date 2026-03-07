# xlsx-to-json

Python module that **extracts charts from an XLSX file** using direct OOXML traversal (zip + lxml). It outputs a JSON structure with chart data, position/size, and resolved RGB colors suitable for downstream use (e.g. driving Recharts or another charting layer).

## What it does

- **Opens the XLSX** as a zip file and walks the relationship tree (workbook → sheets → drawings → charts).
- **Finds every chart** on every sheet that has an embedded drawing.
- **From each drawing** (spreadsheetDrawing XML): reads `twoCellAnchor` elements to get **position and size** (cell indices, offsets in EMU, and computed width/height in EMU).
- **From each chart** (chart XML): extracts **chart title** (text plus optional **title properties**: overlay, layout x/y/w/h, text formatting via `txPr` — font size in points, bold, italic, fill color — and shape fill); **legend** (position `legendPos`: `b`/`l`/`r`/`t`/`tr`, overlay, manual layout, and `txPr` for legend text formatting); **chart type** (e.g. `pieChart`, `barChart`, `lineChart`); **plot area** layout (x, y, w, h when present); and per-series **name**, **categories**, **values**, and **point/series colors**.
- **Resolves colors** using the workbook theme (`theme/theme1.xml`): maps `schemeClr` (e.g. accent1) to RGB and applies OOXML `lumMod`/`lumOff` when present. Also collects document-level chart color cycle from `xl/charts/colors1.xml` when available.
- **Writes or returns** a single JSON object with top-level `charts` (array of chart objects) and `styles` (theme map + optional `chartStyle.colorCycle`).

No chart rendering is performed; the module is extraction-only and produces a deterministic JSON description of charts and styles.

## Usage

**Command line:**

```bash
# Print JSON to stdout
python export_charts_ooxml.py path/to/file.xlsx

# Write to a file
python export_charts_ooxml.py path/to/file.xlsx output/charts.json
```

**As a module:**

```python
from export_charts_ooxml import export_charts_ooxml

# Return dict only
data = export_charts_ooxml(r"C:\path\to\file.xlsx")

# Return dict and write JSON
data = export_charts_ooxml("file.xlsx", "output/charts.json")
```

## Output shape

- **`charts`**: Array of objects, one per chart instance. Each has `sheetName`, `chartIndex`, `position`, `size`, `width_emu`, `height_emu`, `title`, **`titleProperties`** (optional: `overlay`, `layout` {x,y,w,h}, `txPr` {fontSize_pt, bold, italic, color}, `fill`), **`legend`** (optional: `legendPos` — b/l/r/t/tr, `overlay`, `layout`, `txPr`), `chartType`, `plotArea`, `series` (name, categories, values, pointColors), and `colors` (per-series/per-point RGB).
- **`styles`**: `theme` (map of scheme names like `dk1`, `accent1` to `#RRGGBB`) and optionally `chartStyle.colorCycle` (array of hex colors).

See the sample output in `_docs/planning/explorations/ingest-from-xlsx/README.md` for a full example.

## Dependencies

- **Python 3.10+** (uses `|` union syntax in type hints).
- **lxml** – parsing OOXML XML parts.
- **zipfile** (stdlib) – reading the XLSX as a zip.

Install with:

```bash
pip install -r requirements.txt
```

Note: `openpyxl` is listed in `requirements.txt` but this module does not use it for chart extraction; chart and drawing data are read directly from the OOXML XML inside the XLSX zip.

## Files

| File | Purpose |
|------|--------|
| `export_charts_ooxml.py` | Single module: discovery, drawing/chart parsing, theme resolution, and `export_charts_ooxml()` API + CLI. |
| `requirements.txt` | `lxml`, `openpyxl` (latter optional for this tool). |

## Relation to the ingest-from-xlsx exploration

This implementation aligns with the workflow described in **[_docs/planning/explorations/ingest-from-xlsx/README.md](../../_docs/planning/explorations/ingest-from-xlsx/README.md)**: open XLSX as zip, traverse XML for chart-related parts, extract semantic chart definition and styling, and expose a JSON tree for deterministic consumption (e.g. Recharts).
