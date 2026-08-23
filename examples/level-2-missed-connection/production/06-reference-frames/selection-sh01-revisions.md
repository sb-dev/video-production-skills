# SH01 Reference Frame — revision history

SH01 went through three reference frames. Recording why, because the reason is the useful part.

| Version | File | Fate |
|---|---|---|
| v1 | `selected/SH01-wide.jpg` | superseded as the shot's target — **retained** as the environment lock for SH02 and SH03 |
| v2 | `selected/SH01-establish.jpg` | superseded |
| v3 | `selected/SH01-establish-v2.jpg` | **final** — source of the delivered SH01 |

## v1 → v2: the leads could not survive generation

`SH01-wide.jpg` is a true high wide from the mezzanine. As a still it is the best image of
the three — it establishes the hall completely.

Animated, it failed. Nora's deep-teal overcoat **desaturated to near-black** and she became
unfindable in the crowd. At that scale she occupied a few dozen pixels; no prompt wording
can hold a protected colour through generation at that size.

Corrected at the reference-frame level rather than by re-prompting: same camera side, same
geography, same landmarks, longer lens, so Elias stands ~⅓ of frame height and Nora ~¼.

**v1 was not discarded.** It remains the approved environment lock, and SH02's and SH03's
reference frames are both conditioned on it. That is what keeps all three shots in one
building even though SH01's own frame changed twice afterwards.

## v2 → v3: legible ≠ established

v2 fixed the colour. It did not fix the story.

Two independent blind-comprehension tests on cuts built from v2 — one with the wide at
2.4 s, one at the full 5.04 s — both came back describing shot 1 as "numerous people walking
in various directions" with **neither lead mentioned**, and both read the film as a study of
loneliness rather than a missed encounter.

That is the distinction v2 missed: the leads were *visible* but not *established*. A viewer
could have found them if told to look; nothing made them protagonists.

Corrected by moving the camera in properly — v3 is a **medium-wide** at roughly chest height
on a 50 mm lens. Elias occupies about half the frame height in the left third, Nora about
two fifths in the right third, with a wide stretch of open floor between them. Both faces
are legible. The hall still reads: arched roof, departure board and clock, kiosk at frame
left, stone column centre-right.

This still satisfies the brief's "wide shot establishing both characters moving through
different parts of the same station" — they are on opposite sides of a large hall — while
making "establishing both characters" literally true.

The next blind test returned *"a missed connection… between two strangers."*

## Rejected alternative: first/last-frame conditioning

Before the medium-wide, an end frame was generated (`candidates/sh01-endframe.jpg`) to force
the traversal by interpolation. The model returned both leads at essentially their starting
positions, so there was no displacement to interpolate between. Abandoned after one attempt
rather than iterated — it was solving the wrong problem. The issue was never that the model
could not interpolate; it was that the shot was too wide.

## Candidate rejected at v3

`sh01-med-b` was rejected outright on **identity failure**: Nora regenerated as a
light-skinned woman with straight brown hair, bearing no resemblance to the approved
character reference. It also rendered legible "COFFEE KIOSK" signage, against the visual
direction's no-readable-text constraint.
