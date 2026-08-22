# Reference Frame Selection

Contact sheet: `../eval/reference-contact-sheet.png`

| ID | Model | Prompt | Verdict | Notes |
|----|-------|--------|---------|-------|
| A | `bytedance/seedream-4` | v1 | reject | Wide full-body framing; extended glove floats well short of the bag — the strike does not connect, so impact is not readable. Visible fluorescent tube in frame. |
| B | `bytedance/seedream-4` | v1 | reject | Stylised blue rim-glow tracing the arm and torso — reads as a VFX energy effect, incompatible with "grounded". Lead foot clipped awkwardly at frame bottom. |
| C | `bytedance/seedream-4` | v2 | **SELECTED** | Correct medium shot, boxer left / bag filling right edge, glove in contact with the leather, chalk burst at the point of impact. Hard cold key from camera right rakes the shoulder, arm and cheekbone. Anatomy clean — both gloves correctly formed, elbow and shoulder articulation correct. No text, no clutter, no second person. |
| D | `bytedance/seedream-4` | v2 | reject | Too wide and cluttered: background figures, red signage, four hanging lamps, blown-out exterior daylight. Glove laces float unnaturally. |
| E | `bytedance/seedream-4` | v2 | reject | Head cropped above the mouth — loses the face, and with it the read on effort. Bright open blue sky background; not a dim interior at dawn. |
| F | `google/nano-banana-pro` | v2 | reject | Good haze and mood, but the lead glove renders as an undersized bare-fist shape with no glove volume, mismatched against the correct rear glove. Light is diffuse rather than directional; no contact with the bag. |

`google/imagen-4-ultra` was also attempted for model diversity and failed with a provider-side
404 on both attempts (Vertex AI endpoint `imagen-4.0-ultra-generate-001` not found). Classified as
a capability failure, not a transient one, so it was replaced with `google/nano-banana-pro`
rather than retried.

## Why C

It is the only candidate that satisfies all six visual-direction success criteria at once:
medium-shot framing with the feet excluded, a strike that visibly connects, one dominant
directional key with sweat and chalk catching it, correct anatomy at the extended position,
a clean uncluttered frame, and no text anywhere.

It also gives the video model the most useful starting state. The frame sits at the moment of
contact, which means the shot opens on impact and the model has an unambiguous physical
premise to continue from — bag absorbs, swings, boxer resets, throws again — rather than
having to invent both the wind-up and the connection.

## Approved properties to preserve downstream

- Framing: medium, feet excluded, boxer left / bag right edge
- Key light: hard, cold, from camera right and slightly behind
- Wardrobe: black shorts, black gloves, white wraps, bare torso
- Palette: desaturated cool-neutral, warm skin, crushed blacks
- Environment: bare concrete, single bag, empty darkness, no signage
