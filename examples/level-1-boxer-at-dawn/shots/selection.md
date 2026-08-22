# Shot Selection

All candidates were generated image-to-video from the approved reference frame
`../reference/SELECTED_reference_frame.jpg`, 16:9, 1080p, 6s target.

Evidence sheets are in `../eval/` (`full_*.png` = 0.25s timeline, `dense_*.png` = 10fps
through a punch, `sheet_*.png` = 0.5s timeline).

## Candidates

| ID | Model | Prompt | Duration / fps | Luma drift (YAVG) | Verdict |
|----|-------|--------|----------------|-------------------|---------|
| A | `minimax/hailuo-2.3` | v2 | 5.875s / 24 | 56.8 → 73.4 (range 16.6) | reject |
| B | `wan-video/wan-2.7-i2v` | v2 | 6.037s / 30 | 52.6 → 58.7 (range 6.1) | runner-up |
| C | `google/veo-3.1` | v2 | 6.000s / 24 | 57.4 → 70.6 (range 13.2) | reject |
| D | `wan-video/wan-2.7-i2v` | v3 | 6.037s / 30 | 51.1 → 59.8 (range 8.7) | **SELECTED** |

Reference-frame YAVG for comparison: **50.1**. Lower drift = the shot holds the approved
low-key dawn exposure instead of brightening into daylight.

### A — `minimax/hailuo-2.3`, prompt v2 — reject

Framing collapses. The camera arcs left and the boxer rotates behind the bag; by 5.0s the
shot has become a rear view of his back with the bag filling the centre. Background brightens
steadily to bright blue daylight windows (largest luma drift of the four), and a dark notice
board with text-like markings enters frame at 4.0s. Anatomy is fine, but the shot no longer
matches the approved framing, lighting or "no signage" direction.

### B — `wan-video/wan-2.7-i2v`, prompt v2 — runner-up

The best-behaved candidate on everything except pacing. Framing holds exactly — boxer left,
bag on the right edge, feet out of frame, from first frame to last. Lighting holds (tightest
luma range of all four). Background stays dark bare concrete with no added clutter, flares or
signage. The one punch it does throw lands properly and visibly dents the leather.

Rejected on pacing: roughly 3.5s of the 6s is spent idling in a static guard (1.0s–3.0s and
4.75s–5.75s), which is too passive for a sports-action shot. Diagnosed as a shot-instruction
failure, not a model failure — so the fix was applied to the prompt, not the model.

### C — `google/veo-3.1`, prompt v2 — reject

Best punch mechanics of the v2 batch: clear ground-up kinetic chain, five or six landed
strikes, strong torso rotation, and exactly 6.000s at 24fps out of the box.

Rejected on two regressions against the approved direction. A blown-out white practical lamp
appears at frame right from 2.25s and stays for the rest of the shot, flattening the low-key
look; and the framing drifts right so that by 3.0s the bag has moved to centre-left with a
large bright empty area on the right, losing the approved composition. It also adds a
wall-mounted rack to the background. Motion volume did not outweigh losing the two things the
brief ranks highest after motion: dramatic lighting and clean composition.

### D — `wan-video/wan-2.7-i2v`, prompt v3 — SELECTED

Prompt v3 kept every constraint from v2 and added an explicit pacing block ("he never stops
working", three evenly spaced landed punches, one roughly every two seconds) plus
`standing still, idle, static pose, holding guard without punching` in the negative prompt,
and relaxed the camera note from "barely perceptible" to "slow, continuous, gentle push-in".

Result: B's discipline with the action B was missing.

- Five landed strikes distributed across the full 6s with no dead stretch
- Framing holds throughout — boxer left, bag on the right edge, medium shot, feet out
- Lighting holds: YAVG 51.1–59.8 against a 50.1 reference, no blowout, no flare, no lamp
- Background stays bare dark concrete, no clutter, no signage, no second person
- Bag visibly compresses under the glove on contact (clearest at 2.3–2.5s and 3.3–3.5s) and
  swings back on its chain between strikes
- Anatomy holds through the fastest frames — gloves keep shape and volume, no morphing,
  no extra digits or limbs
- The push-in is present but restrained; the frame is perceptibly tighter by the end

## Retries and failures

- **`bytedance/seedance-2.0` — unusable for this shot.** Failed three times with
  `ModelError ... flagged as sensitive (E005)`, on the original prompt, on a softened
  rewrite, and at 480p. The trigger is the approved reference frame (bare-torsoed subject),
  not the wording, so no further retries were attempted. Classified as a capability failure
  and routed to other models rather than compromising the approved reference.
- **`google/imagen-4-ultra` — unusable.** Provider-side 404 from the Vertex endpoint on both
  reference-frame attempts. Replaced with `google/nano-banana-pro`.
