# Storyboard — "Missed Connection"

- **lifecycleState:** final
- **decisionState:** approved
- **parents:** `02-visual-direction/visual-direction.md`, `03-characters/characters.md`

Three frames. The markdown below is the **authoritative** storyboard; the generated
board images in `frames/` are illustrative and exist to sanity-check staging, not to
define the look. Look is defined by the reference frames in stage 06.

Total target: **13.5 s** — inside the 12–15 s window with headroom either side.

---

## SB-01 — WIDE / ESTABLISH · 5.0 s

**Purpose:** Prove one station, one time, two people, converging.

```text
┌──────────────────────────────────────────────────────────────┐
│   ╱‾‾‾‾‾ arched glass roof, pendant lamps ‾‾‾‾‾╲              │
│                ┌─────────────────┐                           │
│                │ DEPARTURE BOARD │  ○17:48                   │  ← L1 / L2
│                └─────────────────┘                           │
│   ☕L5                    ▌L4▐                  gates 7-12 L6 │
│  · · · · · · · · · · · crowd · · · · · · · · · · · · · · ·   │
│         ●ELIAS →                        ← NORA○              │
│      (near plane, lower-left)      (deeper plane, right)      │
└──────────────────────────────────────────────────────────────┘
```

- **Framing:** high wide, ~28–35 mm, camera on the mezzanine on the **south** side
  looking north across the concourse. Deep-ish focus, everything legible.
- **Staging:** Elias enters bottom-left on the **near** walking plane, moving right.
  Nora is already in frame right-of-centre on a **deeper** plane, moving left.
  They are separated by roughly a third of frame width and one depth plane.
- **Camera:** near-imperceptible slow push-in over the full 5 s. No pan.
- **Read:** *two specific people, in one big room, walking toward each other's side
  of it.* Colour does the identification work — rust-orange low-left, deep-teal right.
- **Why it must be 5 s:** the audience needs time to find two small figures in a crowd
  and register both. Shorter and the wide is decorative rather than informational.

## SB-02 — THE CROSSING · 4.5 s

**Purpose:** The near miss. This is the shot the whole piece exists for.

```text
┌──────────────────────────────────────────────────────────────┐
│         ┌────────────┐                                       │
│         │ DEPT BOARD │ ○           ▌ stone column L4 ▐        │
│         └────────────┘                                       │
│              ↖ her eyeline                                   │
│           ○NORA ←   (mid-ground, ~2 m behind)                │
│                                                              │
│      ████ ELIAS ████ →  (foreground, large, crossing)         │
│      ██ looking down-right at phone ██                        │
└──────────────────────────────────────────────────────────────┘
```

- **Framing:** eye level, ~85 mm, compressed. Elias is **large in foreground**,
  Nora is a sharp-enough mid-ground figure roughly 2 metres behind him.
- **Beat structure inside the shot:**

  | t | event |
  |---|---|
  | 0.0–1.2 s | Crowd only. Nora visible mid-ground, moving right→left, looking up-left at the board. |
  | 1.2–2.6 s | Elias enters frame-left in foreground, moving right. He briefly **occludes** Nora. |
  | 2.6–3.2 s | **The beat.** Both in frame simultaneously, closest proximity. His eyeline is down-right at his phone; hers is up-left at the board. Sightlines cross without meeting. |
  | 3.2–4.5 s | Elias clears frame-right. Nora continues left, unaware. Crowd closes the gap. |

- **Camera:** locked off. Any movement here would editorialise; the camera must not
  appear to know something the characters don't.
- **Eyeline construction (non-negotiable):** his gaze **down-and-right**, hers
  **up-and-left**. Near-perpendicular and diverging. Neither look could physically land
  on the other even by accident.
- **Read:** *they were right there.*

## SB-03 — THE GLANCE BACK · 4.0 s

**Purpose:** Give the miss an emotional cost, without stating one.

```text
┌──────────────────────────────────────────────────────────────┐
│      ┌────────────┐                                          │
│      │ DEPT BOARD │ ○              ☕ L5 warm pool            │
│      └────────────┘                                          │
│                                                              │
│           ○NORA ←   ...slows...  ↻ glances back over          │
│                                    her right shoulder ──→     │
│         (behind her: only anonymous crowd. No rust-orange.)   │
└──────────────────────────────────────────────────────────────┘
```

- **Framing:** ~50 mm medium, camera trailing slightly behind and to Nora's left.
- **Beat structure inside the shot:**

  | t | event |
  |---|---|
  | 0.0–1.3 s | Nora continues right→left through the crowd. Ordinary. |
  | 1.3–2.0 s | She slows. Head begins to turn back over her **right** shoulder. |
  | 2.0–3.0 s | She looks **screen-right** — the exact direction Elias travelled. Background behind her holds **only anonymous grey/charcoal crowd**. No rust-orange anywhere in frame. |
  | 3.0–4.0 s | A small, unresolved expression — not a smile, not a frown. She turns forward and walks on, leaving frame left. |

- **Camera:** very slight tracking with her, settling to near-static on the turn.
- **The mechanism:** the audience knows what she is looking for. She does not. The
  absence of rust-orange in the background is the payload of the shot, and it only
  works because SH01 and SH02 taught the audience to search for that colour.
- **Read:** *she almost knew.*

---

## Sequence logic — why this reads without dialogue

| Beat | What the audience learns | How |
|---|---|---|
| SB-01 | Two specific people exist in one place | Colour separation against a muted crowd; shared landmarks L1/L2/L3 |
| SB-01 | They are converging | Opposing screen vectors on a shared axis |
| SB-02 | They were within touching distance | Foreground/background depth stack in a single unbroken frame |
| SB-02 | Neither noticed | Diverging eyelines, constructed to be physically non-intersecting |
| SB-03 | One of them half-felt it | Delayed glance back, in the correct direction |
| SB-03 | It is over | The colour the audience is now trained to look for is absent |

## Rejected alternatives

- **Cutting between two singles at the crossing.** Cheaper to generate, but it would
  ask the audience to *trust* the proximity rather than *see* it. Keeping both bodies
  in one unbroken frame is the entire evidentiary basis of the story.
- **Having Elias also glance back.** Symmetrical and much weaker — a mutual near-miss
  reads as coincidence comedy. One-sided keeps it melancholy.
- **A fourth shot of an empty concourse.** Tempting, and it would push to ~16 s. Out
  of the duration window, and SB-03's ending already carries the emptiness.
