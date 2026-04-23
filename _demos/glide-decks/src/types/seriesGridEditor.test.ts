import { describe, expect, it } from "vitest";
import { catalogRenameToApplyAfterSave } from "./seriesGridEditor";

describe("catalogRenameToApplyAfterSave", () => {
  it("returns persisted name when bootstrap catalog key differed (rename on save)", () => {
    expect(catalogRenameToApplyAfterSave("New Index 01", "idx.job family")).toBe("idx.job family");
  });

  it("returns undefined when name unchanged", () => {
    expect(catalogRenameToApplyAfterSave("idx.job family", "idx.job family")).toBeUndefined();
  });
});
