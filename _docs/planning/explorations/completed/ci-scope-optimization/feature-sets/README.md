# Feature sets

For overview and structure, see ../README.md.

## Docs-only guard

Skip heavy CI when a change only touches docs/planning paths like `_docs/**`, so exploration work and documentation edits can merge quickly.

## Nx-affected CI

Use `nx affected` to scope lint/test/build to only the projects actually impacted by a change, instead of running everything.

## Workflow clarity

Make CI scope rules visible and explainable (job names, logs, and documentation) so contributors understand why their PR did or didn’t run full CI.

