import { describe, expect, it } from "vitest";
import type { SlideAuthoringSelection } from "../data/SlideElementSelectionContext";
import type { SlideDeckLayout, SlideDeckSlide, SlideDeckTheme } from "../types/slideDeck";
import {
  advanceSlideAuthoringSelection,
  buildSlideAuthoringTabOrder,
  selectionEquals,
} from "./slideAuthoringTabOrder";

function minimalTheme(id: string, master: SlideDeckTheme["master_elements"]): SlideDeckTheme {
  return {
    id,
    document_id: "d1",
    name: "T",
    color_palette: {
      accent_1: "#000",
      accent_2: "#000",
      accent_3: "#000",
      accent_4: "#000",
      accent_5: "#000",
      accent_6: "#000",
      dark_1: "#000",
      dark_2: "#000",
      light_1: "#fff",
      light_2: "#fff",
    },
    font_config: {
      heading_family: "sans-serif",
      heading_weight: 700,
      body_family: "sans-serif",
      body_weight: 400,
      monospace_family: "mono",
    },
    bullet_config: [],
    background_fill: { kind: "solid", color: "light_1" },
    master_elements: master,
    default_new_slide_layout_id: null,
    created_at: "",
    updated_at: "",
  };
}

describe("buildSlideAuthoringTabOrder", () => {
  it("orders theme z asc, then layout z asc skipping overridden placeholder, then slide z asc", () => {
    const slideId = "slide-1";
    const theme = minimalTheme("th1", [
      {
        id: "tm-low",
        element_type: "text_box",
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        z_index: 1,
        locked: false,
        spec: { paragraphs: [], fill: { kind: "none" }, border: null, padding: { top: 0, right: 0, bottom: 0, left: 0 }, auto_fit: "none", word_wrap: true, vertical_align: "top", default_style: {} },
      },
      {
        id: "tm-high",
        element_type: "shape",
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        z_index: 3,
        locked: false,
        spec: { shape_kind: "rectangle", fill: { kind: "none" }, border: null },
      },
    ]);

    const layout: SlideDeckLayout = {
      id: "lay1",
      document_id: "d1",
      theme_id: "th1",
      name: "L",
      description: null,
      thumbnail_asset_id: null,
      elements: [
        {
          id: "ph-ov",
          element_type: "placeholder",
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          z_index: 5,
          spec: {} as SlideDeckLayout["elements"][0]["spec"],
        },
        {
          id: "ph-keep",
          element_type: "placeholder",
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          z_index: 10,
          spec: {} as SlideDeckLayout["elements"][0]["spec"],
        },
      ],
      background_fill_override: null,
      created_at: "",
      updated_at: "",
    };

    const slide: SlideDeckSlide = {
      id: slideId,
      document_id: "d1",
      layout_id: "lay1",
      order_index: 1,
      name: null,
      notes: null,
      thumbnail_asset_id: null,
      elements: [
        {
          id: "ov-slide",
          slide_id: slideId,
          element_type: "text_box",
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          rotation_deg: 0,
          z_index: 20,
          locked: false,
          hidden: false,
          layout_element_id: "ph-ov",
          spec: { paragraphs: [], fill: { kind: "none" }, border: null, padding: { top: 0, right: 0, bottom: 0, left: 0 }, auto_fit: "none", word_wrap: true, vertical_align: "top", default_style: {} },
          created_at: "",
          updated_at: "",
        },
        {
          id: "s2",
          slide_id: slideId,
          element_type: "chart",
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          rotation_deg: 0,
          z_index: 2,
          locked: false,
          hidden: false,
          spec: { chart_id: "c1", aspect_ratio_locked: true },
          created_at: "",
          updated_at: "",
        },
      ],
      suppressed_layout_placeholder_ids: [],
      suppressed_theme_placeholder_ids: [],
      background_fill_override: null,
      hidden: false,
      created_at: "",
      updated_at: "",
    };

    const order = buildSlideAuthoringTabOrder(theme, layout, slide);
    expect(order.map((s) => (s.kind === "theme" ? s.themeElementId : s.kind === "layout" ? s.layoutElementId : s.elementId))).toEqual([
      "tm-low",
      "tm-high",
      "ph-keep",
      "s2",
      "ov-slide",
    ]);
  });

  it("skips suppressed layout placeholders like overridden ones", () => {
    const slideId = "slide-2";
    const theme = minimalTheme("th2", []);
    const layout: SlideDeckLayout = {
      id: "lay2",
      document_id: "d1",
      theme_id: "th2",
      name: "L",
      description: null,
      thumbnail_asset_id: null,
      elements: [
        {
          id: "ph-suppressed",
          element_type: "placeholder",
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          z_index: 1,
          spec: {} as SlideDeckLayout["elements"][0]["spec"],
        },
        {
          id: "ph-visible",
          element_type: "placeholder",
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          z_index: 2,
          spec: {} as SlideDeckLayout["elements"][0]["spec"],
        },
      ],
      background_fill_override: null,
      created_at: "",
      updated_at: "",
    };
    const slide: SlideDeckSlide = {
      id: slideId,
      document_id: "d1",
      layout_id: "lay2",
      order_index: 1,
      name: null,
      notes: null,
      thumbnail_asset_id: null,
      elements: [],
      suppressed_layout_placeholder_ids: ["ph-suppressed"],
      suppressed_theme_placeholder_ids: [],
      background_fill_override: null,
      hidden: false,
      created_at: "",
      updated_at: "",
    };
    const order = buildSlideAuthoringTabOrder(theme, layout, slide);
    expect(order.filter((s) => s.kind === "layout").map((s) => s.layoutElementId)).toEqual(["ph-visible"]);
  });

  it("skips suppressed theme placeholders like overridden ones", () => {
    const slideId = "slide-3";
    const theme = minimalTheme("th3", [
      {
        id: "th-ph-suppressed",
        element_type: "placeholder",
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        z_index: 1,
        locked: false,
        placeholder_role: "title",
        spec: {} as SlideDeckLayout["elements"][0]["spec"],
      },
      {
        id: "th-ph-visible",
        element_type: "placeholder",
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        z_index: 2,
        locked: false,
        placeholder_role: "title",
        spec: {} as SlideDeckLayout["elements"][0]["spec"],
      },
    ]);
    const layout: SlideDeckLayout = {
      id: "lay3",
      document_id: "d1",
      theme_id: "th3",
      name: "L",
      description: null,
      thumbnail_asset_id: null,
      elements: [],
      background_fill_override: null,
      created_at: "",
      updated_at: "",
    };
    const slide: SlideDeckSlide = {
      id: slideId,
      document_id: "d1",
      layout_id: "lay3",
      order_index: 1,
      name: null,
      notes: null,
      thumbnail_asset_id: null,
      elements: [],
      suppressed_layout_placeholder_ids: [],
      suppressed_theme_placeholder_ids: ["th-ph-suppressed"],
      background_fill_override: null,
      hidden: false,
      created_at: "",
      updated_at: "",
    };
    const order = buildSlideAuthoringTabOrder(theme, layout, slide);
    expect(order.filter((s) => s.kind === "theme").map((s) => s.themeElementId)).toEqual(["th-ph-visible"]);
  });
});

describe("advanceSlideAuthoringSelection", () => {
  const order: SlideAuthoringSelection[] = [
    { kind: "theme", slideId: "s", themeElementId: "a" },
    { kind: "layout", slideId: "s", layoutElementId: "b" },
    { kind: "slide", slideId: "s", elementId: "c" },
  ];

  it("wraps forward", () => {
    const next = advanceSlideAuthoringSelection(order, order[2], 1);
    expect(next).toEqual(order[0]);
  });

  it("wraps backward", () => {
    const prev = advanceSlideAuthoringSelection(order, order[0], -1);
    expect(prev).toEqual(order[2]);
  });

  it("returns null when current not in list", () => {
    expect(
      advanceSlideAuthoringSelection(order, { kind: "slide", slideId: "s", elementId: "nope" }, 1),
    ).toBeNull();
  });
});

describe("selectionEquals", () => {
  it("matches by kind and ids", () => {
    const a: SlideAuthoringSelection = { kind: "layout", slideId: "x", layoutElementId: "y" };
    const b: SlideAuthoringSelection = { kind: "layout", slideId: "x", layoutElementId: "y" };
    expect(selectionEquals(a, b)).toBe(true);
    expect(selectionEquals(a, { ...b, layoutElementId: "z" })).toBe(false);
  });
});
