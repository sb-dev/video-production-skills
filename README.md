# Video Production Skills

**Direct AI video productions, not isolated generations.**

Video Production Skills gives Agent Skills-compatible coding agents a production workflow around image and video models: plan cheaply, approve creative decisions, preserve continuity, select shots, edit, evaluate, and retry only what failed.

```text
brief → plan → approve → generate → select → edit → evaluate → fix locally
```

## Install

```bash
npx skills add sb-dev/video-production-skills \
  --skill video-production \
  --skill video-evaluate
```

For the default image/video execution path:

```bash
npx skills add replicate/skills \
  --skill find-models \
  --skill compare-models \
  --skill prompt-images \
  --skill prompt-videos \
  --skill run-models
```

Set `REPLICATE_API_TOKEN` when generation is required.

## Quick start — Mechanical Watch Hero

Start with one shot and learn the core production loop.

```text
Use video-production to create a 6-second luxury product hero shot.

Create a cinematic macro video of a black mechanical wristwatch resting on a brushed metal surface. The shot should feel premium, controlled, and elegant.

Requirements:
- Duration: 6 seconds
- Format: 16:9
- Tone: luxury commercial
- Subject: one black mechanical watch with a detailed dial, polished case, and visible texture on the strap
- Camera: slow, precise push-in with a subtle lateral move
- Lighting: dark studio environment with a narrow moving highlight sweeping across the watch face and case
- Focus: preserve crisp dial details, indices, hands, reflections, and premium material feel
- Background: minimal, dark, unobtrusive
- Motion: no chaotic movement; everything should feel controlled and intentional

Workflow:
- Establish concise visual direction first
- Create a reference frame before final video generation
- Generate at least two shot candidates
- Select the strongest candidate
- Run evaluation and technical QC

What to optimise for:
- premium product fidelity
- reflection control
- readable dial details
- smooth camera motion
- elegant lighting transition
```

A one-shot project should stay small:

```text
production/video/
├── brief.md
├── references/
├── shots/shot-001/
│   ├── reference-frame.png
│   ├── candidates/
│   ├── selection.json
│   └── provenance.json
├── master/video-master.mp4
└── evaluation/
```

The important behaviour is:

```text
cheap checkpoint → approve → generate → evaluate → refine only what failed
```

## Learn by producing

Progress through increasingly demanding productions. Each adds a real production problem, not another abstraction.

### Level 1 — Single-shot productions

**6s single shots**

Learn candidates, selection, refinement, and QC. Each example folder holds the prompt, the generated files, and an explanation of what happened.

<!-- Replace preview.gif files after each production run -->

| [![Mechanical Watch Hero](examples/level-1-mechanical-watch-hero/preview.gif)](examples/level-1-mechanical-watch-hero/README.md) | [![Midnight Espresso](examples/level-1-midnight-espresso/preview.gif)](examples/level-1-midnight-espresso/README.md) |
|---|---|
| **[Mechanical Watch Hero](examples/level-1-mechanical-watch-hero/README.md)** — luxury product hero | **[Midnight Espresso](examples/level-1-midnight-espresso/README.md)** — food/product commercial |
| [![Last Train Portrait](examples/level-1-last-train-portrait/preview.gif)](examples/level-1-last-train-portrait/README.md) | [![Boxer at Dawn](examples/level-1-boxer-at-dawn/preview.gif)](examples/level-1-boxer-at-dawn/README.md) |
| **[Last Train Portrait](examples/level-1-last-train-portrait/README.md)** — cinematic character shot | **[Boxer at Dawn](examples/level-1-boxer-at-dawn/README.md)** — sports-action shot |

### Level 2 — Last Train Home

**12s rainy London character scene**

Learn character continuity, storyboard, shot planning, and editing.

```text
Keep the same woman recognisable across three shots on a rain-soaked London platform.
Storyboard first, approve the sequence, and if one shot fails regenerate only that shot.
```

Adds `visual-direction.md`, `storyboard/`, `shot-plan.json`, and `edit/`.

### Level 3 — Obsidian No. 7

**15s luxury fragrance commercial**

Learn product fidelity, graphics, audio, and delivery variants.

```text
Make a luxury fragrance commercial while keeping bottle geometry, label placement,
glass colour and typography fixed across four radically different shots. Add voice-over,
sound design, an end card, and 16:9 + 9:16 delivery versions.
```

Adds product references/manifests, `graphics/`, `audio/`, and `delivery/`.

### Level 4 — Signal Lost

**35s sci-fi micro-film**

Learn shared references, sequences, animatics, and editorial iteration.

```text
Make a 35-second sci-fi micro-film about an astronaut receiving a transmission from Earth
after years of silence. Plan three sequences, use animatics before expensive motion, then
diagnose pacing from the rough cut before revising anything.
```

Adds `shared/` references and `sequences/` when a flat shot list stops scaling.

### Level 5 — Aster Launch

**Hero film + product demo + social teaser**

Learn multiple productions and cross-domain handoffs.

```text
Produce a 45s hero film, 20s product demo and 10s social teaser for a fictional electric
motorcycle. Reuse approved product and visual references while each video keeps its own
brief, edit and master.
```

At this level the project can compose other Creative Production Skills through artifacts:

```text
production/
├── advertising/   # audience, proposition, claims
├── narrative/     # story and scenes
├── music/         # composition and master
└── video/         # visual production and video masters
```

## Project structure grows with the work

**One shot**  
Use `brief`, `references`, `shots`, `master`, and `evaluation`.

**Shots must work together**  
Add `visual-direction`, `storyboard`, `shot-plan`, and `edit`.

**Product, audio, or delivery matter**  
Add manifests, `graphics`, `audio`, and `delivery`.

**A flat shot list stops scaling**  
Add `shared` and `sequences`.

**Several distinct videos share assets**  
Use `video/shared` and `video/productions`.

**Other creative domains contribute**  
Use `production/{advertising,narrative,music,video}`.

Keep the structure lean:

- a shot is the smallest retryable production unit;
- selections point to candidates instead of copying them into `selected/` folders;
- lifecycle state lives in artifact metadata, not global `draft/approved/final` trees;
- `shared/` exists only for genuinely shared artifacts;
- masters stay separate from delivery variants.

## Skills

### `video-production`

Plan, draft, generate, select, edit and finish video while preserving approved decisions.

### `video-evaluate`

Diagnose the failure layer and recommend the smallest corrective action.

Evaluation is actionable rather than just a score:

```text
wrong composition      → revise reference frame or affected shot
wrong camera movement  → revise shot plan and affected shot
good shots, poor pace  → revise edit
corrupt media          → fail technical QC
```

## Execution

The skills decide **what production work is needed**. Existing tools execute it.

- **Replicate Agent Skills** — default image/video model discovery and execution
- **ElevenLabs Agent Skills** — optional speech, transcription and sound effects
- **FFmpeg / ffprobe** — assembly, inspection and QC
- **ImageMagick** — deterministic image operations
- **fal.ai / genmedia** — optional secondary execution path

Deterministic scripts are TypeScript and target **Node.js 24.12+**.

> **Use the least expensive representation that can resolve the current production uncertainty.**
>
> **Preserve approved decisions and change only what needs to change.**

## Documentation

- [`docs/01-creative-skills-system-spec.md`](docs/01-creative-skills-system-spec.md)
- [`docs/02-creative-skills-workflows-and-artifacts-spec.md`](docs/02-creative-skills-workflows-and-artifacts-spec.md)
- [`docs/03-creative-skills-repository-and-contracts-spec.md`](docs/03-creative-skills-repository-and-contracts-spec.md)
- [`examples/three-shot-character-sequence/`](examples/three-shot-character-sequence/)
- [`examples/level-1-mechanical-watch-hero/`](examples/level-1-mechanical-watch-hero/)
- [`examples/level-1-midnight-espresso/`](examples/level-1-midnight-espresso/)
- [`examples/level-1-last-train-portrait/`](examples/level-1-last-train-portrait/)
- [`examples/level-1-boxer-at-dawn/`](examples/level-1-boxer-at-dawn/)

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

Apache-2.0. See [`LICENSE`](LICENSE).
