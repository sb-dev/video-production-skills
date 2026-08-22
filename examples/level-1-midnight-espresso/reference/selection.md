# Reference-frame selection

**Decision:** selected → approved
**Selected:** `ref_nbpro_a.jpg` (google/nano-banana-pro)
**Promoted to:** `SELECTED_reference_frame.jpg` (conformed to exact 16:9, 2560×1440)
**Parent:** `direction/visual-direction.md`

## Candidates

| ID | Model | Native size | Verdict |
|----|-------|-------------|---------|
| A `ref_seedream_a` | bytedance/seedream-4.5 | 2560×1440 | rejected |
| B `ref_seedream_b` | bytedance/seedream-4.5 (composition variant) | 2560×1440 | rejected |
| **C `ref_nbpro_a`** | google/nano-banana-pro | 2752×1536 | **selected** |

A fourth candidate (`google/imagen-4-ultra`) was dropped before submission: the
account is under Replicate's low-credit throttle (6 predictions/min, burst 1)
and three candidates already resolved the composition decision. Spending the
remaining credit on video candidates was the better trade.

## Scoring against the direction's ranked targets

| Target | A | B | C |
|--------|---|---|---|
| Appetising crema texture | drawn-looking spiral | drawn-looking spiral | **best — natural marbled mottle** |
| Believable liquid flow | good, dark streams | good, thickest streams | good — thinner, lighter streams |
| Visible steam | **weakest** — thin wisps | strong column | **best** — tall, soft, clearly backlit |
| Warm commercial lighting | **strongest** — hard amber rim | strong | moderate — softer, more ambient |
| Premium material detail | strong chrome + beading | strong | **best — cleanest, most photographic** |

## Why C

**It is the only candidate that looks photographed rather than generated.** A
and B are both handsome, but both carry the same tell: the crema swirl is a
crisp, high-contrast spiral that reads as drawn on top of the surface rather
than as coffee. In a food commercial that is the thing that breaks the spell —
the brief's number-one optimisation target is *appetising texture*, and texture
has to look like it obeys physics. C's crema is genuine marbled mottle with
irregular bubble clusters and soft tonal transitions. It is the most appetising
of the three and by a clear margin the most believable.

**Steam.** C has the largest and most legible steam column, rising in a soft
naturalistic plume rather than the thin wisps of A. Steam is the most fragile
element in this shot — it is the first thing to disappear once a still is
animated — so starting from the candidate with the most steam headroom is the
safest input to the video stage.

**Simplicity.** The direction asks for "clean tabletop setup, visually simple,
no clutter." A fills its right third with drip tray, machine body and grate;
that is a lot of hard-edged background geometry for a video model to hold stable
under a camera move, and morphing background hardware is a common i2v failure.
C holds the frame down to portafilter, cup, tabletop and darkness.

**Material honesty.** C's ceramic reads as real glazed stoneware with a soft
specular roll-off, and the portafilter's brushed and polished surfaces are
distinguishable from each other. It is the most convincing product photography
of the three.

## Known weaknesses carried forward

These are accepted, and are the things to watch when evaluating the video
candidates.

1. **Cup is near the brim.** Less headroom than A or B, so the motion contract's
   "liquid level visibly higher" beat has to stay very subtle. `overflowing cup`
   is in the video negative prompt for this reason, and the video prompt asks
   for a level that "rises slowly and only slightly."
2. **Streams are pale caramel rather than dark espresso.** The video prompt
   describes the streams as "dark-amber" and "glossy" to pull the pour back
   toward a richer espresso read.
3. **Lighting is softer and more ambient than the direction's hard backlight.**
   The steam is still clearly separated from the dark background, which is the
   functional requirement, but this is less dramatic than A. Accepted rather
   than corrected: the natural crema and the steam column are worth more than
   the rim-light drama.
4. **Aspect.** Native 2752×1536 is 1.792:1, not exactly 16:9. Conformed by a
   centre crop to 2730×1536 then a Lanczos scale to 2560×1440. Deterministic,
   no generative step. `SELECTED_reference_frame.jpg` is the conformed file and
   is exactly what was fed to the video models.
