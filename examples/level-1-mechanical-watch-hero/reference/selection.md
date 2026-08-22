# Reference-frame selection

**Decision:** selected → approved
**Selected:** `ref_seedream_b.jpg` (bytedance/seedream-4)
**Promoted to:** `SELECTED_reference_frame.jpg` (byte-identical copy — no conform needed)
**Parent:** `direction/visual-direction.md`

## Candidates

| ID | Model | Seed / variant | Native size | Verdict |
|----|-------|----------------|-------------|---------|
| A `ref_101` | black-forest-labs/flux-1.1-pro-ultra | seed 101, `raw: true` | 2752×1536 | rejected |
| B `ref_202` | black-forest-labs/flux-1.1-pro-ultra | seed 202, `raw: true` | 2752×1536 | rejected |
| C `ref_303` | black-forest-labs/flux-1.1-pro-ultra | seed 303, `raw: true` | 2752×1536 | rejected |
| D `ref_404` | black-forest-labs/flux-1.1-pro-ultra | seed 404, `raw: true` | 2752×1536 | rejected |
| E `ref_seedream_a` | bytedance/seedream-4 | variant a, 2K | 2560×1440 | rejected |
| **F `ref_seedream_b`** | bytedance/seedream-4 | variant b, 2K | 2560×1440 | **selected** |
| — `pred_imagen_a` | google/imagen-4-ultra | 2K | — | **failed** — provider 404 |
| — `pred_imagen_b` | google/imagen-4-ultra | 2K | — | **failed** — 429 |

All six returned candidates ran the identical prompt (`reference/prompt.txt`); the variables
are the model and the seed. Contact sheet: `eval/reference-contact-sheet.png`.

Neither `imagen-4-ultra` attempt produced an image. `pred_imagen_a.json` records a
provider-side `HTTPStatusError: Client error '404 Not Found'` against the Vertex endpoint —
a broken model route, not a rejected request. `pred_imagen_b.json` is a bare `429`. Both
are infrastructure failures with nothing to learn from and nothing to fix in the prompt, so
the run continued on the two models that were answering.

## The constraint that decided it

The reference prompt ends with an unusually explicit instruction, and it is the reason it
is written that way:

> The dial is completely plain and unbranded: no logo, no wordmark, no text, no numerals,
> no lettering of any kind anywhere on the dial, bezel, crown, or strap — only clean applied
> indices (thin rectangular batons) and bare hands.

This is not brand caution. Text is the single worst thing to hand an image-to-video model.
It has no idea what the letters say, so it re-invents them every frame; a wordmark that is
merely *illegible* on a still becomes *visibly crawling* over six seconds, and on a macro
push-in it grows while it crawls. The dial is the one part of frame that must survive being
looked at, so it was specified as bare.

**All four flux candidates render invented brand text on the dial anyway** — two lines of
garbled lettering under the 12, plus more at 6 on D. That is a failure against an explicit,
load-bearing constraint, and it disqualifies the whole flux set before any question of taste.

## Scoring against the direction's success criteria

| Criterion | A (101) | B (202) | C (303) | D (404) | E (sd a) | F (sd b) |
|---|---|---|---|---|---|---|
| Unbranded dial (hard constraint) | **fails — text** | **fails — text** | **fails — text** | **fails — text** | passes | **passes** |
| Dial legibility at macro scale | poor — subject small | good | moderate | good | good | **best** |
| Strap texture visible (direction requires) | barely, dark | good — grain + stitch | moderate | good | **fails — steel bracelet** | **best — croc grain + stitching** |
| Composition survives a push-in | subject small, low | good | **fails — subject on right edge** | good | off-centre left | **best — centred, macro scale** |
| Near-black unobtrusive background | good | weak — bright glow | weak — bright wedge dominates | moderate — hard slab edge | moderate | **best** |
| Cool-neutral, no warm cast | good | good | good | **fails — red seconds hand** | good | good |
| Controlled specular (not clipped) | good | moderate | poor — blown wedge | moderate | poor — blown beam | moderate — streak clips |

## Why F

**It is the only candidate that is simultaneously legal and photographic.** E is the only
other one that clears the unbranded-dial constraint, and E puts the watch on a **steel
bracelet** — the direction asks for a strap with visible texture, "leather grain or rubber
ribbing," precisely because a textured strap is what sells material fidelity in macro. E
also drives a hard beam of light straight across the frame that blows out where it lands. F
has black alligator-grain leather with individual stitches resolved, and the case sits in
the light rather than in front of it.

**It is framed for the move that was actually briefed.** The shot is a slow push-in. That
makes the reference's subject scale and centring a *motion* decision, not a composition
decision: whatever is at the edge of frame at 0.0s is gone by 6.0s. C is the clearest
counter-example — a beautiful still with the watch shoved against the right edge, which a
push-in would walk straight out of frame. A has the opposite problem, a small distant
subject that would need the whole six seconds just to arrive at macro scale. F starts the
watch centred and already large, so the push-in has room to be *slow*, which is the entire
brief.

**Its dial is genuinely deep black.** YAVG across the frame is 37.1/255 with YMIN at 0 —
the near-black gradient background the direction asked for is real, not a dark grey. The
applied baton indices and their lume fill read crisply against it, and the polished bezel
carries a single controlled rim highlight along the lower left. B, by contrast, sits in a
bright halo that leaves nowhere for the highlight to travel to.

**The counter-intuitive rejection is B.** On its own, B is arguably the best-*looking*
image in the set: a chronograph with real sub-dials, well-lit, strap coiled behind the case.
It is also the only candidate that satisfies the prompt's "and a fine sub-dial" clause,
which F does not. It was still rejected, and the trade is worth stating plainly — sub-dials
are three extra hard-edged, semantically loaded circles for the video model to keep
coherent, on top of the brand text B already carries. A plain dial is a worse photograph and
a much better i2v input. The prompt asked for a sub-dial; the direction's success criteria
rank "dial details remain sharp and legible across the full 6s" above it, and that decides it.

## Conform

None required. seedream-4's 2560×1440 is exactly 16:9 (1.7778), so
`SELECTED_reference_frame.jpg` is a byte-identical copy of `ref_seedream_b.jpg`
(md5 `8fb7c8073af2efcccdf342b6a5b31ac5` for both) and is exactly what the video models
received, passed as a data URI (`reference/ref_frame_datauri.txt`).

Had a flux candidate won, a crop step would have been needed: 2752×1536 is **1.7917**, not
16:9, despite `aspect_ratio: "16:9"` being requested. Worth knowing about the model rather
than discovering it at master time.

## Known weaknesses carried forward

These are accepted, and are what to watch when evaluating the video candidates.

1. **The unbranded-dial instruction leaked slightly.** F carries faint, illegible micro-text
   at the 4–5 o'clock position — far smaller and darker than the flux wordmarks, which is
   why it was accepted, but it is the same class of defect. It is nearly invisible at the
   reference's dial brightness. **If anything downstream lifts the dial, it becomes
   legible.** It did. See `evaluation-report.md`.
2. **No sub-dial**, against the prompt's request. Accepted for the reason above.
3. **The seconds hand is ambiguous.** Hour and minute hands are polished and obvious; the
   sweep hand is a thin dark line that all but disappears into the black dial. An i2v model
   given an ambiguous element will resolve it — which direction it resolves in is not
   controllable from here.
4. **The strap is attached and curving behind the case**, not "coiled loosely beside" it as
   the prompt specified. Cosmetic; it reads well and it keeps the frame simpler.
5. **The foreground light streak clips.** YMAX is 255 against the prompt's explicit "no
   clipped highlights". It is a narrow specular on brushed metal, which is the one place
   clipping is physically honest, so it was accepted rather than regenerated.
6. **A faint warm tint** sits in the reflection under the right-hand lug, against the
   direction's "no warm/gold color cast". SATAVG is 1.73/255 overall — the frame is
   effectively monochrome — so this is a local, minor deviation.
