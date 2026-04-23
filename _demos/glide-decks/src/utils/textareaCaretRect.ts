/**
 * Returns a viewport-space caret box for `position` in a textarea (for Popper anchors).
 * Uses a mirror div; falls back to the textarea’s bottom-left inner area if measurement fails.
 */
export function getTextareaCaretRect(textarea: HTMLTextAreaElement, position: number): DOMRect {
  const safePos = Math.max(0, Math.min(position, textarea.value.length));
  const taRect = textarea.getBoundingClientRect();
  const cs = window.getComputedStyle(textarea);

  const br = parseFloat(cs.borderLeftWidth) || 0;
  const bt = parseFloat(cs.borderTopWidth) || 0;
  const pl = parseFloat(cs.paddingLeft) || 0;
  const pt = parseFloat(cs.paddingTop) || 0;

  const lineHeight = parseFloat(cs.lineHeight);
  const fallbackHeight = Number.isFinite(lineHeight) ? lineHeight : 16;

  try {
    const div = document.createElement("div");
    div.setAttribute("aria-hidden", "true");
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.overflow = "hidden";
    div.style.boxSizing = cs.boxSizing || "border-box";
    div.style.width = `${textarea.clientWidth}px`;
    div.style.font = cs.font;
    div.style.letterSpacing = cs.letterSpacing;
    div.style.padding = cs.padding;
    div.style.border = cs.border;
    div.style.lineHeight = cs.lineHeight;

    const before = textarea.value.slice(0, safePos);
    const after = textarea.value.slice(safePos) || ".";

    div.appendChild(document.createTextNode(before));
    const span = document.createElement("span");
    span.textContent = after;
    div.appendChild(span);

    document.body.appendChild(div);

    const left = span.offsetLeft;
    const top = span.offsetTop;
    document.body.removeChild(div);

    const x = taRect.left + br + pl + left - textarea.scrollLeft;
    const y = taRect.top + bt + pt + top - textarea.scrollTop;

    return new DOMRect(x, y, 0, fallbackHeight);
  } catch {
    const x = taRect.left + br + pl - textarea.scrollLeft;
    const y = taRect.top + bt + pt + textarea.clientHeight - fallbackHeight - textarea.scrollTop;
    return new DOMRect(x, y, 0, fallbackHeight);
  }
}
