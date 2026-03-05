# Testing guide: Viewer (02-mvp/05-viewer)

Use this after rebuilding Docker and restarting the stack to verify the full-screen viewer and editor–viewer flow.

## Prerequisites

- Stack running: `docker compose up -d` (or `pnpm start`)
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001

## 1. Create a user and a deck

1. Open http://localhost:3000
2. Click **Create an account** (or go to `/register`)
3. Register with email and password (min 8 characters)
4. After redirect, go to **Edit** (or `/edit`)
5. Click **Create deck**
6. You are on the editor for the new deck

## 2. Add content to the deck

1. In the editor sidebar, click **+ Add slide** once or twice so you have 2–3 slides
2. Select the first slide (click “Slide 1” in the list)
3. Click **Add text block**, then click the block and in the Properties panel type some text (e.g. “Slide 1 title”)
4. Click **Add chart block**
5. In the canvas header, upload a CSV (e.g. 2–3 columns: category, value) via **Upload CSV**
6. Select the chart block; in Properties, choose the data source and set **Category** and **Value** columns
7. Switch to “Slide 2” and add at least a text block with different content

## 3. Open the viewer from the editor

1. In the editor sidebar, under “← Decks”, click **View** or **Present** (both go to the viewer)
2. You should land on **view/[deckId]** in full-screen viewer mode
3. **Check:**
   - Top bar shows **Home**, **Edit**, and slide progress (e.g. “1 / 3”)
   - Current slide shows the same blocks as in the editor (text and chart), read-only
   - Chart renders and tooltips work on hover
   - **Previous** / **Next** buttons at the bottom work
   - Keyboard: **Arrow Right** or **Space** → next slide; **Arrow Left** → previous; **Escape** → back

## 4. Keyboard and navigation

1. Use **Next** until you reach the last slide; **Next** should then be disabled
2. Use **Previous** to go back; on the first slide **Previous** should be disabled
3. Press **Escape** and confirm you go back (e.g. to the editor or previous page)
4. Re-open the viewer and try **Arrow Up** / **Arrow Down** for prev/next

## 5. Edit link (owner only)

1. While viewing, confirm **Edit** appears in the top bar (you are the deck owner)
2. Click **Edit** and confirm you are on `/edit/[deckId]`
3. In the editor, click **View** again to return to the viewer

## 6. Access control (optional)

**Public deck (if your app supports visibility):**

- Log out (or use an incognito window)
- Open the same **view/[deckId]** URL
- If the deck is public, the viewer should load without login

**Restricted deck:**

- With a restricted deck, open **view/[deckId]** while logged out
- You should see “Sign in required” with a link to log in
- Log in and reopen the same URL; you should see the deck if your user has view access

**Share token (if the deck has a share token):**

- Open **view/[deckId]?token=YOUR_SHARE_TOKEN**
- The viewer should load without logging in, using the token for deck/slides/blocks and chart data

## 7. No edit controls in viewer

- In the viewer, confirm there are no “Add text block” / “Add chart block” buttons
- No reorder/delete controls on blocks or slides
- No Properties panel; content is read-only

## Quick checklist

| Item | Pass |
|------|------|
| Viewer opens from editor (View / Present) | ☐ |
| One slide at a time, correct blocks (text + chart) | ☐ |
| Chart tooltips work | ☐ |
| Previous / Next buttons work | ☐ |
| Keyboard: arrows, Space, Escape | ☐ |
| Slide progress (e.g. 3 / 10) | ☐ |
| Edit link visible and works (when owner) | ☐ |
| 401/403 or share token behavior (if tested) | ☐ |

## Rebuild and restart (reference)

To pick up latest code and restart the stack:

```bash
docker compose build --no-cache
docker compose down
docker compose up -d
```

Or build and start in one step:

```bash
docker compose up -d --build
```

Frontend: http://localhost:3000 — API: http://localhost:3001
