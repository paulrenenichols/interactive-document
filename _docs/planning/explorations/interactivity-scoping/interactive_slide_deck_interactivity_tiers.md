# Interactive Slide Deck Interactivity Tiers

## Overview

This framework describes a spectrum between a static slide deck
(PPT/PDF) and a full-scale BI application.\
The goal: create an **interactive report / guided analytic document**
where all content is pre-authored and preloaded, and the interface
reveals, filters, or re-expresses that content in response to user
interaction.

Core principles: - **Details on demand** - **Progressive disclosure** -
Reward curiosity without overwhelming the primary narrative

------------------------------------------------------------------------

## Tier 0 --- Static Document

**User experience:** Fixed visuals, fixed narrative.

**BI terms:** Static report, export, snapshot

------------------------------------------------------------------------

## Tier 1 --- Enhanced Reading (Micro-Interactions)

Adds explanation without changing analysis.

**Interaction patterns:** - Rich tooltips - Glossary / term
definitions - Methodology popovers - Info panels - Data labels on
hover - Highlight on hover

**BI terms:** - Rich tooltips - Annotations - Metadata / lineage -
Details-on-demand

**Value:** Preserves document feel with added clarity.

------------------------------------------------------------------------

## Tier 2 --- Inspect Mode (Focus + Reveal)

Improves precision and inspection without redefining analysis.

**Interaction patterns:** - Legend toggles (hide/show series) - Zoom /
pan - Sort toggle - Top-N toggle - Percent vs absolute switch - View
data table

**BI terms:** - Focus mode - Show data - Visual header actions -
Exploratory interactions

------------------------------------------------------------------------

## Tier 3 --- Slicers and Cohort Switches (Controlled Reconfiguration)

Users change subsets within predefined dimensions.

**Interaction patterns:** - Slicers (multi-checkbox, dropdowns) -
Measure switcher - Time period switch - Segment toggle - Benchmark
comparisons

**BI terms:** - Slicers - Filters (visual, page, report-level) -
Parameters - Slice-and-dice

**Implementation note:** Works best with a precomputed "cube" of
dimensions × measures × time.

------------------------------------------------------------------------

## Tier 4 --- Drill-Down and Expand/Collapse (Hierarchies)

Navigate structured hierarchies.

**Interaction patterns:** - Drill-down / drill-up - Expand/collapse
nodes - Breadcrumb navigation - Pie segment decomposition

**BI terms:** - Drill-down / Drill-up - Hierarchies - Expand all down
one level - Decomposition

------------------------------------------------------------------------

## Tier 5 --- Drill-Through to Detail Pages

Pre-authored "appendix on click."

**Interaction patterns:** - Click entity → open prebuilt detail page -
Exception-based drill-through - Contributing row visibility

**BI terms:** - Drill-through - Detail page - Tooltip page -
Master-detail pattern

------------------------------------------------------------------------

## Tier 6 --- Linked Views (Coordinated Interactions)

Charts respond to selections in other charts.

**Interaction patterns:** - Cross-filtering - Cross-highlighting -
Brushing - Multi-chart selection propagation

**BI terms:** - Cross-filtering vs cross-highlighting - Coordinated
multiple views - Brushing and linking

**Caution:** Requires clear reset and active-selection indicators.

------------------------------------------------------------------------

## Tier 7 --- Guided Exploration (Bookmarks & Story States)

Curated exploration paths.

**Interaction patterns:** - Bookmarks (saved states) - Narrative steps
(Next/Back) - Question-based navigation - Preconfigured analytic views

**BI terms:** - Bookmarks - Story points - Guided analytics - Narrative
visualization

------------------------------------------------------------------------

## Tier 8 --- What-If and Scenario Playback

Bounded modeling within predefined scenarios.

**Interaction patterns:** - Scenario selector (Base / Upside /
Downside) - Driver sliders - Sensitivity views

**BI terms:** - What-if parameters - Scenario analysis - Sensitivity
analysis

**Note:** Requires either precomputed scenarios or bounded in-browser
computation.

------------------------------------------------------------------------

## Vocabulary Map

-   Tooltip (rich tooltip)
-   Slicer
-   Filter scope
-   Drill-down / Drill-up
-   Expand / Collapse
-   Drill-through
-   Cross-highlighting
-   Cross-filtering
-   Brushing
-   Bookmark / Story

------------------------------------------------------------------------

## Recommended Milestone Path

1.  Tier 1 --- Rich tooltips & annotations\
2.  Tier 2 --- Inspect mode & data table\
3.  Tier 3 --- Cohort slicers & measure switches\
4.  Tier 4/5 --- Drill-down & drill-through\
5.  Tier 7 --- Guided bookmarks\
6.  Tier 6 --- Cross-filtering (optional, advanced)

------------------------------------------------------------------------

## Design Constraint

Keep interactions constrained to three verbs:

1.  **Explain**
2.  **Re-express**
3.  **Navigate**

If a feature falls outside these, it likely shifts toward a full
application rather than a guided document.
