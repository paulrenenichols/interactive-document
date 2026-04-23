/**
 * Versioned whole-project JSON snapshot for dev Save/Load and future server persistence.
 * Maps are serialized as plain objects for JSON compatibility.
 */

import type { ChartAssetRow, DataSeriesAssetRow, DataSourceRow } from "../types/dataModel";
import type { DocumentSlideDeckMeta } from "../types/slideDeck";
import type { SlideDeckLayout, SlideDeckSlide, SlideDeckTheme } from "../types/slideDeck";

export const PROJECT_SNAPSHOT_VERSION = 1 as const;

export interface ProjectSnapshotApp {
  documentTitle: string;
}

export interface ProjectSnapshotDataModel {
  dataSeriesRows: DataSeriesAssetRow[];
  dataSourceRows: DataSourceRow[];
  chartAssetRows: ChartAssetRow[];
  /** JSON-safe form of `Map<string, string[]>`. */
  valuesBySeriesName: Record<string, string[]>;
}

export interface ProjectSnapshotSlideDeck {
  documentMeta: DocumentSlideDeckMeta;
  theme: SlideDeckTheme;
  layouts: SlideDeckLayout[];
  slides: SlideDeckSlide[];
  activeSlideId: string | null;
}

export interface ProjectSnapshot {
  version: typeof PROJECT_SNAPSHOT_VERSION;
  /** ISO timestamp when exported; optional for hand-authored JSON. */
  exportedAt?: string;
  app: ProjectSnapshotApp;
  dataModel: ProjectSnapshotDataModel;
  slideDeck: ProjectSnapshotSlideDeck;
}

export interface SerializeProjectSnapshotInput {
  documentTitle: string;
  dataSeriesRows: DataSeriesAssetRow[];
  dataSourceRows: DataSourceRow[];
  chartAssetRows: ChartAssetRow[];
  valuesBySeriesName: Map<string, string[]>;
  documentMeta: DocumentSlideDeckMeta;
  theme: SlideDeckTheme;
  layouts: SlideDeckLayout[];
  slides: SlideDeckSlide[];
  activeSlideId: string | null;
}

function mapValuesToRecord(m: Map<string, string[]>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of m) {
    out[k] = v;
  }
  return out;
}

/** Builds a JSON-serializable project snapshot from live authoring state. */
export function serializeProjectSnapshot(input: SerializeProjectSnapshotInput): ProjectSnapshot {
  const documentTitle = input.documentTitle.trim() || "Untitled document";
  const documentMeta: DocumentSlideDeckMeta = {
    ...input.documentMeta,
    document_name: documentTitle,
  };
  return {
    version: PROJECT_SNAPSHOT_VERSION,
    exportedAt: new Date().toISOString(),
    app: { documentTitle },
    dataModel: {
      dataSeriesRows: input.dataSeriesRows,
      dataSourceRows: input.dataSourceRows,
      chartAssetRows: input.chartAssetRows,
      valuesBySeriesName: mapValuesToRecord(input.valuesBySeriesName),
    },
    slideDeck: {
      documentMeta,
      theme: input.theme,
      layouts: input.layouts,
      slides: input.slides,
      activeSlideId: input.activeSlideId,
    },
  };
}

function isObject(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === "object" && !Array.isArray(x);
}

/** True when JSON has the full project snapshot shape (not legacy title-only export). */
export function isProjectSnapshotShape(raw: unknown): boolean {
  if (!isObject(raw)) return false;
  return raw.app != null && raw.dataModel != null && raw.slideDeck != null;
}

function asString(x: unknown, fallback: string): string {
  return typeof x === "string" ? x : fallback;
}

function parseDataModel(raw: unknown): ProjectSnapshotDataModel {
  if (!isObject(raw)) {
    throw new Error("Project snapshot: dataModel must be an object.");
  }
  const dataSeriesRows = raw.dataSeriesRows;
  const dataSourceRows = raw.dataSourceRows;
  const chartAssetRows = raw.chartAssetRows;
  const valuesBySeriesName = raw.valuesBySeriesName;

  if (!Array.isArray(dataSeriesRows)) {
    throw new Error("Project snapshot: dataModel.dataSeriesRows must be an array.");
  }
  if (!Array.isArray(dataSourceRows)) {
    throw new Error("Project snapshot: dataModel.dataSourceRows must be an array.");
  }
  if (!Array.isArray(chartAssetRows)) {
    throw new Error("Project snapshot: dataModel.chartAssetRows must be an array.");
  }
  if (!isObject(valuesBySeriesName)) {
    throw new Error("Project snapshot: dataModel.valuesBySeriesName must be an object.");
  }

  const record: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(valuesBySeriesName)) {
    if (!Array.isArray(v) || !v.every((cell) => typeof cell === "string")) {
      throw new Error(`Project snapshot: values for series "${k}" must be string[].`);
    }
    record[k] = v;
  }

  return {
    dataSeriesRows: dataSeriesRows as DataSeriesAssetRow[],
    dataSourceRows: dataSourceRows as DataSourceRow[],
    chartAssetRows: chartAssetRows as ChartAssetRow[],
    valuesBySeriesName: record,
  };
}

function parseSlideDeck(raw: unknown): ProjectSnapshotSlideDeck {
  if (!isObject(raw)) {
    throw new Error("Project snapshot: slideDeck must be an object.");
  }
  const documentMeta = raw.documentMeta;
  const theme = raw.theme;
  const layouts = raw.layouts;
  const slides = raw.slides;
  const activeSlideId = raw.activeSlideId;

  if (!isObject(documentMeta)) {
    throw new Error("Project snapshot: slideDeck.documentMeta must be an object.");
  }
  if (!isObject(theme)) {
    throw new Error("Project snapshot: slideDeck.theme must be an object.");
  }
  if (!Array.isArray(layouts)) {
    throw new Error("Project snapshot: slideDeck.layouts must be an array.");
  }
  if (!Array.isArray(slides)) {
    throw new Error("Project snapshot: slideDeck.slides must be an array.");
  }
  if (activeSlideId != null && typeof activeSlideId !== "string") {
    throw new Error("Project snapshot: slideDeck.activeSlideId must be string or null.");
  }

  return {
    documentMeta: documentMeta as unknown as DocumentSlideDeckMeta,
    theme: theme as unknown as SlideDeckTheme,
    layouts: layouts as unknown as SlideDeckLayout[],
    slides: slides as unknown as SlideDeckSlide[],
    activeSlideId: activeSlideId === null || activeSlideId === undefined ? null : activeSlideId,
  };
}

/**
 * Validates and normalizes parsed JSON into a ProjectSnapshot.
 * Throws with a readable message if the payload is unusable.
 */
export function parseProjectSnapshot(raw: unknown): ProjectSnapshot {
  if (!isObject(raw)) {
    throw new Error("Project snapshot: root must be a JSON object.");
  }
  const version = raw.version;
  if (version !== PROJECT_SNAPSHOT_VERSION) {
    throw new Error(
      `Project snapshot: unsupported version ${String(version)} (expected ${PROJECT_SNAPSHOT_VERSION}).`,
    );
  }

  const appRaw = raw.app;
  if (!isObject(appRaw)) {
    throw new Error("Project snapshot: app must be an object.");
  }
  const documentTitle = asString(appRaw.documentTitle, "Untitled document").trim() || "Untitled document";

  const exportedAt = raw.exportedAt;
  if (exportedAt !== undefined && typeof exportedAt !== "string") {
    throw new Error("Project snapshot: exportedAt must be a string when present.");
  }

  const dataModel = parseDataModel(raw.dataModel);
  const slideDeck = parseSlideDeck(raw.slideDeck);

  return {
    version: PROJECT_SNAPSHOT_VERSION,
    ...(exportedAt !== undefined ? { exportedAt } : {}),
    app: { documentTitle },
    dataModel,
    slideDeck: {
      ...slideDeck,
      documentMeta: {
        ...slideDeck.documentMeta,
        document_name: documentTitle,
      },
    },
  };
}

/** Restores `valuesBySeriesName` map from snapshot record. */
export function dataModelValuesRecordToMap(record: Record<string, string[]>): Map<string, string[]> {
  return new Map(Object.entries(record));
}
