import { describe, expect, it } from "vitest";
import {
  materializeUniqueIndexFromMap,
  materializeUniqueIndexFromSourceValues,
  orderedUniqueLabelsForIndex,
} from "./materializeUniqueIndex";

const sample = ["b", "a", "b", "  a  ", "", "c"];

describe("materializeUniqueIndexFromSourceValues", () => {
  it("stores unique labels in ascending order for ascending sort", () => {
    const { length, values } = materializeUniqueIndexFromSourceValues(sample, "ascending");
    expect(length).toBe(3);
    expect(values).toEqual(["a", "b", "c"]);
  });

  it("stores unique labels in descending order for descending sort", () => {
    const { length, values } = materializeUniqueIndexFromSourceValues(sample, "descending");
    expect(length).toBe(3);
    expect(values).toEqual(["c", "b", "a"]);
    expect(orderedUniqueLabelsForIndex(sample, "descending")).toEqual(["c", "b", "a"]);
  });

  it("respects custom order tokens", () => {
    const { values } = materializeUniqueIndexFromSourceValues(sample, "custom", "c\na");
    expect(values).toEqual(["c", "a", "b"]);
    expect(orderedUniqueLabelsForIndex(sample, "custom", "c\na")).toEqual(["c", "a", "b"]);
  });

  it("returns empty for empty source", () => {
    expect(materializeUniqueIndexFromSourceValues([], "ascending")).toEqual({ length: 0, values: [] });
  });
});

describe("materializeUniqueIndexFromMap", () => {
  it("reads source column from map", () => {
    const m = new Map<string, string[]>([
      ["Job Family", ["X", "Y", "X"]],
    ]);
    expect(materializeUniqueIndexFromMap("Job Family", m, "ascending")).toEqual({
      length: 2,
      values: ["X", "Y"],
    });
  });

  it("returns empty when column missing", () => {
    expect(materializeUniqueIndexFromMap("nope", new Map(), "ascending")).toEqual({
      length: 0,
      values: [],
    });
  });
});
