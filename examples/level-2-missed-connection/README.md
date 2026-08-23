# Missed Connection

**Level 2 — two-character near miss**

Two strangers cross a busy station and narrowly miss each other, told through staging alone.

![preview](preview.gif)

**Master:** [`production/09-master/missed-connection-master.mp4`](production/09-master/missed-connection-master.mp4) — 12.917 s · 1920×1080 · 24 fps · silent but for station ambience

## Prompt

```text
Use video-production to create a 12–15 second three-shot cinematic sequence called "Missed Connection".

Two strangers move through a busy railway station and narrowly miss seeing each other. The sequence should communicate the near encounter entirely through staging and editing, without dialogue.

Requirements:
- Duration: 12–15 seconds
- Format: 16:9
- Tone: observational, romantic, understated
- Characters: one man and one woman, each visually distinct and consistent
- Environment: large urban station during the evening rush
- Dialogue: none
- Visual storytelling must make their proximity and missed encounter understandable

Plan approximately three shots:
1. Wide shot establishing both characters moving through different parts of the same station
2. Crossing shot where one passes foreground while the other moves behind
3. Final shot showing one character glance back moments after the other has disappeared

Workflow:
- Define visual direction and station geography
- Establish character references for both people
- Storyboard the sequence before motion generation
- Build a shot plan that preserves spatial relationships and screen direction
- Produce reference frames for each shot
- Generate and select video-shot candidates
- Assemble the sequence
- Evaluate whether the story is understandable without explanation

Optimise for:
- spatial continuity
- character identity
- eyelines and screen direction
- timing of the near encounter
- subtle emotional storytelling
```

## What happened

**Visual direction.** The piece is built on two mechanisms, both decided before any pixels
were generated. First, a **station map** with six numbered landmarks and a hard rule that the
camera never crosses the concourse axis — so the departure board stays north of frame in all
three shots and the coffee kiosk stays west of the board. Second, **opposing screen vectors**:
Elias always travels left→right, Nora always right→left. Two protected colours — rust-orange
and deep teal — are reserved for the leads, and the entire crowd is restricted to charcoal,
black, navy, beige, olive and grey so nothing else competes.

**Character reference.** Four-view photographic character sheets for both leads, selected on
colour saturation and silhouette rather than face quality — the references exist to keep the
leads findable at wide-shot scale, so the more saturated rust and the deeper teal won on both.

**Storyboard and shot plan.** The storyboard caught two errors before they became expensive.
It inverted the kiosk/board relationship in SH03 (fixed to a hard constraint), and it drew the
crossing as the moment *after* the pass — correct as a beat, wrong as a production input, since
a reference frame becomes the video model's **first** frame. Every reference frame was
re-specified as an *entry* state, with the dramatic event happening inside the generated motion.

**Reference frames.** SH01 was produced, then rebuilt twice — see
[`selection-sh01-revisions.md`](production/06-reference-frames/selection-sh01-revisions.md).
The original high wide is the best still of the three and was kept as the **environment lock**
that SH02 and SH03 are both conditioned on, which is what keeps all three shots inside one
building. The best-looking SH01 candidate of the first round was rejected outright on
geography: it placed the departure board east of the stone column, which would have forced
Nora to look *right* in SH02 — the same direction Elias exits — inverting the entire premise.

**Candidates and selection.** Three failures, each corrected at a different layer:

- **Provider capability.** `seedance-2.0` refuses this film's two closest compositions
  outright (`E005 sensitive`). Established by controlled diagnostic — both SH02 frames at
  480p with the trivial prompt *"People walk through a railway station"* also failed, as did
  two prompt rewrites and two frame edits removing the phone. Approved frames were kept and
  the *executing model* was swapped to Kling for those shots.
- **Screen direction.** Both models walked Nora the wrong way. Fixed by replacing abstract
  direction with **landmark-anchored** direction — "towards the warmly lit coffee kiosk on
  the left-hand side of the picture" instead of "toward the left of frame".
- **Shot design.** Nora's teal desaturated to black in the wide, because at that scale she was
  a few dozen pixels. No prompt fixes that; the reference frame was rebuilt tighter.

**Edit.** Two hard cuts, no dissolves. Audio built **once** across the whole picture lock
rather than per shot, so it doesn't cut with picture and instead binds the three shots into
one space. Only the strong 0.3–11.3 s region of the generated atmos is used, cross-faded into
itself — the spectrogram shows the source decaying to near-silence after 11 s.

**Evaluation.** The brief's hardest requirement — that the near encounter reads *without*
explanation — cannot be self-assessed, so it was tested blind: the cut was shown to a vision
model with no access to the brief, title, or any prior context, and asked what the film is
about. **The first two picture locks failed this test**, both read as "a moment of stillness
and isolation" with only one character tracked. That evidence, not taste, drove the re-cut and
then the shot rebuild. The final version returned, unprompted:

> *"This short film seems to be about a missed connection or a fleeting moment of unrecognized
> significance between two strangers."*

**What was retried.** SH01 took **15 generation attempts** (12 completed, 3 refused) across
three reference frames and three models. SH02 was refused **8 times** — six shot attempts plus
two controlled diagnostics — before the model swap succeeded first try. The full
diagnosis chain — including a rejected first/last-frame approach that was abandoned rather
than iterated because it solved the wrong problem — is in
[`selection.md`](production/07-shots/selection.md).

**Known divergence.** The miss reads as one-sided: the blind viewer sees Nora as half-aware
of Elias where the shot plan has neither aware. Cause is under-translation in the medium-wide —
Kling animates the gait but barely moves either figure across the floor, so her look toward the
departure board reads as attention rather than transit. Mitigated by a re-execution that raised
her eyeline; not eliminated. Recorded in the
[evaluation report](production/10-evaluation/evaluation-report.md) §4 rather than hidden.

## Files

| Stage | Path |
|---|---|
| Brief | [`production/01-brief/brief.md`](production/01-brief/brief.md) |
| Visual direction + station map | [`production/02-visual-direction/visual-direction.md`](production/02-visual-direction/visual-direction.md) |
| Character references | [`production/03-characters/`](production/03-characters/) |
| Storyboard + review | [`production/04-storyboard/`](production/04-storyboard/) |
| Shot plan | [`production/05-shot-plan/shot-plan.md`](production/05-shot-plan/shot-plan.md) |
| Reference frames | [`production/06-reference-frames/`](production/06-reference-frames/) |
| Shot candidates + selection | [`production/07-shots/`](production/07-shots/) |
| Edit timeline + audio | [`production/08-edit/`](production/08-edit/) |
| **Master** | [`production/09-master/missed-connection-master.mp4`](production/09-master/missed-connection-master.mp4) |
| Evaluation + QC | [`production/10-evaluation/`](production/10-evaluation/) |
| Reproducible master build | [`tools/build-master.sh`](tools/build-master.sh) |

Every generation is recorded in a `jobs-*.json` spec alongside a `*.provenance.json` capturing
the model, prediction ID, resolved inputs and timings.

**Run totals:** 54 predictions — 40 succeeded, 14 failed (11 of those were `seedance-2.0`
content-filter refusals on two compositions), ~60 min of provider compute.

## Models used

| Role | Model |
|---|---|
| Character sheets, storyboard, reference frames | `google/nano-banana-pro` |
| SH01, SH02 (video) | `kwaivgi/kling-v3-video` |
| SH03 (video) | `bytedance/seedance-2.0` |
| Station ambience | `stability-ai/stable-audio-2.5` |
| No-dialogue verification | `openai/gpt-4o-transcribe` |
| Blind comprehension test | `google/gemini-3-pro` |
