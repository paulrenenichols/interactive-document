const STORAGE_KEY = "slideDeck.deleteSlide.skipConfirm";

export function readSkipDeleteSlideConfirm(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSkipDeleteSlideConfirm(skip: boolean): void {
  try {
    if (skip) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
