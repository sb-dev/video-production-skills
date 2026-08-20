---
name: video-production
description: Plan, produce, refine, edit, and finish AI-assisted video through a domain-native production workflow. Use for single-shot or multi-shot video, brief-to-video production, storyboarding as part of production, shot planning, reference-frame development, shot generation through upstream provider skills, editorial assembly, mastering, or continuing production from approved artifacts.
---

# Video Production

Direct video production from intent to a finished video master.

Own production decisions and artifacts. Delegate model execution and deterministic media processing to existing tools.

## Activation

Use when the user asks to:

- create or produce a video;
- turn a brief, script, scene plan, or campaign input into video;
- plan and execute a multi-shot sequence;
- continue production from an existing storyboard, shot plan, reference frame, or shot set;
- refine an existing video production;
- edit source/generated shots into a coherent video;
- produce a finished video master.

Do not activate merely for generic image/video generation when no video-production workflow is required.

## Core principle

Use the least expensive representation that can resolve the current production uncertainty.

Preserve approved decisions and change only what needs to change.

## Determine the production path

Identify:

1. the requested output;
2. existing approved artifacts;
3. unresolved production decisions;
4. the cheapest useful artifact for each unresolved decision;
5. which optional stages can be skipped.

Possible stages:

- visual direction;
- storyboard;
- shot plan;
- animatic;
- reference frame;
- motion prototype;
- video shot;
- edit timeline;
- audio integration;
- video master;
- delivery adaptation.

Do not require every stage.

## State

Track independently:

Lifecycle:
- draft
- refine
- final

Decision:
- open
- selected
- approved
- locked

Production policy:
- economy
- balanced
- quality

Never equate lifecycle state with execution quality.

## Brief and visual direction

Interpret the brief as persistent production intent.

When visual direction is materially uncertain, establish a concise visual-direction artifact before expensive production.

Carry approved visual decisions downstream.

## Storyboard

Use a storyboard for multi-shot sequence decisions.

Separate storyboard semantics from executable shot-plan details.

Keep storyboard frames independently addressable.

Do not generate expensive final motion while sequence or composition remains unstable.

## Shot plan

Create enough shot-plan information to drive production:

- shot ID;
- purpose;
- duration target where relevant;
- framing;
- subject;
- action;
- camera behaviour;
- required references;
- continuity constraints;
- audio/dialogue requirements;
- technical constraints.

Do not invent a comprehensive schema when the production does not need it.

## Animatic

Use an animatic only when sequence timing, dialogue timing, or shot relationships need validation before expensive shot production.

Prefer deterministic preview construction.

## Reference frame

Use an approved storyboard frame, shot plan, visual direction, and relevant character/product/environment references.

Generate one or more drafts only when comparison is useful.

Select explicitly.

Refine from the selected parent.

Preserve approved properties.

## Motion prototype

Use only when motion uncertainty is material.

Test:

- action;
- timing;
- camera movement;
- interaction.

If motion concept is wrong, revise the owning production decision rather than polishing the prototype.

## Video-shot production

For each shot:

1. identify hard production requirements;
2. use the most specific approved upstream artifacts;
3. invoke the default image/video provider skills;
4. preserve execution facts in provenance;
5. evaluate basic usability;
6. retain candidate lineage;
7. select the shot used downstream.

Do not maintain a model catalogue.

Do not call provider APIs directly.

## Default provider behaviour

Use official Replicate skills for model discovery, comparison, prompting, and execution.

Use the current compatible model selected through those upstream skills.

If a user pins a compatible model, honour it.

## Optional secondary execution

Use fal.ai/genmedia only when:

- Replicate cannot satisfy a hard required capability; or
- the user explicitly selects fal.ai.

Do not compare all providers automatically.

## Specialist audio

When required, use existing specialist audio skills for speech, transcription, or generated sound effects.

Music composition remains outside this skill.

## Deterministic production

Use the skill-local TypeScript scripts to orchestrate FFmpeg/ffprobe where provided. Prefer FFmpeg/ffprobe for:

- inspection;
- trimming;
- frame/audio extraction;
- edit previews;
- concatenation;
- scaling/cropping;
- simple transitions;
- audio mixing;
- master rendering;
- technical evidence.

Prefer ImageMagick for deterministic image sheets, grids, labels, and comparisons.

Do not use generative inference for deterministic layout or transcoding.

## Editorial

Create a simple edit timeline that preserves:

- source selection;
- order;
- in/out;
- duration;
- transition;
- basic audio placement;
- basic title/graphic placement when required.

Progress through:

assembly → rough cut → fine cut → picture lock

Picture lock is a decision lock on the edit timeline.

Do not build a general editing engine.

## Master

Produce the master only from an approved/locked edit and approved finishing inputs.

A review render is not automatically a video master.

Run required readiness and technical checks before treating output as final.

## Promotion

Use the most specific approved upstream artifact.

Never recreate approved decisions from the original brief when a more specific approved artifact can drive production.

## Refine

When refining:

1. start from the selected/approved parent;
2. preserve approved properties;
3. change only the requested deficiency;
4. retain lineage;
5. verify that no material regression was introduced.

## Retry and failure diagnosis

Classify before retrying.

- transient provider failure → retry once;
- capability failure → discover compatible execution;
- prompt failure → revise instructions;
- reference failure → revise reference;
- composition failure → revise reference frame;
- motion failure → revise motion prototype or shot instructions;
- shot-design failure → revise shot plan;
- sequence failure → revise storyboard;
- pacing failure → revise edit timeline.

Correct the smallest production unit that owns the failure.

Do not automatically increase cost for a structural production failure.

## Evaluation

When installed alone, perform lightweight gates sufficient to operate safely:

- storyboard readiness;
- reference-frame readiness;
- shot usability;
- basic continuity;
- edit completeness;
- master validity.

Use `video-evaluate` for deeper evaluation when available, but do not require it for basic operation.

## Boundaries

Do not:

- implement provider SDKs;
- maintain model or pricing catalogues;
- create a generic provider interface;
- require every optional stage;
- build a workflow engine;
- build an artifact graph database;
- absorb medium-independent plot, character-arc, world-building, or screenplay-development responsibilities;
- absorb campaign positioning, proposition, claims strategy, CTA strategy, or cross-channel campaign logic;
- mix/master a supplied music track as a music-production task;
- absorb reusable game-ready asset production;
- restart from the brief when approved production artifacts exist.

## References

Use these skill-local references when more detail is needed:

- `references/production-workflow.md`
- `references/storyboard-and-shot-planning.md`
- `references/reference-frames.md`
- `references/editorial.md`
- `references/continuity.md`
