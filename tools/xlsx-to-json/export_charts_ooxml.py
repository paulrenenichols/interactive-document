r"""
Extract charts from an xlsx file using OOXML (zip + lxml) for full fidelity:
position/size, data, and resolved RGB colors (theme + chart).

Use as a callable module:

    from export_charts_ooxml import export_charts_ooxml

    data = export_charts_ooxml(r"C:\path\to\file.xlsx")
    data = export_charts_ooxml("file.xlsx", "output/charts.json")

Output JSON has top-level "charts" (array) and "styles" (theme/document colors).
"""

import json
import zipfile
from pathlib import Path
from typing import Any

# OOXML namespaces
NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "c": "http://schemas.openxmlformats.org/drawingml/2006/chart",
    "xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "cs": "http://schemas.microsoft.com/office/drawing/2012/chartStyle",
}


def _read_xml(zipf: zipfile.ZipFile, path: str):
    """Read and parse an XML part from the zip with lxml."""
    from lxml import etree
    data = zipf.read(path)
    return etree.fromstring(data)


def _el(el, tag: str, ns: str = "c"):
    """First child element with given local tag in namespace."""
    if el is None:
        return None
    from lxml import etree
    ns_uri = NS.get(ns, NS["c"])
    return el.find(f"{{{ns_uri}}}{tag}")


def _els(el, tag: str, ns: str = "c"):
    """All child elements with given local tag."""
    if el is None:
        return []
    from lxml import etree
    ns_uri = NS.get(ns, NS["c"])
    return el.findall(f"{{{ns_uri}}}{tag}")


def _attr(el, name: str, default=None):
    """Get attribute value."""
    if el is None:
        return default
    return el.get(name, default)


def _text(el, default=None):
    """Get direct text content of element."""
    if el is None:
        return default
    return el.text or default


# --- Theme and color resolution ---

def _rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}".upper()


def _hex_to_rgb(hex_str: str) -> tuple[int, int, int]:
    hex_str = hex_str.lstrip("#")
    if len(hex_str) == 6:
        return int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16)
    return 0, 0, 0


def _rgb_to_hsl(r: int, g: int, b: int) -> tuple[float, float, float]:
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    mx, mn = max(r, g, b), min(r, g, b)
    L = (mx + mn) / 2.0
    if mx == mn:
        return 0.0, 0.0, L
    d = mx - mn
    S = d / (2.0 - mx - mn) if L > 0.5 else d / (mx + mn)
    if mx == r:
        H = (g - b) / d + (6 if g < b else 0)
    elif mx == g:
        H = (b - r) / d + 2
    else:
        H = (r - g) / d + 4
    H /= 6.0
    return H, S, L


def _hsl_to_rgb(H: float, S: float, L: float) -> tuple[int, int, int]:
    def f(n):
        k = (n + H * 12) % 12
        return L - S * min(L, 1 - L) * max(-1, min(k - 3, 9 - k, 1))
    r = round(255 * f(0))
    g = round(255 * f(8))
    b = round(255 * f(4))
    return max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b))


def _apply_lum_mod_off(r: int, g: int, b: int, lum_mod: int | None, lum_off: int | None) -> tuple[int, int, int]:
    """Apply OOXML lumMod (multiply) and lumOff (add) to luminance; 100000 = 100%."""
    if lum_mod is None and lum_off is None:
        return (r, g, b)
    H, S, L = _rgb_to_hsl(r, g, b)
    if lum_mod is not None:
        L = L * (lum_mod / 100000.0)
    if lum_off is not None:
        L = L + (lum_off / 100000.0)
    L = max(0.0, min(1.0, L))
    return _hsl_to_rgb(H, S, L)


def _parse_theme_scheme(zipf: zipfile.ZipFile, theme_path: str) -> dict[str, str]:
    """Parse theme/theme1.xml and return scheme name -> #RRGGBB (srgbClr or sysClr lastClr)."""
    try:
        root = _read_xml(zipf, theme_path)
    except Exception:
        return {}
    scheme = root.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}clrScheme")
    if scheme is None:
        return {}
    out = {}
    for child in scheme:
        tag = child.tag.split("}")[-1]  # dk1, lt1, accent1, ...
        srgb = child.find("{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr")
        if srgb is not None and srgb.get("val"):
            out[tag] = "#" + srgb.get("val", "").upper().lstrip("#")
            continue
        sys_clr = child.find("{http://schemas.openxmlformats.org/drawingml/2006/main}sysClr")
        if sys_clr is not None and sys_clr.get("lastClr"):
            out[tag] = "#" + sys_clr.get("lastClr", "000000").upper().lstrip("#")
    # Common aliases
    if "dk1" in out and "tx1" not in out:
        out["tx1"] = out["dk1"]
    if "lt1" in out and "bg1" not in out:
        out["bg1"] = out["lt1"]
    return out


def _child_lum(el) -> tuple[int | None, int | None]:
    """Get lumMod and lumOff from child elements (OOXML puts them as child elements)."""
    lum_mod = el.find("{http://schemas.openxmlformats.org/drawingml/2006/main}lumMod")
    lum_off = el.find("{http://schemas.openxmlformats.org/drawingml/2006/main}lumOff")
    return (
        int(lum_mod.get("val")) if lum_mod is not None and lum_mod.get("val") else None,
        int(lum_off.get("val")) if lum_off is not None and lum_off.get("val") else None,
    )


def _resolve_color_el(el, theme_map: dict[str, str]) -> str | None:
    """Resolve a color element (under solidFill, or the element itself) to #RRGGBB. Handles srgbClr and schemeClr with lumMod/lumOff."""
    if el is None:
        return None
    # Element may be the color node itself (e.g. schemeClr) or a container
    tag = el.tag.split("}")[-1] if "}" in el.tag else el.tag
    if tag == "srgbClr":
        val = el.get("val")
        if not val:
            return None
        r, g, b = _hex_to_rgb("#" + val.lstrip("#"))
        lum_mod, lum_off = _child_lum(el)
        r, g, b = _apply_lum_mod_off(r, g, b, lum_mod, lum_off)
        return _rgb_to_hex(r, g, b)
    if tag == "schemeClr":
        val = el.get("val")
        if not val or val not in theme_map:
            return None
        base = theme_map[val]
        r, g, b = _hex_to_rgb(base)
        lum_mod, lum_off = _child_lum(el)
        r, g, b = _apply_lum_mod_off(r, g, b, lum_mod, lum_off)
        return _rgb_to_hex(r, g, b)
    # Look for child color elements
    srgb = el.find("{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr")
    if srgb is not None:
        return _resolve_color_el(srgb, theme_map)
    scheme = el.find("{http://schemas.openxmlformats.org/drawingml/2006/main}schemeClr")
    if scheme is not None:
        return _resolve_color_el(scheme, theme_map)
    return None


def _get_fill_rgb(el, theme_map: dict[str, str]) -> str | None:
    """Get solid fill color from spPr (shape properties) element."""
    if el is None:
        return None
    solid = el.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill")
    if solid is None:
        return None
    for child in solid:
        result = _resolve_color_el(child, theme_map)
        if result is not None:
            return result
    return None


# --- Text properties (txPr): font size, bold, italic, color ---

A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"


def _parse_txpr(txpr_el, theme_map: dict[str, str]) -> dict[str, Any]:
    """
    Parse DrawingML txPr (text properties) for font size, bold, italic, and fill color.
    Looks in a:lstStyle/a:defPPr/a:defRPr and a:p/a:pPr/a:defRPr. sz is in hundredths of a point.
    Returns dict with fontSize_pt (float or None), bold (bool), italic (bool), color (#RRGGBB or None).
    """
    out: dict[str, Any] = {"fontSize_pt": None, "bold": None, "italic": None, "color": None}
    if txpr_el is None:
        return out
    # defRPr can be under lstStyle/defPPr or under p/pPr
    def_rpr = txpr_el.find(f".//{{{A_NS}}}defRPr")
    if def_rpr is None:
        return out
    # sz: font size in hundredths of a point (e.g. 1800 = 18 pt)
    val = def_rpr.get("sz")
    if val is not None:
        try:
            out["fontSize_pt"] = int(val) / 100.0
        except ValueError:
            pass
    out["bold"] = def_rpr.get("b") == "1"
    out["italic"] = def_rpr.get("i") == "1"
    # Fill color: solidFill under defRPr
    for child in def_rpr:
        if child.tag.split("}")[-1] == "solidFill":
            rgb = _resolve_color_el(child, theme_map)
            if rgb is not None:
                out["color"] = rgb
            break
    return out


def _parse_manual_layout(layout_el) -> dict[str, float] | None:
    """Parse c:layout/c:manualLayout for x, y, w, h (0..1 factors). Returns None if no manual layout."""
    if layout_el is None:
        return None
    manual = layout_el.find(f"{{{NS['c']}}}manualLayout")
    if manual is None:
        return None
    result = {}
    for key in ["x", "y", "w", "h"]:
        el = manual.find(f"{{{NS['c']}}}{key}")
        if el is not None and el.get("val") is not None:
            try:
                result[key] = float(el.get("val"))
            except ValueError:
                pass
    return result if result else None


def _parse_title_element(title_el, theme_map: dict[str, str]) -> dict[str, Any]:
    """
    Parse c:title element: text, overlay, layout (manualLayout x,y,w,h), txPr (font), spPr fill.
    Returns dict with text, overlay (bool), layout (dict or None), txPr (dict), fill (hex or None).
    """
    out: dict[str, Any] = {
        "text": None,
        "overlay": None,
        "layout": None,
        "txPr": {},
        "fill": None,
    }
    if title_el is None:
        return out
    # Text from c:tx (strRef or rich/v)
    tx = title_el.find(f"{{{NS['c']}}}tx")
    if tx is not None:
        t_el = tx.find(".//{http://schemas.openxmlformats.org/drawingml/2006/chart}t")
        if t_el is not None and t_el.text:
            out["text"] = t_el.text
        else:
            out["text"] = _text_content(tx).strip() or None
    if out["text"] is None:
        out["text"] = _text_content(title_el).strip() or None
    # overlay: c:overlay @val 0|1
    overlay_el = title_el.find(f"{{{NS['c']}}}overlay")
    if overlay_el is not None and overlay_el.get("val") is not None:
        out["overlay"] = overlay_el.get("val") == "1"
    # layout
    layout_el = title_el.find(f"{{{NS['c']}}}layout")
    out["layout"] = _parse_manual_layout(layout_el)
    # txPr
    txpr = title_el.find(f"{{{NS['c']}}}txPr")
    out["txPr"] = _parse_txpr(txpr, theme_map)
    # spPr fill
    sp_pr = title_el.find(f"{{{NS['c']}}}spPr")
    if sp_pr is not None:
        out["fill"] = _get_fill_rgb(sp_pr, theme_map)
    return out


def _parse_legend_element(legend_el, theme_map: dict[str, str]) -> dict[str, Any] | None:
    """
    Parse c:legend element: legendPos (b|l|r|t|tr), overlay, layout, txPr.
    Returns dict or None if legend_el is None.
    """
    if legend_el is None:
        return None
    out: dict[str, Any] = {
        "legendPos": None,
        "overlay": None,
        "layout": None,
        "txPr": {},
    }
    # legendPos: c:legendPos @val (ST_LegendPos: b, l, r, t, tr)
    pos_el = legend_el.find(f"{{{NS['c']}}}legendPos")
    if pos_el is not None and pos_el.get("val"):
        out["legendPos"] = pos_el.get("val")
    # overlay
    overlay_el = legend_el.find(f"{{{NS['c']}}}overlay")
    if overlay_el is not None and overlay_el.get("val") is not None:
        out["overlay"] = overlay_el.get("val") == "1"
    # layout
    layout_el = legend_el.find(f"{{{NS['c']}}}layout")
    out["layout"] = _parse_manual_layout(layout_el)
    # txPr (legend text formatting)
    txpr = legend_el.find(f"{{{NS['c']}}}txPr")
    out["txPr"] = _parse_txpr(txpr, theme_map)
    return out


# --- Relationship and zip tree ---

def _resolve_part_path(part_path: str, target: str) -> str:
    """Resolve target path relative to part_path (e.g. xl/worksheets/sheet1.xml + ../drawings/drawing1.xml -> xl/drawings/drawing1.xml)."""
    from pathlib import PurePosixPath
    parent = PurePosixPath(part_path).parent
    full = parent / target
    # Normalize .. segments so path matches zip namelist
    parts = []
    for p in full.parts:
        if p == "..":
            if parts:
                parts.pop()
        else:
            parts.append(p)
    return "/".join(parts)


def _parse_rels(zipf: zipfile.ZipFile, part_path: str) -> dict[str, str]:
    """Parse _rels for a part: Id -> resolved target path (within zip)."""
    base = part_path.rsplit("/", 1)[0]
    rels_path = base + "/_rels/" + part_path.split("/")[-1] + ".rels"
    if rels_path not in zipf.namelist():
        return {}
    root = _read_xml(zipf, rels_path)
    out = {}
    rel_ns = "http://schemas.openxmlformats.org/package/2006/relationships"
    for rel in root:
        if rel.tag == "{%s}Relationship" % rel_ns or rel.tag.endswith("}Relationship"):
            r_id = rel.get("Id")
            target = rel.get("Target")
            if r_id and target:
                if not target.startswith("/"):
                    target = _resolve_part_path(part_path, target)
                else:
                    target = target.lstrip("/")
                out[r_id] = target
    return out


def _discover_charts(zipf: zipfile.ZipFile) -> list[dict[str, Any]]:
    """
    Walk workbook -> sheets -> drawing -> chart. Return list of
    { sheet_name, sheet_path, drawing_path, chart_path }.
    """
    wb_rels = _parse_rels(zipf, "xl/workbook.xml")
    try:
        wb_root = _read_xml(zipf, "xl/workbook.xml")
    except Exception:
        return []
    ss_ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    rel_ns = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    sheets = []
    for sheet in wb_root.findall(".//{%s}sheet" % ss_ns):
        name = sheet.get("name")
        r_id = sheet.get("{%s}id" % rel_ns)
        if not name or not r_id:
            continue
        target = wb_rels.get(r_id)
        if not target:
            continue
        sheet_path = "xl/" + target if not target.startswith("xl/") else target
        if sheet_path not in zipf.namelist():
            continue
        sheet_rels = _parse_rels(zipf, sheet_path)
        for rel_id, draw_target in sheet_rels.items():
            if "drawing" not in draw_target:
                continue
            drawing_path = "xl/" + draw_target if not draw_target.startswith("xl/") else draw_target
            if drawing_path not in zipf.namelist():
                continue
            draw_rels = _parse_rels(zipf, drawing_path)
            for dr_id, chart_target in draw_rels.items():
                if "chart" not in chart_target:
                    continue
                chart_path = "xl/" + chart_target if not chart_target.startswith("xl/") else chart_target
                if chart_path not in zipf.namelist():
                    chart_path = drawing_path.rsplit("/", 1)[0] + "/" + chart_target.lstrip("../")
                if chart_path in zipf.namelist():
                    sheets.append({
                        "sheetName": name,
                        "sheetPath": sheet_path,
                        "drawingPath": drawing_path,
                        "chartPath": chart_path,
                    })
    return sheets


# --- Drawing: position and size from twoCellAnchor ---

# Approximate EMU per column/row for default Excel layout (for computed width/height when ext is 0,0)
_EMU_PER_COL = 9525 * 10  # ~10 "units" per col
_EMU_PER_ROW = 12700 * 15  # 15 pt default row


def _parse_drawing_anchors(zipf: zipfile.ZipFile, drawing_path: str) -> list[dict[str, Any]]:
    """Parse drawing XML; return list of { position, size, width_emu, height_emu } for each chart (graphicFrame)."""
    root = _read_xml(zipf, drawing_path)
    anchors = []
    for anchor in root.findall(".//{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}twoCellAnchor"):
        gframe = anchor.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}graphicFrame")
        if gframe is None:
            continue
        gdata = gframe.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}graphicData")
        if gdata is None or "chart" not in (gdata.get("uri") or ""):
            continue
        from_el = anchor.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}from")
        to_el = anchor.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}to")
        if from_el is None or to_el is None:
            anchors.append({"position": None, "size": None, "width_emu": None, "height_emu": None})
            continue
        def get_cell(el):
            col = int(el.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}col").text or 0)
            col_off = int(el.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}colOff").text or 0)
            row = int(el.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}row").text or 0)
            row_off = int(el.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}rowOff").text or 0)
            return {"col": col, "row": row, "colOff_emu": col_off, "rowOff_emu": row_off}
        pos = get_cell(from_el)
        end = get_cell(to_el)
        width_emu = (end["col"] - pos["col"]) * _EMU_PER_COL + (end["colOff_emu"] - pos["colOff_emu"])
        height_emu = (end["row"] - pos["row"]) * _EMU_PER_ROW + (end["rowOff_emu"] - pos["rowOff_emu"])
        anchors.append({
            "position": pos,
            "size": end,
            "width_emu": width_emu,
            "height_emu": height_emu,
        })
    return anchors


# --- Chart: data and colors ---

def _text_content(el) -> str:
    """Recursive text of element."""
    if el is None:
        return ""
    return (el.text or "") + "".join(_text_content(c) for c in el) + (el.tail or "")


def _parse_num_cache(el) -> list[float | None]:
    out = []
    for pt in el.findall("{http://schemas.openxmlformats.org/drawingml/2006/chart}pt"):
        v_el = pt.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}v")
        if v_el is not None and v_el.text:
            try:
                out.append(float(v_el.text))
            except ValueError:
                out.append(None)
        else:
            out.append(None)
    return out


def _parse_str_cache(el) -> list[str | None]:
    out = []
    for pt in el.findall("{http://schemas.openxmlformats.org/drawingml/2006/chart}pt"):
        v_el = pt.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}v")
        out.append(v_el.text if v_el is not None and v_el.text else None)
    return out


def _parse_chart_data_and_colors(
    zipf: zipfile.ZipFile,
    chart_path: str,
    theme_map: dict[str, str],
) -> dict[str, Any]:
    """Parse chart XML: title, title properties, legend, chart type, series data, and RGB."""
    root = _read_xml(zipf, chart_path)
    out = {
        "title": None,
        "titleProperties": None,
        "legend": None,
        "chartType": None,
        "plotArea": None,
        "series": [],
        "colors": [],  # per-series and per-point RGB
    }
    chart = root.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}chart")
    if chart is None:
        return out
    # Chart title (direct child of c:chart only; avoid axis titles)
    title_el = chart.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}title")
    if title_el is not None:
        title_props = _parse_title_element(title_el, theme_map)
        out["title"] = title_props.get("text")
        # Export layout, overlay, txPr, fill; omit "text" (already in title) and empty values
        out["titleProperties"] = {
            k: v for k, v in title_props.items()
            if k != "text" and v is not None and v != {}
        }
        if not out["titleProperties"]:
            out["titleProperties"] = None
    # Legend (direct child of c:chart)
    legend_el = chart.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}legend")
    if legend_el is not None:
        out["legend"] = _parse_legend_element(legend_el, theme_map)
    # Chart type and plot area
    plot_area = chart.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}plotArea")
    if plot_area is not None:
        for chart_type in ["pieChart", "barChart", "lineChart", "areaChart", "doughnutChart", "scatterChart", "bubbleChart", "radarChart"]:
            tag = "{http://schemas.openxmlformats.org/drawingml/2006/chart}" + chart_type
            if plot_area.find(tag) is not None:
                out["chartType"] = chart_type.replace("Chart", "Chart")
                break
        layout = plot_area.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}layout")
        if layout is not None:
            manual = layout.find(".//{http://schemas.openxmlformats.org/drawingml/2006/chart}manualLayout")
            if manual is not None:
                out["plotArea"] = {}
                for key in ["x", "y", "w", "h"]:
                    el = manual.find(f"{{{NS['c']}}}{key}")
                    if el is not None and el.get("val") is not None:
                        try:
                            out["plotArea"][key] = float(el.get("val"))
                        except ValueError:
                            pass
    # Series
    for ser in root.findall(".//{http://schemas.openxmlformats.org/drawingml/2006/chart}ser"):
        s = {"name": None, "categories": [], "values": [], "pointColors": []}
        # Series name from tx/strRef or tx/v
        tx = ser.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}tx")
        if tx is not None:
            str_ref = tx.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}strRef")
            if str_ref is not None:
                cache = str_ref.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}strCache")
                if cache is not None:
                    pts = cache.findall("{http://schemas.openxmlformats.org/drawingml/2006/chart}pt")
                    if pts and pts[0].find("{http://schemas.openxmlformats.org/drawingml/2006/chart}v") is not None:
                        s["name"] = pts[0].find("{http://schemas.openxmlformats.org/drawingml/2006/chart}v").text
            else:
                v_el = tx.find(".//{http://schemas.openxmlformats.org/drawingml/2006/chart}v")
                if v_el is not None and v_el.text:
                    s["name"] = v_el.text
        # Categories
        cat = ser.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}cat")
        if cat is not None:
            str_ref = cat.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}strRef")
            num_ref = cat.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}numRef")
            if str_ref is not None:
                cache = str_ref.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}strCache")
                if cache is not None:
                    s["categories"] = _parse_str_cache(cache)
            elif num_ref is not None:
                cache = num_ref.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}numCache")
                if cache is not None:
                    s["categories"] = _parse_num_cache(cache)
        # Values
        val = ser.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}val")
        if val is not None:
            num_ref = val.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}numRef")
            if num_ref is not None:
                cache = num_ref.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}numCache")
                if cache is not None:
                    s["values"] = _parse_num_cache(cache)
        # Series-level color
        sp_pr = ser.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}spPr")
        if sp_pr is not None:
            rgb = _get_fill_rgb(sp_pr, theme_map)
            if rgb:
                s["seriesColor"] = rgb
        # Per-point colors (dPt)
        for dpt in ser.findall("{http://schemas.openxmlformats.org/drawingml/2006/chart}dPt"):
            idx_el = dpt.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}idx")
            idx = int(idx_el.get("val", 0)) if idx_el is not None else len(s["pointColors"])
            sp = dpt.find("{http://schemas.openxmlformats.org/drawingml/2006/chart}spPr")
            rgb = _get_fill_rgb(sp, theme_map) if sp is not None else None
            while len(s["pointColors"]) <= idx:
                s["pointColors"].append(None)
            s["pointColors"][idx] = rgb
        out["series"].append(s)
        out["colors"].append({
            "seriesColor": s.get("seriesColor"),
            "pointColors": s["pointColors"],
        })
    return out


# --- Styles (theme + document-wide) ---

def _build_styles(zipf: zipfile.ZipFile, theme_path: str) -> dict[str, Any]:
    """Build styles object: theme colors as RGB, and optional chart style/colors."""
    styles = {"theme": {}, "chartStyle": None}
    theme_map = _parse_theme_scheme(zipf, theme_path)
    for k, v in theme_map.items():
        styles["theme"][k] = v
    # Optional: chart colors1.xml as document-wide color cycle
    for name in zipf.namelist():
        if "xl/charts/colors1.xml" in name:
            try:
                root = _read_xml(zipf, name)
                colors = []
                for scheme in root.findall(".//{http://schemas.openxmlformats.org/drawingml/2006/main}schemeClr"):
                    val = scheme.get("val")
                    if val and val in theme_map:
                        colors.append(theme_map[val])
                    else:
                        colors.append(None)
                for srgb in root.findall(".//{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr"):
                    val = srgb.get("val")
                    if val:
                        colors.append("#" + val.upper().lstrip("#"))
                if colors:
                    styles["chartStyle"] = {"colorCycle": colors}
            except Exception:
                pass
            break
    return styles


# --- Public API ---

def export_charts_ooxml(xlsx_path: str | Path, output_path: str | Path | None = None) -> dict[str, Any]:
    """
    Open an xlsx file via zip + lxml, discover all charts, extract data + position/size + RGB colors.

    :param xlsx_path: Path to the xlsx file.
    :param output_path: Optional path to write JSON. If None, only the dict is returned.
    :return: Dict with "charts" (array) and "styles" (theme/document colors).
    """
    path = Path(xlsx_path).resolve()
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")

    with zipfile.ZipFile(path, "r") as zipf:
        # Theme (from workbook rels)
        wb_rels = _parse_rels(zipf, "xl/workbook.xml")
        theme_path = wb_rels.get(next((k for k, v in wb_rels.items() if "theme" in v), ""), "xl/theme/theme1.xml")
        if not theme_path.startswith("xl/"):
            theme_path = "xl/" + theme_path
        if theme_path not in zipf.namelist():
            theme_path = "xl/theme/theme1.xml"
        theme_map = _parse_theme_scheme(zipf, theme_path)
        styles = _build_styles(zipf, theme_path)

        # Discover sheet -> drawing -> chart
        discovered = _discover_charts(zipf)
        charts_out = []

        for item in discovered:
            anchors = _parse_drawing_anchors(zipf, item["drawingPath"])
            chart_data = _parse_chart_data_and_colors(zipf, item["chartPath"], theme_map)
            for i, anchor in enumerate(anchors):
                charts_out.append({
                    "sheetName": item["sheetName"],
                    "chartIndex": i,
                    "position": anchor.get("position"),
                    "size": anchor.get("size"),
                    "width_emu": anchor.get("width_emu"),
                    "height_emu": anchor.get("height_emu"),
                    "title": chart_data["title"],
                    "titleProperties": chart_data.get("titleProperties"),
                    "legend": chart_data.get("legend"),
                    "chartType": chart_data["chartType"],
                    "plotArea": chart_data["plotArea"],
                    "series": chart_data["series"],
                    "colors": chart_data["colors"],
                })

    result = {"charts": charts_out, "styles": styles}

    if output_path is not None:
        out = Path(output_path).resolve()
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(result, indent=2), encoding="utf-8")

    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python export_charts_ooxml.py <xlsx_path> [output_json_path]", file=sys.stderr)
        sys.exit(1)
    xlsx_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    try:
        data = export_charts_ooxml(xlsx_path, output_path)
        if output_path is None:
            print(json.dumps(data, indent=2))
        else:
            print(f"Wrote {len(data['charts'])} chart(s) to {output_path}")
    except FileNotFoundError as e:
        print(e, file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
