/** slide-deck-spec §9 — references ChartAssetRow.id in the data model. */
export interface ChartPlacementSpec {
  chart_id: string;
  title_override?: string;
  show_legend_override?: boolean;
  show_data_labels_override?: boolean;
  aspect_ratio_locked: boolean;
  overrides_json?: Record<string, unknown>;
}
