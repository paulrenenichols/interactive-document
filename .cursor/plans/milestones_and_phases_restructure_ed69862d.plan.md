---
name: Milestones and phases restructure
overview: "Update new-project-setup.md to replace the flat phases model with a two-level structure: milestones (e.g. 01-setup, 02-mvp) as high-level delivery gates, each containing a subfolder of phase documents that describe work chunks within that milestone."
todos: []
isProject: false
---

# Restructure new-project-setup.md: Milestones and Phases

## Current state

- The doc recommends a single `./phases/` subdirectory with one document per phase.
- Step 8’s prompt asks for setup → MVP → additional phases, each as one doc, in `_docs/phases/`.

## Target structure

- **Milestones** = high-level delivery gates (e.g. Setup, MVP, v1.0). Each has a numbered subfolder under `_docs/milestones/`: `01-setup`, `02-mvp`, `03-...`.
- **Phases** = work chunks inside a milestone (e.g. within MVP: auth phase, core-feature phase). Each phase is a document inside that milestone’s subfolder.

**Example layout:**

```
_docs/
  milestones/
    01-setup/
      01-scaffold.md
      02-tooling.md
    02-mvp/
      01-auth.md
      02-core-feature.md
      ...
    03-post-mvp/
      ...
```

**Phase naming rule:** Phase documents must be number-prefixed (e.g. `01-auth.md`, `02-core-feature.md`) so order is clear within each milestone.

## Changes to [docs/setup/new-project-setup.md](_docs/setup/new-project-setup.md)

1. **Recommended order (item 7)**
   Replace the single `./phases/` bullet with:

- **Milestones**: Use `_docs/milestones/` with one subfolder per milestone, named `01-setup`, `02-mvp`, etc.
- **Phases**: Inside each milestone subfolder, add one document per phase (work chunk) within that milestone. Phase filenames must be number-prefixed (e.g. `01-auth.md`, `02-core-feature.md`).

1. **Step 8 prompt**
   Reword so the AI is asked to:

- Define **milestones** first (e.g. Setup, MVP, Post-MVP) and create the corresponding subfolders (`01-setup`, `02-mvp`, …).
- For each milestone, define **phases** (specific work chunks) and create one document per phase inside that milestone’s folder.
- Keep the existing rules (setup = barebones, MVP = minimal usable, iterative, max 5 steps per feature, etc.) but apply them at the phase level within each milestone.
- Explicitly say: “Place milestone folders in `_docs/milestones/` with names like `01-setup`, `02-mvp`. Place each phase document inside the appropriate milestone folder. Phase documents must use number-prefixed filenames (e.g. `01-auth.md`, `02-core-feature.md`).”

1. **Phase naming rule**
   In both the recommended order (item 7) and the step 8 prompt, state that phase documents must be number-prefixed (e.g. `01-auth.md`, `02-core-feature.md`) within each milestone folder.
2. **Step 12 (ATTACH)**
   Update the example from `setup-phase.md` to match the new structure, e.g. "the first milestone's phase doc(s)" (e.g. `_docs/milestones/01-setup/01-scaffold.md`) so users know what to attach when starting.

## Summary

| Area               | Change                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| Doc order (item 7) | Describe `_docs/milestones/` and subfolders `01-setup`, `02-mvp`, with number-prefixed phase docs inside each. |
| Step 8 prompt      | Request milestones → subfolders, then phases → number-prefixed docs per milestone; same rules, new structure.  |
| Step 12 ATTACH     | Reference the new path pattern for “first phase doc” to attach.                                                |
| Phase naming       | Require number-prefixed phase filenames (e.g. `01-auth.md`) in item 7 and step 8.                              |

No new files or code; all edits are in `_docs/setup/new-project-setup.md`.
