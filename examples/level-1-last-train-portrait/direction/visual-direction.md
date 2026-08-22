# Visual Direction — "Last Train Portrait"

**Artifact:** visual-direction
**Lifecycle:** final
**Decision:** approved
**Production policy:** balanced
**Deliverable:** single shot, 6.0s, 16:9, no dialogue

---

## Intent

One unbroken take of a woman waiting alone on a train platform at night in light
rain. A train passes behind her; she turns her head toward camera. Nothing else
happens.

The shot has to earn its melancholy through *stillness*, not through performance.
She is not sad at the camera — she is somewhere else, and the turn is the small
involuntary movement of someone pulled back into the present. Intimate, restrained,
emotionally grounded.

The technical thesis: **a small, well-observed movement in a rich environment reads
as more human than a large one.** Everything expensive in this shot — the rain, the
reflections, the passing train — lives in the environment. The performance stays
tiny.

## Subject

- **One woman**, late twenties to thirties, alone in frame. No other people on the
  platform.
- **Wardrobe:** dark charcoal or black wool overcoat, collar up, worn open or
  loosely belted. Simple, unbranded, slightly oversized — real outerwear, not
  styling.
- **Hair:** shoulder-length dark hair, damp at the ends, a few strands stuck to
  the cheek and temple. Damp hair is what sells "she has been standing here a
  while."
- **Face:** natural skin, visible pores and faint under-eye shadow, no glamour
  retouch. Neutral, inward expression — lips closed, no smile, no scowl. Eyes
  soft-focused on nothing until the turn.
- **Believable human proportions.** Correct hand and finger anatomy if hands are
  visible; prefer hands in pockets or out of frame.

## Camera

- **Framing:** medium close-up, roughly chest-up. She sits in the left-of-centre
  third, facing camera-right, with the platform and the passing train opening up
  in the right two-thirds. Head near the upper third line; canopy edge or a
  structural beam cropping the top of frame.
- **Start pose:** three-quarter profile turned *away* from camera by roughly 45°,
  so the face is already legible — cheekbone, brow, jawline and one eye readable.
  This is a deliberate identity decision, not a compositional one (see below).
- **Move:** one continuous slow push-in on the long axis. Very slight — a 3–5%
  creep over six seconds, dolly-smooth. No handheld, no orbit, no rack-focus
  stunt, no whip.
- **Lens:** 50mm or 85mm equivalent, shot near wide open. Shallow depth of field
  with the focus plane on her eyes; the platform, canopy columns and train fall
  progressively soft behind her.
- Eye-level, or a hair below. Never look down at her.

## Lighting

- Night, low-key, **practical-motivated only.** Every source in frame should have
  a plausible fixture behind it.
- **Key:** a warm sodium/tungsten platform lamp above and behind camera-right,
  raking across her face at roughly three-quarter angle. It should model the
  cheekbone and leave the far side of the face in soft shadow — contrast, but
  never a hard split.
- **Rim/back:** cool white canopy fluorescents and the train's lit windows behind
  her, putting a cool edge on hair, shoulder and coat collar. This cool rim
  against the warm key is the shot's entire colour idea and is what separates her
  from the background.
- **Bounce:** the wet platform itself. Soft warm uplight from the reflected lamps,
  very low intensity, just enough to keep the underside of the jaw from going
  black.
- **Grade:** desaturated, teal-and-sodium. Deep but *open* shadows — night, not
  crushed. Subtle contrast. Fine film grain, mild halation on the practicals.

## Environment

- Covered station platform at night. Concrete or asphalt platform surface, wet
  and reflective, with standing water holding smeared reflections of the lamps
  and the train windows.
- Canopy structure overhead: steel or cast-iron columns, a beam line, hanging
  lamps. One column may sit in the near background for depth.
- **Light rain**, falling outside the canopy line and drifting under it — visible
  as fine streaks against the backlight and as a light dew on her coat shoulders
  and hair. Rain, not downpour. It must be legible in the backlight and invisible
  in the shadows, which is how real rain behaves.
- **A train passing behind her** on the far track: lit windows and body panels
  smearing horizontally, motion-blurred, already in motion at frame one. It
  provides the shot's background rhythm and its cool rim light.
- No readable text: no station signage, destination boards, timetables,
  advertising, or train livery text.

## Motion contract (what must actually happen in 6s)

| Time | Beat |
|------|------|
| 0.0–1.5s | She is still, three-quarter away, gaze off-frame. Train already passing behind — lit windows streaking. Rain falling. Camera begins its creep. |
| 1.5–3.5s | The turn: head rotates toward camera, chin leading slightly, shoulders following a beat late. Hair shifts and settles. One slow blink lands during or just after the turn. |
| 3.5–6.0s | She holds, now near three-quarter *toward* camera, eyeline just off-lens. Micro-settle of the head. Train's tail passes; the streaking behind her thins out. Camera still creeping. |

Two things are deliberately continuous rather than triggered: **the train is
already moving at frame one** and **the rain never starts or stops.** Both avoid
the most common generative failure — an element that materialises from nothing.

## Identity strategy

Identity consistency is the number-one risk in this shot, and it is decided at the
reference frame, not at the video stage.

The reference frame shows her at **three-quarter away, not full profile and not
back-of-head.** This is the load-bearing decision:

- A back-of-head or hard-profile start gives the video model no facial structure,
  so it *invents* the face during the turn. That is the classic identity failure.
- A start already facing camera leaves no turn to perform.
- Three-quarter away gives the model brow, cheekbone, nose line, jaw and one eye
  to interpolate from, while still leaving a real 45° turn to play.

The turn is therefore **small on purpose**: roughly 45° of head rotation, not 120°.
Consequently, "believable expression" is scored on micro-behaviour — the blink,
the shoulder lag, the eye settle — not on a big emotional beat.

## Optimisation targets (ranked)

1. **Identity consistency** — the same woman at 0.0s and 6.0s. Face structure,
   hair, and coat hold; no drift, no morph through the turn.
2. **Natural human motion** — the turn reads as biomechanically real: head leads,
   shoulders lag, weight stays planted, hair carries momentum and settles.
3. **Believable rain/night atmosphere** — legible rain in the backlight, genuine
   wet-surface reflections, sodium-and-teal night grade.
4. **Subject/background separation** — shallow focus plus cool rim plus the train's
   horizontal motion behind her static vertical form.
5. **Strong portrait composition** — she holds the frame; the environment supports
   and never competes.

## Negative constraints

No other people. No text, signage, destination boards, timetables, logos, livery,
watermarks, or subtitles. No umbrella. No phone. No luggage. No heavy downpour or
storm. No lightning. No cuts, transitions, dissolves, or flash frames. No camera
shake, handheld wobble, or zoom snap. No smiling to camera, no direct-to-lens
address, no acting-for-camera. No face morphing, identity drift, or age shift. No
extra or deformed hands. No warping architecture. No neon-cyberpunk grade. No lens
flare stunts. No slow-motion or speed ramps.

## Audio

Silent master. Video models are prompted with `generate_audio: false` where
supported; audio is stripped at master regardless. Sound design is out of scope
for this deliverable.

## Downstream contract

Anything produced downstream inherits: 16:9, 6.0s, single continuous take,
sodium-and-teal night grade, the subject description above, the motion contract
above, and the negative constraints above.
