# Edit — "Missed Connection"

- **lifecycleState:** final
- **decisionState:** **locked** (picture lock)
- **authoritative artifact:** `timeline.json`
- **picture lock:** `picturelock.mp4` — 12.917 s, 1920×1080, 24 fps, 310 frames, silent

`timeline.json` is the edit. The renders are outputs of it.

## Timeline

| # | Source | In | Duration | Out | Transition |
|---|---|---|---|---|---|
| 1 | `SH01-v3-conformed.mp4` (medium-wide) | 0.00 | **4.00 s** | 4.00 | hard cut |
| 2 | `SH02-conformed.mp4` (crossing) | 0.00 | **4.00 s** | 8.00 | hard cut |
| 3 | `SH03.mp4` (glance back) | 0.00 | **5.04 s** | 13.04 | out |

Rendered **12.917 s** — inside the 12–15 s window. (Frame quantisation at 24 fps trims
~0.12 s off the nominal total.)

No dissolves. Two hard cuts. A dissolve would soften the one thing the piece is about:
the abruptness of the miss.

## Progression

`assembly-v1` → `roughcut-v2` → `finecut-v3` → `finecut-v4` → `finecut-v5` → `finecut-v6` → `picturelock`

Six versions, because the edit was driven by blind-comprehension testing rather than by
taste. Each step and what the evidence said:

| Version | Change | Blind-test result |
|---|---|---|
| v1–v3 | wide trimmed to 2.4 s to cut on the convergence | **failed** — viewer tracked only one character; read as "isolation in a crowd" |
| v4 | wide restored to full 5.04 s, SH02 tail tightened | **failed** — still "a single commuter"; more duration did not make the leads register |
| v5 | **SH01 replaced** with a medium-wide (shot-level fix, not editorial) | **passed** — "a missed connection… he walks right past the woman" |
| v6 | SH01 re-executed with her eyeline pushed higher onto the board | **passed, improved** — "a missed connection… between **two strangers**" |

Full readings are in `../10-evaluation/evaluation-report.md`. The lesson worth keeping is in
v4: two failed editorial attempts established that the problem was not the cut, and that is
what justified reopening the shot.

## Cut 1 — SH01 → SH02 @ 4.00 s

Both shots are staged from the same side of the concourse with the same landmarks, and the
cut is on continuing motion in opposite directions. The blind viewer described SH01 and SH02
as a **single continuous shot** — the strongest available evidence that the geography,
grade and screen direction survive the cut intact.

SH01 runs 4.0 s of an available 5.0 s. The last second adds nothing: neither figure
translates much, so holding longer only exposes the under-translation noted in the
evaluation report.

## Cut 2 — SH02 → SH03 @ 8.00 s

SH02 is trimmed to 4.0 s. Its internal structure:

| t (shot) | beat |
|---|---|
| 0.0–0.8 | approach — both in frame, both absorbed elsewhere |
| 0.8–1.7 | **the crossing** — closest proximity, sightlines diverging |
| 1.7–2.2 | Elias clears frame-right |
| 2.2–4.0 | Nora alone, still reading the board, still unaware |

The 4.0 s out-point is chosen against two constraints. Long enough that his exit registers
and she is visibly alone; short enough that "he leaves → she turns back" stays causal. The
full 5.04 s put 3.2 s between his exit and her turn, which is too long for the brief's
"moments after"; at 4.0 s the gap is ~2.2 s and the two beats bind.

It also cuts before her walk stalls at ~2.5 s into the source take.

The cut is on continuing leftward motion in both shots, so her vector carries across
unbroken while the camera makes its westward jump (board left → board right).

## Audio

Built **once across the whole picture lock**, deliberately not per shot. Per-shot audio
would cut with picture and expose both edit points; a continuous bed does the opposite —
it binds the three shots into one space.

| Property | Value |
|---|---|
| Source | `audio/ambience-a.wav` — `stability-ai/stable-audio-2.5`, 17 s |
| Content | crowd murmur, footsteps on stone, luggage wheels, distant train, indistinct tannoy |
| Dialogue | **none** — verified two ways, see evaluation report §5 |
| Music | none |
| Bed | `audio/ambience-bed.wav` — 0.3–11.3 s region cross-faded into itself (2 s, tri/tri), trimmed to picture |
| Shaping | 0.8 s fade in, 1.2 s fade out |
| Loudness | two-pass `loudnorm` → −18.0 LUFS, −3.3 dBTP |

**Why only 0.3–11.3 s of the source is used.** The spectrogram
(`audio/ambience-a-spectrogram.png`) shows the generated atmos decaying from ~11 s and
falling near-silent by 16.5 s. Used straight, the station would have quietly emptied under
SH03 for no reason. Cross-fading the strong region into itself gives a seamless bed at
constant density across all 12.9 s.

## Conform steps

Both Kling-sourced shots arrive at **1928×1072**, not 1920×1080. The timeline renderer
scales to fit and pads, which would have letterboxed those two shots alone with 6 px bars.
Conformed instead by scaling to height and centre-cropping
(`scale=-2:1080,crop=1920:1080`, CRF 16) — full frame, no bars. The conformed files are
what the timeline references.
