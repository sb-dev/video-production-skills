# Evaluation — Last Train Portrait

**Artifact:** `last-train-portrait-master.mp4`
**Artifact type:** video master (single shot)
**Lifecycle:** final
**Parents:** `direction/visual-direction.md` → `reference/SELECTED_reference_frame.jpg` → `shots/SELECTED_final_shot.mp4`
**Verdict:** **accept**

Creative and production judgement only. Technical validity is in `qc-report.md`
(verdict: pass).

---

## Summary

The master delivers the briefed shot. A woman alone under a station canopy at
night in light rain turns toward camera while a train passes behind her; the
camera creeps in almost imperceptibly; nothing else happens. It is intimate,
restrained and photographically convincing, and it holds the same woman from the
first frame to the last — which was the production's top-ranked and hardest
target.

The two things worth knowing before watching it: the camera move is at the very
quiet end of what was specified, and the background train decelerates rather than
passing at constant speed. Both are examined below. Neither is a defect that a
regeneration would fix without costing something more valuable.

## Brief compliance

| Brief requirement | Result |
|---|---|
| Duration 6 seconds | 6.000 s exactly |
| Format 16:9 | 1920×1080, SAR 1:1 |
| Tone: cinematic, urban, slightly melancholic | met — quiet, unresolved, no performed sadness |
| Subject: one woman, dark coat, believable proportions | met — one figure, charcoal wool coat, collar up, anatomy holds |
| Camera: restrained slow push-in or gentle lateral move | met, at the restrained extreme — see below |
| Lighting: practicals, wet reflections, subtle contrast | met — sodium lamp key, cool rim, standing-water reflections |
| Environment: night platform, light rain, passing train | met |
| Motion: head/body turn, natural clothing and hair, moving train | met |
| Identity consistency, believable expression, atmospheric realism | met — strongest attribute of the selected take |

## Against the direction's ranked optimisation targets

### 1. Identity consistency — strong

Sampled at twelve points across the six seconds (`eval/dense_candD_veo.png`), the
brow ridge, nose bridge, jawline, mouth shape, hairline, single visible earring and
coat collar are consistent throughout and consistent with the approved reference
frame. `eval/ref-vs-first-frame.png` shows the reference frame against the master's
first frame: the i2v conditioning held essentially exactly, including the water
beading on the coat shoulder and the flyaway hairs.

This is where the production was won, and it was won upstream. The reference frame
deliberately started her at three-quarter *away* rather than in profile or from
behind, so the video model had real facial structure to interpolate through the
turn rather than having to invent a face. Three of the four surviving candidates
still drifted; the one that did not is the one selected. See `reference/selection.md`
for the reasoning and `shots/selection.md` for how the candidates compared.

### 2. Natural human motion — strong

The turn runs roughly 0.6–2.0 s. The chin leads, the head rotates smoothly through
about forty-five degrees, the shoulders follow a beat late and only slightly, and
the damp hair carries momentum and settles against the collar. Her feet and body
position never move. A downward glance and blink land around 4.2 s, which is what
keeps the remaining hold alive.

Nothing in the motion reads as generated: no rubber-necking, no sliding weight, no
hands appearing, no clothing that moves independently of the body.

The one honest criticism is scheduling rather than quality. The contract placed the
turn at 1.5–3.5 s; it completes at ~2.0 s, leaving roughly four seconds of hold.
The hold is carried — by the blink, by a micro-settle, and by the background
resolving behind her — but it is more hold than was planned for, and a second turn
beat or a later start would have used the six seconds harder.

### 3. Rain / night atmosphere — strong

Rain is continuously legible against the darker upper frame for the full duration
and never starts, stops or thickens. Standing water on the platform holds smeared
reflections of the lamp and the train windows throughout. The sodium-and-teal grade
is intact, shadows are deep but open rather than crushed, and the practical lamp
carries mild halation as specified. It reads as a photographed night, not a graded
one.

### 4. Subject/background separation — strong

The separation idea survives intact from the reference frame: her static vertical
form against a horizontal band of moving light, shallow focus holding her eyes
sharp while the platform, canopy column and train stay soft, and a cool rim on hair
and collar against the warm key. She never competes with the background and the
background never competes with her.

### 5. Portrait composition — strong

She holds right-of-centre with nose room to camera-left for the whole shot. The
canopy beam crops the top, the lamp anchors the upper right, and the platform falls
away lower-right. The composition established at the reference frame is still the
composition at 6.0 s — which, given that the camera is moving, is the point.

Note the accepted mirror: the direction described her left-of-centre facing
camera-right, and the selected reference frame is the horizontal flip of that.
Every functional requirement is met; only the handedness differs.

## Negative-constraint audit

| Constraint | Result |
|---|---|
| No other people | clean |
| No text, signage, boards, logos, livery, watermark, subtitles | clean — no readable text anywhere in frame |
| No umbrella, phone, luggage | clean |
| No smiling, no direct-to-lens address, no acting for camera | clean — expression stays inward throughout |
| No speaking | clean — mouth stays closed |
| No cuts or transitions | clean — 0 scene changes detected |
| No camera shake, wobble, zoom snap | clean |
| No face morph, identity drift, age shift | clean |
| No extra or deformed hands | clean — hands stay out of frame |
| No warping architecture | clean — canopy column and beam hold |
| No heavy rain, storm, lightning | clean |
| No lens flare, slow motion, speed ramp | clean |

Rejected candidates B and C each violated the smiling/speaking constraints
explicitly; this is a large part of why they were rejected.

## Deviations, with reasoning

**The train decelerates.** The motion contract asked for constant-speed streaking.
The selected take opens on a hard horizontal streak, resolves into readable
carriages by ~1.8 s, and continues moving slowly but visibly to the end. It never
stops and never reverses, so no element materialises or vanishes.

Accepted, for three reasons. It is physically coherent — this is exactly what a
train braking into a platform looks like. It is dramatically better than what was
specified: the background resolving as she turns gives the six seconds a shape they
would not otherwise have, and it suits a shot called *Last Train Portrait*.
And fixing it would mean re-rolling the only candidate that holds identity, trading
the first-ranked target for the fourth. That is what ranking targets is for.

Measured side effect: mean luma rises slightly as the lit carriages resolve, but
stays inside 62.8–69.9 with no step change (`qc-report.md`). Motivated light, not
an exposure shift.

**The push-in is very subtle** — at or below the specified 3–5% creep. First and
last frames differ only slightly in scale. On a small screen it may read as
locked-off. Accepted: every candidate that moved the camera more also drifted more,
in identity, composition or both. An under-moving camera is a much cheaper defect
than an over-moving one, and it does not read as an error, only as restraint.

**Her eyeline passes close to the lens** at ~2.4 s and ~4.8 s. It stops short of
direct address and the constraint is not violated, but it is nearer than the
"eyes settling just off the lens" the direction asked for.

## What the production run actually cost

One reference-frame round of three candidates from three different models; one shot
round of five submissions, of which four returned usable video. No refinement pass
and no re-roll was needed at any stage, because both selection decisions had enough
spread to resolve cleanly on the first round.

The one failure was a provider content filter, not a production failure: Seedance
2.0 rejected the input as sensitive in 3.2 s. That was diagnosed as a capability
failure and answered by substituting a compatible model, not by softening the
prompt or re-running the same request. See `shots/selection.md`.

## Corrective action

**Accept.** No layer owns a failure worth correcting.

If a future revision were wanted, the smallest useful unit to change would be the
**shot instructions**, not the reference frame and not the shot plan: asking for the
turn to begin later, and for a second, smaller settle beat near 4.5 s, would spend
the held four seconds better. That is a refinement of an accepted take, not a
regeneration — and it would be worth doing only if the hold is judged to be a
problem in context. On its own terms, the take works.
