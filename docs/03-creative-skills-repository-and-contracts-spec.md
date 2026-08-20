# Video Production Skills — Creative Skills Repository and Contracts Specification

## 1. Purpose

This specification defines how Video Production Skills is packaged as a public, installable, testable Agent Skills repository.

The repository must encode the domain behaviour defined by the System and Workflows specifications without recreating provider infrastructure.

The initial repository should remain deliberately lean.

---

## 2. Canonical Repository Structure

```text
video-production-skills/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── .gitignore
│
├── docs/
│   ├── 01-creative-skills-system-spec.md
│   ├── 02-creative-skills-workflows-and-artifacts-spec.md
│   ├── 03-creative-skills-repository-and-contracts-spec.md
│   └── extraction-candidates.md
│
├── skills/
│   ├── video-production/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   ├── scripts/
│   │   └── evals/
│   │       └── evals.json
│   │
│   └── video-evaluate/
│       ├── SKILL.md
│       ├── references/
│       ├── scripts/
│       └── evals/
│           └── evals.json
│
├── examples/
│   └── three-shot-character-sequence/
│
├── evals/
│   └── end-to-end/
│
└── .github/
    ├── ISSUE_TEMPLATE/
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/
```

Create only files and directories that contain real project material.

Do not scaffold empty guides, showcases, recipes, website content, or specialised examples for symmetry.

---

## 3. Canonical Specs

The three primary specifications live directly under `docs/`:

```text
docs/
├── 01-creative-skills-system-spec.md
├── 02-creative-skills-workflows-and-artifacts-spec.md
└── 03-creative-skills-repository-and-contracts-spec.md
```

They answer different questions:

```text
System
→ What are we building?

Workflows and Artifacts
→ How does video production work?

Repository and Contracts
→ How is the behaviour packaged into Agent Skills?
```

Only this specification contains complete normative `SKILL.md` contract definitions.

---

## 4. Initial Skills

The initial repository contains:

```text
video-production
video-evaluate
```

Do not retain the previous provider-shaped skill set:

```text
replicate-generate
replicate-character
replicate-product
replicate-video
replicate-ugc
replicate-evaluate
```

Provider/model integration belongs below domain behaviour.

Do not create one skill per artifact.

---

## 5. Skill Packaging Rule

Every installable skill must be self-contained inside:

```text
skills/<skill-name>/
```

Runtime resources required by that skill must live with it:

```text
SKILL.md
references/
scripts/
assets/     # only when genuinely needed
evals/
```

An installed skill must not depend on repository-level `docs/`, `examples/`, or another skill's private files.

Selective installation is a supported use case.

`video-production` must remain usable even when `video-evaluate` is not installed.

Small duplication between skill-local references is preferable to introducing an unproven shared runtime package.

---

## 6. Execution Dependencies

### 6.1 Default image/video execution

The host environment should provide the official Replicate Agent Skills required for dynamic model discovery and execution, including the applicable current equivalents of:

```text
find-models
compare-models
prompt-images
prompt-videos
run-models
```

These are peer Agent Skills, not npm dependencies owned by this repository.

Video Production Skills must not implement a direct Replicate API client.

### 6.2 Specialist audio

ElevenLabs Agent Skills are optional peer skills used only when a workflow requires capabilities such as:

```text
text-to-speech
speech-to-text
sound-effects
```

Do not require ElevenLabs for silent or externally voiced productions.

Do not absorb music composition.

### 6.3 Deterministic tools

The host environment must support the deterministic tools required by installed scripts.

Core production uses:

```text
FFmpeg
ffprobe
ImageMagick
```

Scripts should detect missing required binaries and produce actionable errors.

### 6.4 Optional secondary execution

fal.ai/genmedia is an optional secondary execution path.

It is not a required dependency of the initial core proof.

Add it to a workflow only when:

- a concrete required capability is unavailable through the default path; or
- the user explicitly requests fal.ai execution.

Do not introduce a generic provider interface.

---

## 7. Skill Composition

Do not assume a proprietary skill-to-skill function API.

Composition happens through:

- agent instructions;
- working context;
- production artifacts;
- approved references;
- files;
- lightweight metadata;
- provenance.

Correct conceptual pattern:

```text
video-production
      ↓
determine production requirement
      ↓
use approved artifacts / references
      ↓
invoke existing provider skill or deterministic tool
      ↓
produce next video-production artifact
```

`video-evaluate` may inspect artifacts created by any workflow.

---

## 8. Common Skill Requirements

Every `SKILL.md` must contain valid Agent Skills frontmatter and clearly define:

- activation context;
- scope;
- inputs;
- outputs;
- lifecycle behaviour;
- decision-state behaviour where relevant;
- production-policy behaviour where relevant;
- upstream/provider-skill usage;
- artifact responsibilities;
- retry/refinement behaviour;
- evaluation behaviour;
- boundaries;
- links to skill-local references.

Detailed methodology should move into `references/` only when it improves usability.

Do not duplicate entire canonical specs inside skill references.

---

# 9. `video-production/SKILL.md` Contract

```markdown
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

Prefer FFmpeg/ffprobe for:

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
```

---

# 10. `video-evaluate/SKILL.md` Contract

```markdown
---
name: video-evaluate
description: Evaluate video-production artifacts for creative readiness, continuity, identity or product fidelity, motion quality, editorial quality, pacing, technical validity, and the smallest appropriate corrective action. Use for storyboard review, reference-frame review, shot review, edit review, final video evaluation, technical QC, or diagnosing why a production artifact failed.
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

Use FFmpeg/ffprobe for objective media evidence before expensive semantic analysis.

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
```

---

## 11. Skill-Local References

Create references only when they materially improve the installed skill.

### `video-production`

Likely initial references:

```text
references/
├── production-workflow.md
├── storyboard-and-shot-planning.md
├── reference-frames.md
├── editorial.md
└── continuity.md
```

Do not create all files if the `SKILL.md` remains clear without them.

### `video-evaluate`

Likely initial references:

```text
references/
├── artifact-readiness.md
├── continuity.md
└── media-qc.md
```

Avoid premature specialist references such as platform catalogues, virality rubrics, broadcast-QC manuals, or full sound-post guides.

---

## 12. Scripts

Scripts exist only for deterministic behaviour that is more reliable in code than in prose.

### `video-production/scripts/`

Initial TypeScript scripts:

```text
inspect-media.ts
render-timeline.ts
make-contact-sheet.ts
```

Deterministic repository scripts are implemented in TypeScript and target Node.js 24.12 or later, where native TypeScript type stripping is stable. Installed skill scripts use erasable TypeScript syntax and require no npm runtime dependency.

Repository development must use a strict `tsconfig.json` and a pinned TypeScript compiler. At minimum enable `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, and `noEmit`.

Type assertions must not be used as a substitute for runtime validation of external JSON, provider output, CLI arguments, or media metadata. Prefer `unknown` plus explicit narrowing and validation at trust boundaries.

CLI scripts should use Node standard-library argument parsing, invoke subprocesses without a shell, use argument arrays rather than command-string interpolation, return meaningful exit codes, and produce actionable errors for missing dependencies or invalid inputs.

Do not create a general media framework.

### `video-evaluate/scripts/`

Initial TypeScript scripts:

```text
inspect-video.ts
sample-frames.ts
```

Scripts may orchestrate FFmpeg/ffprobe/ImageMagick and validate structured output.

They must not call provider inference APIs directly.

---

## 13. Eval Requirements

Every skill contains:

```text
evals/evals.json
```

Each skill must cover:

```text
normal
draft
refinement
final
failure / boundary
```

Quality criteria must be domain-native.

---

## 14. `video-production` Evals

### Normal case

Scenario:

```text
10–15 second
three-shot character sequence
one supplied character/reference image
```

Expected behaviour:

```text
brief
→ visual direction
→ storyboard
→ shot plan
→ reference frames
→ video shots
→ shot selection
→ edit timeline
→ video master
```

Assertions:

- no immediate expensive three-shot generation before planning;
- only useful intermediates are created;
- approved decisions propagate;
- shot IDs remain stable;
- selected shot versions are used in edit;
- master traces to edit and source shots;
- provider execution remains external.

### Draft case

Given ambiguous visual direction and a multi-shot brief:

- create cheap decision artifacts first;
- compare alternatives only when useful;
- do not treat draft polish as the primary quality bar;
- do not generate final motion before sequence/composition is stable;
- preserve selection.

### Refinement case

Given an approved reference frame and request:

```text
Move product closer to camera.
Keep character, pose, and lighting unchanged.
```

Expected:

- refine selected parent;
- preserve unchanged approved properties;
- record lineage;
- avoid restarting from brief.

### Final case

Given selected shots and a locked edit:

- use selected sources;
- render deterministic master;
- do not invent new creative direction;
- run required final readiness/QC;
- preserve lineage.

### Failure/boundary case

Given a visually strong shot with wrong camera movement caused by ambiguous shot planning:

Expected:

```text
diagnosis: shot-plan failure
action: revise shot plan
scope: affected shot only
```

Forbidden:

- regenerate entire sequence;
- restart from brief;
- automatically select the most expensive model.

---

## 15. `video-evaluate` Evals

### Normal case

Input:

```text
video shot
+ reference frame
+ shot plan
```

Expected:

- evaluate against production parents;
- report concrete evidence;
- return actionable verdict.

### Draft case

Input:

```text
rough storyboard
```

Evaluate:

- sequence;
- shot purpose;
- placement;
- continuity contradictions;
- decision usefulness.

Do not fail merely for low polish.

### Refinement case

Input:

```text
approved parent
+ refined child
+ requested changes
```

Expected:

- requested correction verified;
- approved properties checked;
- regressions identified;
- accept/refine recommendation.

### Final case

Input:

```text
video master
+ technical requirements
+ brief
```

Expected:

- creative evaluation;
- continuity evaluation;
- technical QC;
- distinct evaluation and QC semantics.

### Failure/boundary case

Input:

```text
good individual shots
+ poor sequence pacing
```

Expected:

```text
failure layer: editorial
recommended action: revise-edit
```

A corrupt media fixture should fail deterministic QC before semantic evaluation.

---

## 16. End-to-End Eval

The repository-level core eval proves:

```text
Brief
 ↓
Visual Direction
 ↓
Storyboard
 ↓
Select / Approve
 ↓
Shot Plan
 ↓
Reference Frames
 ↓
Video Shots
 ↓
Select
 ↓
Edit Timeline
 ↓
Video Master
 ↓
Evaluation / QC
```

Assertions should focus on behaviour:

- correct workflow choice;
- cheap uncertainty reduction;
- preservation of approved work;
- correct parent artifacts;
- local retry;
- provider delegation;
- valid artifact lineage;
- valid deterministic master render.

Do not treat the subjective beauty of a nondeterministic generated clip as the primary regression signal.

---

## 17. Eval Execution Policy

### Default CI

Prefer:

- structured fixtures;
- tiny local media files;
- deterministic FFmpeg/ffprobe tests;
- mocked or recorded provider results where necessary;
- agent-behaviour assertions.

These should be cheap and repeatable.

### Live provider smoke eval

Maintain one optional narrow smoke test proving:

```text
agent
→ video-production
→ default provider execution
→ media result
→ deterministic edit/master
→ evaluation
```

Do not run a large expensive live-generation suite on every commit.

---

## 18. Initial Example

The repository contains one realistic example:

```text
examples/
└── three-shot-character-sequence/
```

It should demonstrate:

- brief;
- supplied visual reference;
- visual direction;
- storyboard;
- selection/approval;
- shot plan;
- reference frames;
- generated shot candidates;
- selected shots;
- edit timeline;
- master;
- evaluation report;
- QC report;
- lightweight provenance.

Avoid examples that demonstrate only one provider call.

---

## 19. Installation Expectations

Canonical installation uses the open Agent Skills CLI.

The repository must support:

```text
npx skills add <org>/video-production-skills --list
```

and installation of individual skills, for example:

```text
npx skills add <org>/video-production-skills --skill video-production
```

```text
npx skills add <org>/video-production-skills --skill video-evaluate
```

Exact CLI flags should be verified against the installed CLI during repository validation rather than assumed if the interface changes.

The README must document:

- skill discovery;
- individual skill installation;
- peer provider skills;
- required deterministic binaries;
- environment variables only for providers actually used;
- optional specialist/secondary execution.

---

## 20. Local Validation

Before publication, verify:

1. each `SKILL.md` has valid frontmatter;
2. each installed skill is self-contained;
3. repository-level docs are not runtime dependencies;
4. local deterministic tests pass;
5. skill evals pass;
6. end-to-end fixture eval passes;
7. `npx skills add . --list` succeeds;
8. each intended skill installs locally;
9. installed copies retain required references/scripts;
10. the example is internally consistent;
11. no broken internal references exist.

---

## 21. CI

Initial CI should validate:

```text
frontmatter / skill structure
deterministic scripts
skill eval fixtures
end-to-end fixture eval
npx skills add . --list
local install of video-production
local install of video-evaluate
broken file/reference checks
```

Live provider generation should be optional, explicitly gated, or run on a controlled schedule rather than every pull request.

---

## 22. Extraction Candidate Register

Maintain:

```text
docs/extraction-candidates.md
```

Each candidate records:

```text
candidate
implemented behaviour
video-specific semantics
possible second domain
known differences
status
```

Initial candidates may include:

- `draft_set`;
- artifact provenance;
- promotion/refinement semantics;
- decision-state semantics;
- staged evaluation;
- video visual-direction / broader art-direction semantics;
- shared character identity.

Initial status:

```text
observe only
```

Do not extract automatically.

---

## 23. Deferred Improvement Register

The project should preserve follow-up ideas without implementing them prematurely.

Track these in the System Specification until implementation evidence justifies a separate document.

Candidate follow-ups include:

- `video-plan`;
- `video-character`;
- `video-product`;
- `video-ugc`;
- `video-edit`;
- `video-audio`;
- `video-deliver`;
- standalone `video-qc`;
- OpenTimelineIO interoperability;
- richer fal.ai secondary execution;
- advanced finishing;
- advanced delivery profiles.

A follow-up should be promoted only when:

1. repeated production use demonstrates a real independent boundary;
2. the core skill is materially harder to use without the split;
3. installation/composition remains understandable;
4. the change reduces more complexity than it creates.

---

## 24. Rejected Initial Infrastructure

Do not add:

```text
VideoProvider interface
provider-routing framework
model database
pricing database
workflow engine
artifact graph database
generic media SDK
general editing engine
universal creative schema
complex lifecycle service
```

Revisit only when concrete usage proves the need.

---

## 25. Open-Source Boundaries

The repository is canonical for:

- the two initial skills;
- the three canonical specs;
- workflow rules;
- skill-local production references;
- evals;
- the core example;
- extraction candidates.

Add production guides, showcases, recipes, website content, and richer examples only when real project material exists.

Do not let examples or blog content silently redefine normative behaviour.

---

## 26. Technical Acceptance Criteria

The repository contract is correct when:

1. the three canonical specs live directly under `/docs`;
2. the initial skill set is `video-production` and `video-evaluate`;
3. each skill is independently installable and usable;
4. each skill has valid Agent Skills frontmatter;
5. runtime resources live with the skill that requires them;
6. `video-production` does not require `video-evaluate` merely to operate;
7. official Replicate skills remain the default image/video execution layer;
8. specialist ElevenLabs skills are optional and capability-driven;
9. fal.ai/genmedia is optional and not hidden behind a generic provider abstraction;
10. no provider API client, static model registry, or static pricing catalogue exists;
11. FFmpeg/ffprobe and ImageMagick own deterministic media operations, orchestrated by TypeScript scripts;
12. the project does not implement a workflow engine or graph database;
13. skill behaviour explicitly preserves approved artifacts;
14. storyboards and shot plans remain distinct;
15. reference frames bridge approved planning and shot production;
16. motion prototypes and animatics remain optional;
17. edit timeline and picture lock are represented without building a general NLE;
18. evaluation and QC have distinct semantics;
19. evals cover normal, draft, refinement, final, and failure/boundary cases;
20. TypeScript source passes strict compiler checks and runtime trust-boundary validation;
21. TypeScript CLI subprocesses avoid shell interpolation and validate user-controlled arguments;
22. the end-to-end eval proves brief-to-master production;
23. the initial example demonstrates a real multi-stage workflow;
24. local skill discovery and individual installation succeed;
25. CI installs pinned development dependencies with `npm ci` and runs type-checking, tests, repository validation, and installation checks;
26. specialist follow-up skills remain deferred until proven;
27. cross-domain reuse is tracked as extraction candidates rather than prematurely shared code.

---

**Video Production Skills — Creative Skills Repository and Contracts Specification v5**
