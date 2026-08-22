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

## Evidence first

Prefer:

1. deterministic inspection;
2. extracted evidence;
3. semantic judgement only where needed;
4. structured diagnosis;
5. recommended corrective action.

Skill-local deterministic scripts are TypeScript and require Node.js 24.12+ for stable native TypeScript execution. They have no npm runtime dependency. Use FFmpeg/ffprobe for objective media evidence before expensive semantic analysis.

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

Check:

- intended action exists;
- shot purpose achieved;
- media technically usable;
- identity/product constraints preserved where relevant;
- continuity acceptable;
- editorially usable.

## Edit evaluation

Check:

- sequence complete;
- story/message understandable;
- shot selection;
- pacing;
- rhythm;
- transitions;
- missing coverage.

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
- specified delivery requirements.

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
