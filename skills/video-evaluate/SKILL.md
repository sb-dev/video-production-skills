---
name: video-evaluate
description: Evaluate video-production artifacts for creative readiness, continuity, identity or product fidelity, motion quality, editorial quality, pacing, technical validity, and the smallest appropriate corrective action. Use for storyboard review, reference-frame review, shot review, edit review, final video evaluation, technical QC, or diagnosing why a production artifact failed.
license: Apache-2.0
compatibility: Requires Node.js 24.12+ for bundled TypeScript scripts and FFmpeg/ffprobe for deterministic media inspection; network access is required only for semantic/provider-backed evaluation.
---

# Video Evaluate

Evaluate a video-production artifact against its production role, intent, parents, references, and technical requirements.

Prefer actionable diagnosis over generic scoring.

## Activation

Use when asked to:

- review or evaluate a storyboard;
- evaluate a reference frame;
- evaluate a motion prototype;
- evaluate a video shot;
- check character or product continuity;
- review an edit;
- analyse pacing;
- inspect a video master;
- run technical QC;
- diagnose why an artifact is poor;
- recommend what to refine or regenerate.

The artifact does not need to have been produced by Video Production Skills.

## Gather context

Identify where available:

- artifact type;
- lifecycle state;
- brief;
- visual direction;
- parent artifact;
- shot plan;
- approved references;
- character constraints;
- product constraints;
- adjacent shots;
- expected technical requirements.

Judge against the most specific available production expectations.

Do not reduce evaluation to prompt compliance when more specific approved parents exist.

## Evaluation principle

Evaluate only the criteria relevant to the artifact's production role.

A draft should be useful for its current decision.

A final artifact should satisfy all applicable production and technical requirements.

## Classify every finding

Every finding carries one class. Do not collapse them into a single quality score.

```text
technical defect | creative defect | continuity defect | generation/model defect
```

The class determines who owns the fix. A generation defect is not corrected by rewriting the
brief, and a creative defect is not corrected by changing model.

## Evidence first

Prefer:

1. deterministic inspection;
2. extracted evidence;
3. semantic judgement only where needed;
4. structured diagnosis;
5. recommended corrective action.

Skill-local deterministic scripts are TypeScript and require Node.js 24.12+ for stable native TypeScript execution. They have no npm runtime dependency. Use FFmpeg/ffprobe for objective media evidence before expensive semantic analysis.

Run `scripts/preflight.ts` first. A declared dependency that is missing does not announce itself; it turns into ad-hoc substitute tooling and a review method that quietly stops matching the one specified.

Deterministic scripts available here:

- `scripts/inspect-video.ts` — container, streams and stated requirements;
- `scripts/sample-frames.ts` — still sampling for staging review;
- `scripts/detect-motion-artifacts.ts` — temporal integrity and usable range;
- `scripts/validate-continuity.ts` — scene-manifest spatial continuity;
- `scripts/preflight.ts` — external dependency availability.

## Draft evaluation

Ask whether the artifact is useful for the decision it was created to support.

Do not reject a draft merely for lacking final polish.

## Refinement evaluation

Verify:

- requested correction succeeded;
- approved properties were preserved;
- continuity remains acceptable;
- no material regression was introduced.

## Final evaluation

Apply all relevant:

- brief compliance;
- visual-direction compliance;
- shot-purpose compliance;
- composition;
- continuity;
- character fidelity;
- product fidelity;
- motion quality;
- editorial quality;
- pacing;
- audio/video relationship;
- technical media validity.

## Storyboard readiness

Check:

- sequence understandable;
- shot purpose clear;
- subject placement coherent;
- no material continuity contradiction;
- enough information exists for shot planning.

## Reference-frame readiness

Check:

- composition resolved;
- required approved references preserved;
- character/product fidelity where relevant;
- suitable as a shot-production target.

## Motion-prototype readiness

Check:

- intended action;
- camera movement;
- timing;
- gross motion defects.

## Video-shot evaluation

Evaluate the shot as start state → motion → end state, not as unrelated pictures.

Check:

- intended action exists;
- shot purpose achieved;
- media technically usable;
- **motion plausible** — run `scripts/detect-motion-artifacts.ts` for periodic seams, frozen frames and drift;
- common-sense and physics violations;
- visible generation defects;
- repeated or looping action;
- identity drift;
- prop drift;
- unexpected jumps;
- narrative continuity;
- spatial continuity — run `scripts/validate-continuity.ts` against the scene manifest;
- pacing;
- **recommended usable range** — the longest span free of defects, reported by `detect-motion-artifacts.ts`;
- verdict: **keep / trim / regenerate**.

Report the usable range even when the verdict is keep. Editorial otherwise chooses an out-point by eye, and a take whose usable range is far shorter than its duration was never usable at the length it was cut to.

Still frames resolve staging, not motion. Do not conclude a shot is usable from contact sheets alone, and do not sample stills at an interval near a suspected artifact period.

## Edit evaluation

Check:

- sequence complete;
- story/message understandable;
- shot selection;
- pacing;
- rhythm;
- transitions;
- missing coverage;
- are cuts motivated, or do they feel random;
- are subject changes motivated;
- are spatial jumps physically plausible;
- does cause and effect survive across shots;
- do emotional beats have enough duration to land;
- does a montage actually read as montage.

## Master evaluation

Check:

- approved edit represented;
- required finishing represented;
- required audio present;
- creative requirements satisfied;
- technical QC passed.

## Technical QC

Use deterministic evidence where possible.

Check only applicable requirements such as:

- file readable;
- container/streams valid;
- duration;
- resolution;
- aspect ratio;
- frame rate;
- audio presence;
- gross sync;
- obvious corruption;
- specified delivery requirements;
- temporal integrity — periodic seams, frozen frames and drift, via `scripts/detect-motion-artifacts.ts`;
- unintended letterboxing introduced by unconformed sources.

Container validity is not picture validity. A file can pass every container check and still carry visible generation seams.

Do not implement a broadcast-grade QC system unless the project later requires it.

## Reports

Produce:

- `evaluation_report` for creative/production judgement;
- `qc_report` for technical validity.

Keep the distinction explicit.

## Corrective action

Recommend one of:

- accept;
- refine-current;
- retry-execution;
- revise-reference;
- revise-shot-plan;
- revise-storyboard;
- revise-edit;
- change-capability;
- reject.

Identify the layer that owns the failure.

## Disposable reviewer

Run shot and edit review in a fresh context, given only:

- the dense frame pack;
- the approved parent artifacts and their constraints;
- the criteria checklist.

Withhold the brief's intent, the prompts used, the candidates rejected, and the reasoning behind any choice. A reviewer that knows what the work was supposed to mean will read that meaning back out of it.

The reviewer returns PASS/FAIL per criterion, a usable range, and keep/trim/regenerate. It does not negotiate, and it does not see the producer's justification.

This applies to the producing agent's own work most of all. Evaluating something you designed, in the context in which you designed it, is not evaluation.

## Ordered diagnosis

Work the causes in order. Stopping at the first plausible one, out of order, is how a reference failure gets misdiagnosed as a prompt failure and retried fifteen times.

1. asset mismatch — is the input reference actually what the shot needs;
2. overloaded prompt — is it asking for more than one thing;
3. weak or unclear action — is the intended motion actually specified;
4. missing end state — does the shot know where it finishes;
5. incorrect camera logic — does the described camera match the framing;
6. continuity gap — does it contradict an approved parent or the scene manifest;
7. capability mismatch — is the requested behaviour beyond the model.

## Failure diagnosis

Examples:

character drift
→ revise-reference or refine-current

wrong camera movement caused by unclear plan
→ revise-shot-plan

good shots but weak pacing
→ revise-edit

corrupt media
→ retry-execution or repair deterministic output

periodic seams, frozen frames or implausible gait
→ retry-execution, or change-capability when the model reproduces it

subject static in the shot because the reference frame posed it static
→ revise-reference, never revise the prompt

landmark present in a shot but absent from the scene manifest
→ revise-reference, and declare the scene before regenerating

creative artifact marked approved with no approver recorded
→ reject pending human approval

unsupported required capability
→ change-capability

Do not recommend regenerating unrelated work.

## Semantic evaluation

Use model-based judgement only where deterministic evidence cannot answer the question, such as:

- composition;
- identity similarity;
- product fidelity;
- video sequence/message clarity against the supplied brief, script, or scene plan;
- visual continuity;
- motion plausibility;
- video creative-execution effectiveness against supplied intent.

Do not maintain a static evaluator-model catalogue.

## Boundaries

Do not:

- claim literal probability of virality;
- produce a generic score when actionable diagnosis is possible;
- run expensive semantic evaluation before basic technical validation;
- treat all artifacts with one universal rubric;
- reimplement provider inference;
- evaluate medium-independent story quality beyond the supplied narrative intent and its video execution;
- redefine campaign strategy, positioning, proposition, claims, or CTA strategy;
- judge or redo a music track's internal mix/master except where its integration into the video is the issue;
- rewrite or regenerate production work unless explicitly requested.

## References

Use these skill-local references when more detail is needed:

- `references/artifact-readiness.md`
- `references/continuity.md`
- `references/media-qc.md`
