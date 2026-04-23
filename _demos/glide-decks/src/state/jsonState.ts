import type { ProjectSnapshot } from "./projectSnapshot";

export function downloadJsonFile(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function pickAndReadJsonFile(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result ?? "");
          resolve(JSON.parse(text) as unknown);
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      };
      reader.onerror = () => {
        reject(reader.error ?? new Error("Failed to read file"));
      };
      reader.readAsText(file);
    });
    input.click();
  });
}

const DEFAULT_SNAPSHOT_FILENAME = "glide-project-snapshot.json";

export function saveProjectSnapshotToFile(snapshot: ProjectSnapshot, filename = DEFAULT_SNAPSHOT_FILENAME): void {
  downloadJsonFile(filename, snapshot);
}
