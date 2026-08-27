### 1. `claude-video/watch` is the one I would definitely reuse

This addresses a fundamental Claude Code limitation: getting video into a form the agent can actually inspect.

It:

- accepts a local video or URL;
- extracts **scene-aware frames** with FFmpeg;
- retrieves captions or falls back to transcription;
- produces timestamped transcript + frame paths;
- lets Claude visually inspect those frames and reason across them. ([GitHub][1])

It is also mature relative to most alternatives: Skills.sh currently reports roughly **11K installs**. ([Skills][2])

Install:

```bash
npx skills add https://github.com/bradautomates/claude-video --skill watch
```

For a generic `video-evaluate` capability, this is probably the best **execution substrate** rather than something we should reinvent.

---

### 2. `doubao-seedance-video` contains the best evaluation logic

This one is much more interesting from the perspective of a production workflow.

Its video-review pass explicitly checks:

- pass/fail;
- common-sense and physics violations;
- visible generation defects;
- repeated action;
- identity drift;
- prop drift;
- unexpected jumps;
- narrative continuity;
- spatial continuity;
- pacing;
- recommended usable range;
- whether the clip needs regeneration. ([GitHub][3])

For final assembly it goes further and checks whether:

- cuts feel random;
- subject changes are motivated;
- spatial jumps are physically plausible;
- body/mechanical physics work;
- cause and effect survive across shots;
- emotional beats have enough duration;
- montage actually reads as montage. ([GitHub][3])

It also has a particularly good architecture:

```text
video
  ↓
dense frame/contact-sheet pack
  ↓
disposable visual-QA agent
  ↓
PASS / FAIL
  ↓
keep / trim / regenerate
```

That is much closer to what a serious `video-evaluate` skill should do than most other projects I found.

The drawback is that the overall skill is **heavily Seedance-specific**. I would not adopt the entire skill. I would study and reuse its generic `visual-review-standards` / contact-sheet / disposable-review-agent approach.

---

### 3. `cinematic-director` complements it very well

`cajias/agentic-video-skills` includes a **QC & Repair** mode specifically for generated video. It diagnoses failures in this order:

1. asset mismatch;
2. overloaded prompt;
3. weak/unclear action;
4. missing end state;
5. incorrect camera logic;
6. continuity gap;
7. mismatch between requested behaviour and the video model's capabilities. ([GitHub][4])

It also tracks continuity anchors and evaluates start state → motion → end state rather than treating frames as unrelated pictures. ([GitHub][4])

This is important because `watch` gives Claude **eyes**, whereas `cinematic-director` gives it something closer to a **director's review vocabulary**.

I would borrow this distinction:

```text
technical defect
creative defect
continuity defect
generation/model defect
```

rather than producing one vague quality score.

---

### 4. `framedex` is unexpectedly useful

`framedex` is primarily a video archive/indexing skill, but its per-video assessment contains a useful low-level QA layer.

It extracts representative frames and grades:

```yaml
rating: keep | review | cull

technical:
  focus: sharp | acceptable | soft
  exposure: strong | adequate | poor | clipped
  stability: smooth | handheld | jittery
  motion_blur: clean | some | heavy

audio_quality: ...
lighting: ...
```

It combines FFmpeg frame extraction, transcript analysis and vision-model assessment.

That makes it useful inspiration for **objective/technical evaluation**, but not enough by itself for generated narrative video.