# Exploration: Ingest from XLSX

## Motivation

A large amount of white-collar work product is created in Excel and PowerPoint. The typical workflow is:

1. **Ingest** data table by table from various upstream systems
2. **Manipulate** it within Excel
3. **Build exhibits** that mix regions of styled cells and Excel chart objects
4. **Write a document** in PowerPoint that includes pasted Excel artifacts and text

By ingesting draft or completed work from Excel and PowerPoint, we can bring the content into a pure JavaScript interface where piloted AI agents can manipulate the content much more quickly. This exploration focuses on **ingesting XLSX charts** so that they can be faithfully visually recreated (e.g., as Recharts in the interactive presentation app).

---

## Scope of This Exploration

This exploration is based on **ingesting XLSX charts** so that they can be faithfully visually recreated. The goal is to extract enough semantic and stylistic information from an `.xlsx` file to produce a deterministic JSON representation that can drive a Recharts (or similar) chart of similar appearance.

---

## Constraints

1. **openpyxl limitation**  
   The most popular mode for manipulating Excel in Python, the `openpyxl` library, does not expose enough of the content of charts to faithfully recreate them. A lower-level approach (direct OOXML traversal) is required.

2. **OOXML complexity and size**  
   The Microsoft Office format (OOXML) is a zip file structure that can be difficult or time-consuming to traverse. Production-grade Excel models typically run in the **3–30 MB** range, so parsing must be efficient and resilient to large, complex workbooks.

3. **Excel layout engine as a black box**  
   Excel’s layout engine details are not publicly disclosed. The requirements of an “XLSX chart → Recharts” pipeline will therefore require **inference** from available data. Excel charts encode type, data, and many styling hints, but exact pixel-perfect parity may not be achievable; the pipeline must work from what is present in the XML.

---

## Workflow (Proposed)

1. **Open the XLSX** using a zipfile manipulation library (e.g. Python `zipfile`).
2. **Traverse the XML trees** (e.g. with `lxml`) looking for chart-related parts (e.g. `xl/charts/chartN.xml`, relationships, and drawing/chart references in sheets).
3. **Extract semantic chart definition:** chart type, series, categories, values, colors, legend, title.
4. **Extract relevant features** from the parent sheet or workbook that affect styling: chart height, width, position, theme color definitions, etc.
5. **Expose a JSON tree** that can be ingested deterministically to create a Recharts (or equivalent) object of similar appearance.

---

## Sample Output

Below is sample output from a vibe-coded Python 3.10 script using `zipfile` and `lxml` to extract chart data from an XLSX. It illustrates the target schema: charts array with position, size, title, chart type, plot area, series (categories, values, point colors), and a shared `styles` object with theme and chart color cycle.

Sample XLSX files used for development can be placed in **sample-xlsx-exports/** (this folder is reserved for real exports; do not commit sensitive or proprietary workbooks without approval).

```json
{
  "charts": [
    {
      "sheetName": "Summary",
      "chartIndex": 0,
      "position": {
        "col": 6,
        "row": 9,
        "colOff_emu": 509587,
        "rowOff_emu": 57150
      },
      "size": {
        "col": 13,
        "row": 24,
        "colOff_emu": 280987,
        "rowOff_emu": 85725
      },
      "width_emu": 438150,
      "height_emu": 2886075,
      "title": "Opportunities by Sales Stage",
      "chartType": "pieChart",
      "plotArea": {
        "x": 0.35066229221347334,
        "y": 0.2145446923301254,
        "w": 0.47089785651793525,
        "h": 0.7848297608632254
      },
      "series": [
        {
          "name": "Sales Stage",
          "categories": [
            "1 - Qualify",
            "2 - Needs & Solutions",
            "3 - Presentation",
            "4 - Activate & Transition"
          ],
          "values": [
            7.0,
            23.0,
            76.0,
            1.0
          ],
          "pointColors": [
            "#F15026",
            "#0B1228",
            "#FFB74E",
            "#489820"
          ]
        }
      ],
      "colors": [
        {
          "seriesColor": null,
          "pointColors": [
            "#F15026",
            "#0B1228",
            "#FFB74E",
            "#489820"
          ]
        }
      ]
    }
  ],
  "styles": {
    "theme": {
      "dk1": "#000000",
      "lt1": "#FFFFFF",
      "dk2": "#F38C0C",
      "lt2": "#B5C3E6",
      "accent1": "#F15026",
      "accent2": "#0B1228",
      "accent3": "#FFB74E",
      "accent4": "#489820",
      "accent5": "#415D80",
      "accent6": "#B72824",
      "hlink": "#013B69",
      "folHlink": "#7030A0",
      "tx1": "#000000",
      "bg1": "#FFFFFF"
    },
    "chartStyle": {
      "colorCycle": [
        "#F15026",
        "#0B1228",
        "#FFB74E",
        "#489820",
        "#415D80",
        "#B72824"
      ]
    }
  }
}
```

---

## Next Steps / Open Questions

- Map OOXML chart types to Recharts (or app-supported) chart types.
- Define handling for charts that have no direct Recharts equivalent (fallback or “placeholder” strategy).
- Decide where ingestion runs: one-off CLI/tool that emits JSON vs. API endpoint that accepts XLSX upload and returns the same JSON.
- Whether to ingest only charts or also table regions from sheets (future expansion).
