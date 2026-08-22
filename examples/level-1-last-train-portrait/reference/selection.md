# Reference-frame selection

**Decision:** selected → approved
**Selected:** `ref_flux_a.jpg` (black-forest-labs/flux-2-pro)
**Promoted to:** `SELECTED_reference_frame.jpg` (conformed to exact 16:9, 1920×1080)
**Parent:** `direction/visual-direction.md`

## Candidates

| ID | Model | Native size | Verdict |
|----|-------|-------------|---------|
| A `ref_seedream_a` | bytedance/seedream-4.5 | 2560×1440 | rejected |
| B `ref_nbpro_a` | google/nano-banana-pro | 2752×1536 | rejected |
| **C `ref_flux_a`** | black-forest-labs/flux-2-pro | 1888×1072 | **selected** |

All three ran the identical prompt (`reference/prompt.txt`) — the only variable is
the model. Contact sheet: `eval/reference-contact-sheet.png`.

## Scoring against the direction's ranked targets

| Target | A | B | C |
|--------|---|---|---|
| Identity legibility (structure to interpolate from) | good | good | **best — sharpest facial structure** |
| Photorealism of skin and hair | soft, slightly smoothed | **waxy specular sheen** | **best — genuine pore and flyaway detail** |
| Rain/night atmosphere | **best — rain, puddles, lamp glow all legible** | good | good — drier read, rain in backlight only |
| Subject/background separation | strong warm/cool rim | moderate — flatter light | **strong — bright face and dark coat against the streak band** |
| Portrait composition | centred, busy background | centred, right half empty | **best — nose room, clean horizontal streak band** |
| Wardrobe fidelity to direction | **fails — coat gapes open, bare chest** | good — collar up | **best — collar up, water beading on wool** |

## Why C

**It is the only candidate that looks photographed rather than generated.** At 1:1
the difference is not subtle. A's wet hair strands are painted onto the cheek as
dark ribbons and the skin is softened; B carries a hard plastic specular sheen
across the forehead and cheekbone that reads as a CG sculpt. C has real skin — pore
structure, an actual earring, individual water droplets caught on the wool of the
coat, flyaway hairs with water beading on them. In a shot whose entire brief is
"emotionally grounded," the face has to survive being looked at, and only C's does.

**Wardrobe.** A is disqualified on its own terms: the coat hangs open on a bare
chest in the rain. That is both implausible for the scene and a production risk —
a large area of exposed skin next to a soft-edged collar is exactly the kind of
boundary image-to-video models smear. C has the collar turned up as the direction
specifies, with the wool weave and the beaded water reading clearly.

**Background motion legibility.** This is the one place C looks weaker on a still
and is actually stronger for video. A renders the passing train as detailed lit
windows and body panels; that is a lot of hard-edged, semantically loaded geometry
for an i2v model to keep coherent while it also animates a face, and morphing
background hardware is a common failure. C renders the train as a band of
horizontal light streaks — which is what a passing express actually looks like at
this shutter speed, and which animates as pure lateral smear with nothing to morph.
The direction ranks background motion below identity and human motion; C makes the
right trade.

**Composition.** C is the only frame where she is genuinely composed rather than
centred. She sits right of centre with nose room to camera-left, the streak band
cuts the frame horizontally behind her head, the warm platform lamp anchors the
upper right, and the wet platform falls away lower-right. Her static vertical form
against a horizontal motion band is the shot's whole separation idea, already
present in the still.

## Accepted deviation from the direction

The direction specifies her left-of-centre facing camera-right. **C is mirrored:**
she is right-of-centre facing camera-left. This is a horizontal flip of the
described staging, not a change to it — every functional requirement (three-quarter
head turn away from lens, nose room into the empty side, train behind, canopy
overhead, practical key plus cool rim) is met. Accepted as-is rather than
regenerating; the downstream contract is updated to read camera-left.

## Known weaknesses carried forward

These are accepted, and are what to watch when evaluating the video candidates.

1. **Lips slightly parted.** Reads a touch vacant on a still. In motion this is
   fine — and the motion contract's blink lands on top of it — but if a candidate
   holds the parted mouth frozen for six seconds it will read as dead.
2. **Rain is legible only against the backlight**, and the platform is damp rather
   than pooled. The video prompt therefore asks explicitly for continuously falling
   rain streaks, so the atmosphere does not quietly drop out once animated.
3. **Lower native resolution.** 1888×1072 (2.0 MP) against 3.7 MP and 4.2 MP for A
   and B. Conformed by a centre crop to 1888×1062 (10 px off the top, which is dead
   canopy) then a Lanczos scale to 1920×1080 — a 1.7% upscale. Deterministic, no
   generative step. `SELECTED_reference_frame.jpg` is the conformed file and is
   exactly what was fed to the video models.
4. **Head is already turned a little further toward camera than the direction's
   45°** — closer to 50–55° off-lens. The available turn is therefore slightly
   smaller than planned. Given that identity is the top-ranked target and a smaller
   turn is a safer turn, this is accepted rather than corrected.
