# Evaluation report — Midnight Espresso

**Artifact under evaluation:** `midnight-espresso-master.mp4`
**Lineage:** `direction/visual-direction.md` → `reference/SELECTED_reference_frame.jpg`
(google/nano-banana-pro) → `shots/candC_wan.mp4` (wan-video/wan-2.7-i2v) → master
**Verdict:** **approved for delivery**, with one known limitation recorded below.

---

## 1. Food appeal

**Strong.** The crema is the best of anything produced in this run: irregular
marbled mottle, dense fine bubble clusters forming and drifting where the
streams land, and a glossy wet surface that catches the warm key. It reads as
coffee that obeys physics rather than a texture painted onto a disc — which was
the specific failure mode that eliminated two of the three reference-frame
candidates.

The warm amber palette holds throughout with no cool contamination (chroma
V 120–178, biased warm across every frame). The ceramic reads as real glazed
stoneware and the chrome portafilter holds distinguishable brushed and polished
regions with warm specular roll-off.

## 2. Liquid realism

**Strong.** The two streams are continuous from frame 1 to frame 180 — they
never start, stop, sputter, break, or spawn a third spout, which were the named
risks. Gauge stays consistent, the fall reads at a plausible speed, and the
surface interaction is genuine: the streams visibly disturb the crema rather
than passing through a static surface.

The near-brim fill level inherited from the reference frame was the main risk
carried into this stage. It did not bite — the level rises only slightly and the
cup never overflows.

## 3. Steam visibility

**Strong — the decisive dimension in candidate selection.** A large, clearly
legible plume rises left of the streams and persists for the full six seconds,
separated from the dark background by the warm backlight.

This is worth stating plainly because it is where the alternatives failed. The
smoothest candidate by a wide margin (`candB_hailuo`) had essentially no visible
steam at any point, and was rejected for that reason despite better motion
numbers. Steam is named four times in the brief; a shot without it is not the
requested shot. See `shots/selection.md` for the full comparison.

## 4. Motion quality

**Acceptable, and the weakest dimension.** The camera performs a genuine dolly
with a slight push-in, easing in and settling — the composition holds throughout
and the portafilter spouts are never cropped.

However, the shot carries a measurable per-frame shimmer: 18% of frames show a
frame-to-frame jerk above half the mean motion (roughly 5 events/second),
against 1.4% for the rejected `candB_hailuo`. In a slow premium macro shot this
is perceptible as a faint texture crawl.

This is temporal inconsistency in the generated pixels, not camera-path jitter.
It was confirmed unfixable in post: `vidstabtransform` recovered only 1.2 points
(25.3% → 24.1%) at the cost of a crop and resample, and two strengths of
temporal denoise made it measurably *worse* (→ 34%). All three were rejected and
no cosmetic filtering was applied to the master.

**Accepted** as the cost of the only candidate that satisfies the steam
requirement.

## 5. Direction compliance

| Requirement | Status |
|---|---|
| Duration 6 seconds | ✅ exactly 6.000s |
| 16:9 | ✅ 1920×1080, exact |
| Espresso machine, flowing espresso, ceramic cup, rising steam | ✅ all four present |
| Slow side move or slight push-in | ✅ dolly with slight push-in |
| Warm, moody, backlit enough to reveal steam | ✅ steam clearly separated |
| Coffee texture, crema, ceramic, metallic detail | ✅ all legible |
| Clean tabletop, visually simple, no clutter | ✅ portafilter, cup, table, darkness |
| Smooth pour, visible steam, natural liquid movement | ✅ / ✅ / ✅ |
| No hands, people, text, logos, subtitles | ✅ none present |
| No cuts | ✅ zero scene changes detected |

### Accepted deviations

1. **Brightness ramps upward.** Frame average rises smoothly from 62 to 93 over
   the six seconds as the camera pushes toward the cup and a warm practical
   grows in the upper left. The direction asked for constant lighting. This is a
   smooth ramp and not flicker — the largest single-frame change is 0.75 of 255,
   about 1% — and it reads as the camera moving into the light, building toward
   a brighter hero end frame. Kept as an improvement rather than corrected.
2. **A warm practical appears upper-left** that was not in the reference frame.
   It functions as the backlight that makes the steam legible, so it earns its
   place.
3. **30fps rather than 24.** Native output of the selected model. Preserved
   rather than resampled to 24, because converting would have introduced
   duplicate or interpolated frames into a shot already carrying temporal
   shimmer. No fps was specified in the brief.
4. **Softer, more ambient key than the direction's hard rim light.** Inherited
   from the selected reference frame and accepted there; see
   `reference/selection.md`.

## Optimisation targets, scored

| Target | Result |
|---|---|
| Appetising texture | **strong** — best crema of the run |
| Believable liquid flow | **strong** — continuous, correct interaction |
| Visible steam | **strong** — legible for the full duration |
| Warm commercial lighting | **strong** — warm across every frame, no cool cast |
| Premium material detail | **strong** — ceramic and chrome both convincing |

Four of five are unqualified passes and the fifth, motion quality, is the single
recorded limitation. Technical QC is in `qc-report.md`.
