# Boxer at Dawn

**Level 1 — 6s sports-action shot**

A boxer strikes a heavy bag in a dim gym at dawn with directional low-key light.

## Prompt

```text
Use video-production to create a 6-second sports-action shot.

Create a cinematic shot of a boxer training with a heavy bag in a dim gym at dawn. The image should feel intense, physical, and grounded.

Requirements:
- Duration: 6 seconds
- Format: 16:9
- Tone: gritty but polished sports cinematography
- Subject: one boxer striking a heavy bag
- Camera: slow handheld push-in or restrained forward move
- Lighting: low-key gym lighting with directional light catching sweat, chalk, and motion
- Environment: simple boxing gym, no visual clutter
- Motion: strong but readable punches, bag movement, body rotation, natural physical momentum
- Focus: preserve anatomy, believable movement, impact, and atmosphere

Workflow:
- Establish visual direction first
- Create a reference frame
- If needed, create a motion prototype before the final shot
- Generate at least two shot candidates
- Select the strongest candidate
- Evaluate motion quality, physical realism, camera behaviour, and visual clarity
- Run technical QC

What to optimise for:
- believable athletic motion
- impact and weight
- strong dramatic lighting
- clean composition
- convincing gym atmosphere
```

![preview](preview.gif)

## What happened

**Visual direction.** Written first, before any generation. Locked the subject, the bare
uncluttered gym, a single hard cold key from a high window, a restrained handheld push-in,
2–3 readable punches with real bag reaction, a desaturated cool-neutral grade, and six
success criteria to evaluate against. Anatomy was called out as the hardest constraint, which
drove the choice of a medium shot with the feet excluded to reduce anatomical risk.

**Reference frame.** Six candidates across two prompt revisions and two models. The first
prompt produced wide full-body framings where the glove floated short of the bag, so the
strike didn't connect — plus one candidate with a stylised blue rim-glow around the arm. That
was a composition failure, so the prompt was revised rather than the model changed: explicit
medium-shot framing with the feet excluded, and the boxer placed inside punching range.
`bytedance/seedream-4` candidate C won — glove in contact with the leather, chalk burst at the
point of impact, clean anatomy, no clutter, no text. See `reference/selection.md`.

**Motion prototype.** Worth the cost here, and it earned its keep. A 480p prototype revealed
that the camera drifted right and the heavy bag left the frame entirely by ~4.5s, leaving the
boxer punching empty air, while the background blew out to bright daylight. That is a motion
failure owned by the shot instructions, so the prompt gained hard FRAMING and LIGHTING hold
blocks — the bag must stay in frame, every punch must land, the exposure must not brighten —
instead of spending on more 1080p generations to find the same problem.

**Candidates.** Four at 1080p, across three models. `minimax/hailuo-2.3` arced behind the bag
and ended on the boxer's back. `google/veo-3.1` had the best punch mechanics but introduced a
blown-out practical lamp at 2.25s and drifted the bag to centre frame.
`wan-video/wan-2.7-i2v` held framing and exposure perfectly but idled in a static guard for
~3.5 of the 6 seconds.

**Selection.** That last one was a pacing failure, not a model failure, so the fix went into
the prompt: an explicit "he never stops working" block with a punch cadence, plus
`standing still, idle, static pose` in the negative prompt. Candidate D on the same model
delivered five evenly distributed landed strikes while keeping the framing and exposure
discipline. Selected. See `shots/selection.md`.

**Evaluation and technical QC.** Both pass; corrective action **accept**. Mean luma holds at
51.1–59.8 against a 50.1 reference frame — the shot stays in its low-key dawn exposure with no
brightening trend — with blacks bottoming at 3 and highlights topping at 249, so nothing
clips. The bag visibly compresses under the glove before it moves, anatomy holds through the
fastest frames, and subject and bag stay in frame throughout. The master is frame-accurate at
exactly 6.000s / 180 frames @ 30fps, 1920×1080, decodes with zero errors, and has no black or
frozen segments. See `evaluation-report.md` and `qc-report.md`.

**Preview GIF.** `preview.gif` is a delivery adaptation of the master, converted deterministically
with FFmpeg — two-pass palette (`palettegen stats_mode=diff` → `paletteuse diff_mode=rectangle`)
at 480×270, 10fps, 96 colours, Bayer dithering, infinite loop. It runs the full 6.000s at
2.8 MB. A light `hqdn3d` pass runs before palettisation: at a 96-colour depth the master's film
grain turns into blotchy dither rather than reproducing as grain, so smoothing it first gives a
cleaner and slightly smaller preview. The master itself keeps its grain untouched.

**What was retried, and what failed.**

- Reference-frame prompt revised once (composition failure) — 6 candidates total.
- Shot prompt revised twice: v2 after the prototype (framing and lighting hold), v3 after the
  first candidate batch (pacing).
- `bytedance/seedance-2.0` was unusable for this shot. It failed three times with
  `flagged as sensitive (E005)` — on the original prompt, on a softened rewrite, and at 480p.
  The trigger is the approved reference frame itself, not the wording, so it was routed
  around rather than retried further or worked around by compromising the reference.
- `google/imagen-4-ultra` failed with a provider-side Vertex 404 on both attempts. Classified
  as a capability failure rather than a transient one, so it was replaced with
  `google/nano-banana-pro` instead of being retried.

## Files

| Path | What it is |
|---|---|
| `boxer-at-dawn-master.mp4` | **The deliverable.** 6.000s, 1920×1080, 30fps, silent |
| `preview.gif` | Looping GIF of the master — 6.000s, 480×270, 10fps, 60 frames |
| `direction/visual-direction.md` | Visual direction, written before any generation |
| `reference/prompt.txt`, `prompt_v2.txt` | Reference-frame prompts, v1 and the revision |
| `reference/SELECTED_reference_frame.jpg` | The approved reference frame |
| `reference/selection.md` | All six reference candidates, scored, with reasons |
| `shots/video_prompt.txt` → `_v3.txt` | The four shot-prompt revisions in order |
| `shots/SELECTED_final_shot.mp4` | The selected candidate, pre-master |
| `shots/selection.md` | All four shot candidates, with measurements and reasons |
| `evaluation-report.md` | Creative evaluation against brief and direction |
| `qc-report.md` | Deterministic technical QC evidence |
| `eval/*.png` | Contact sheets and frame-by-frame evidence (untracked) |
| `prototype/proto_hailuo.mp4` | The 480p motion prototype (untracked) |

Rejected candidates and evidence sheets are kept on disk but not tracked, per the repo's
`.gitignore` convention — `SELECTED_*` files are the keepers.

## Models used

| Role | Model |
|---|---|
| Reference frame | `bytedance/seedream-4` *(selected)*, `google/nano-banana-pro` |
| Motion prototype | `minimax/hailuo-2.3` |
| Shot candidates | `wan-video/wan-2.7-i2v` *(selected)*, `minimax/hailuo-2.3`, `google/veo-3.1` |
| Mastering, QC, contact sheets | FFmpeg / ffprobe (deterministic, no inference) |
