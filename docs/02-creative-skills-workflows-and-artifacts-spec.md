# Video Production Skills — Creative Skills Workflows and Artifacts Specification

## 1. Purpose

This specification defines how Video Production Skills turns production intent into persistent artifacts, how those artifacts evolve, how approved decisions are preserved, and how the workflow reaches a finished video master.

The production model is deliberately domain-native.

Provider execution details belong below this specification.

---

## 2. Production Model

The canonical end-to-end workflow is:

```text
INPUT
Brief
+ optional upstream artifacts
+ references
        ↓

CREATIVE DEFINITION
Visual Direction
        ↓

PREVISUALISATION
Storyboard
        ↓
Shot Plan
        ↓
Optional Animatic
        ↓

SHOT DEVELOPMENT
Reference Frames
        ↓
Optional Motion Prototypes
        ↓
Video Shot Candidate(s)
        ↓
Selected / Approved Shots
        ↓

EDITORIAL
Edit Timeline
├── assembly
├── rough cut
├── fine cut
└── picture lock
        ↓

FINISHING
simple visual / graphics / audio work
        ↓

MASTERING
Video Master
        ↓

QUALITY
Evaluation Report
+
QC Report
        ↓

DELIVERY
Delivery Variant(s) where required
```

Continuity, selection, approval, locking, and provenance cross the entire workflow.

Not every production requires every stage.

### 2.1 Command-to-workflow mapping

Commands are testable behaviour boundaries inside the two core skills. They do not replace production artifacts or introduce another lifecycle.

```text
video-production

define-direction
brief + upstream constraints
→ visual_direction

create-storyboard
brief + visual_direction
→ storyboard

plan-shots
approved storyboard + visual_direction
→ shot_plan

create-animatic
storyboard + shot_plan
→ animatic

create-reference
storyboard_frame + shot_plan + approved character/product references
→ reference_frame candidate(s) + selection
→ scene_sheet, scene_manifest, object_sheet where the environment or a prop must be declared

create-motion-prototype
reference_frame + shot_plan
→ motion_prototype

generate-shot
approved reference + shot_plan
→ video_shot candidate(s)

select-shot
video_shot candidates
→ selected video_shot

assemble-edit
selected shots
→ edit_timeline

integrate-audio
edit_timeline + supplied/generated audio
→ audio_mix / updated edit timing

render-master
locked edit_timeline + approved finishing/audio
→ video_master

create-delivery
video_master + delivery requirements
→ delivery_variant

refine
artifact + evaluation_report + preserve set
→ smallest justified revision
```

```text
video-evaluate

evaluate
artifact + production context
→ evaluation_report observations

diagnose
observations + lineage + production context
→ owning layer + corrective action + correction scope

check-continuity
artifact set + continuity constraints
→ continuity findings

check-motion
video_shot / motion_prototype
→ motion findings + usable range where measurable

check-fidelity
artifact + approved identity/product/style references
→ fidelity findings

qc
media artifact + technical requirements
→ qc_report
```

A command may consume or update more than one artifact where the production semantics require it. Do not invent new first-class artifacts merely to make command boundaries symmetrical.

An installed extension pack may specialise how these commands behave — the defaults they assume, the traits they preserve, and what their evaluation treats as intentional. It must not change a command's inputs, outputs or purpose, and it ranks below explicit user instruction and approved artifacts. See `docs/05`.

---

## 3. State Model

Video production uses three independent axes.

### 3.1 Lifecycle state

```text
draft
refine
final
```

#### `draft`

The artifact exists to explore alternatives or resolve uncertainty.

#### `refine`

The artifact is based on selected or approved work and is being corrected or improved while preserving accepted properties.

#### `final`

The artifact is intended to be used directly as a final production input or deliverable.

### 3.2 Decision state

```text
open
selected
approved
locked
```

#### `open`

The decision remains exploratory.

#### `selected`

This option is preferred for further development.

#### `approved`

Downstream work may rely on it.

#### `locked`

Downstream work may assume it will not change without explicit reopening.

### 3.3 Production policy

```text
economy
balanced
quality
```

Production policy describes execution strategy, not artifact maturity.

The three axes must never be collapsed.

---

## 4. Draft Strategy

The governing rule is:

> **A draft is the cheapest useful representation that can resolve the current production uncertainty without prematurely paying for downstream fidelity.**

Drafts exist to make decisions.

They are not merely low-quality final assets.

### 4.1 Typical uncertainty ladder

```text
visual style uncertainty
→ visual direction

sequence uncertainty
→ storyboard

timing uncertainty
→ animatic

composition uncertainty
→ reference frame

motion uncertainty
→ motion prototype

final motion / execution uncertainty
→ video shot candidate

editorial uncertainty
→ edit preview
```

### 4.2 Escalation test

Before moving to a more expensive representation, ask:

1. What uncertainty are we resolving?
2. Can the current representation resolve it?
3. Has the relevant upstream decision been selected?
4. Will extra fidelity materially improve the decision or downstream production?
5. Can cost be applied only to the affected artifact?
6. Is there a cheaper representation that answers the same question?

If a cheaper representation can answer the question, use it.

### 4.3 Draft sets

Use a `draft_set` only when deliberate comparison is useful.

Examples:

- several visual directions;
- several character interpretations;
- several storyboard compositions;
- several reference-frame compositions.

A group of independently generated shot takes is not automatically a `draft_set`.

---

## 5. Selection, Approval, and Locking

Selection and approval are distinct.

```text
Draft Alternatives
      ↓
Selection
      ↓
Refinement
      ↓
Approval
```

Selection means:

> Continue developing this option.

Approval means:

> Downstream production may rely on this decision.

### Who selects and who approves

Selection and approval are performed by different parties.

- **Selection is an agent act.** An agent may move an artifact from `open` to `selected`.
- **Approval is a human act.** Only a human moves a creative artifact to `approved` or `locked`, and the approving party is recorded in `approvedBy`.

An agent must not advance a creative artifact to `approved` on its own authority. An artifact marked `approved` with no approver recorded is not approved; it is selected, and downstream production must not rely on it.

Approval is required before expensive generation for:

- visual direction;
- character and identity references;
- environment references;
- shot plan;
- picture lock.

### Resolving creative uncertainty

The cheapest representation that resolves a creative question is a question to the human.

Resolve in this order:

1. ask, when the answer would change what gets generated;
2. produce the cheapest artifact that settles it, when asking cannot;
3. escalate representation fidelity only when the cheaper artifact cannot answer.

Inventing an unstated but story-changing parameter — who the people are, where this takes place, which props carry meaning — is not a production decision an agent owns.

Locking means:

> Downstream work may assume the decision will not change.

Picture lock is the canonical example of a locked production decision.

---

## 6. First-Class Artifacts

The canonical first-class artifact vocabulary is:

```text
brief

visual_direction

character_sheet
character_manifest
scene_sheet
scene_manifest
object_sheet
product_manifest

storyboard
shot_plan
animatic

reference_frame
motion_prototype
video_shot

edit_timeline
audio_mix

video_master
delivery_variant

draft_set

evaluation_report
qc_report
provenance_record
```

`storyboard_frame` remains independently addressable as a child of `storyboard`.

Generic storage/media types such as `image_asset` and `audio_asset` are not normative production artifacts.

---

## 7. Artifact Responsibilities

| Artifact | Represents | Preserves | Main consumers |
|---|---|---|---|
| `brief` | production objective and constraints | intent, runtime, required outputs, restrictions | all stages |
| `visual_direction` | visual language of the video | look, palette, lighting, camera, styling | storyboard, references, finishing |
| `character_sheet` | canonical recurring visual identity | face, silhouette, key styling and useful views | storyboard, refs, shots, evaluation |
| `character_manifest` | semantic identity constraints | must-preserve / mutable properties | generation and continuity evaluation |
| `scene_sheet` | canonical recurring environment | look, landmarks, spatial layout | storyboard, refs, shots, continuity evaluation |
| `scene_manifest` | environment spatial constraints | landmarks, attachments, axis order, camera side, per-shot presence | reference-frame generation and continuity evaluation |
| `object_sheet` | recurring prop or object identity | must-preserve geometry, colour, markings | refs, shots, continuity evaluation |
| `product_manifest` | product-critical constraints | geometry, colour, logo, text, packaging constraints | storyboard, refs, shots, fidelity evaluation |
| `storyboard` | visual sequence | sequence, shot purpose, staging, coarse pacing | shot plan, animatic, reference frames |
| `shot_plan` | executable shot requirements | duration, framing, action, camera, refs, continuity | reference frames, motion, shots |
| `animatic` | sequence timing preview | timing, shot relationship, dialogue/music relationship | shot production and editorial planning |
| `reference_frame` | approved visual target for a shot | identity, composition, framing, environment, lighting | motion prototype and video shot |
| `motion_prototype` | shot-level motion test | action, timing, camera movement | final shot production |
| `video_shot` | produced shot candidate or selected shot | executed visual/motion result and lineage | editorial |
| `edit_timeline` | editorial arrangement | source selection, order, in/out, duration, cuts, transitions, audio placement | finishing and master |
| `audio_mix` | final video-specific audio state | voice/music/SFX timing and balance | master |
| `video_master` | finished canonical source video | approved edit and finishing | QC and delivery |
| `delivery_variant` | platform/format adaptation | source master and adaptation decisions | external delivery |
| `draft_set` | comparable creative alternatives | alternatives and selection lineage | selection/refinement |
| `evaluation_report` | creative/production judgement | criteria, evidence, diagnosis, recommendation | refinement decisions |
| `qc_report` | technical validity | measurements, failures, delivery checks | final correction/delivery |
| `provenance_record` | production lineage | parent, references, execution facts, changes | refinement, reproducibility, evaluation |

---

## 8. Brief

A brief is persistent production intent, not merely a prompt.

It may include:

- objective;
- target output;
- runtime;
- audience constraints;
- message or story requirement;
- required subjects;
- visual references;
- technical requirements;
- delivery constraints;
- explicit non-negotiables.

Resolve material ambiguity before expensive production.

---

## 9. Visual Direction

`visual_direction` captures persistent visual decisions that should not be reinterpreted independently by every downstream artifact.

Typical contents:

```yaml
intent: intimate, observational, natural

visualStyle:
  palette: warm neutral
  contrast: soft
  texture: naturalistic

camera:
  style: handheld
  movement: restrained
  framing: close and medium

lighting:
  direction: available-light feel
  mood: morning interior

avoid:
  - glossy commercial lighting
  - extreme wide-angle distortion
```

The artifact should remain concise.

It is not a general-purpose style bible.

### 9.1 Workflow

```text
Brief
 ↓
Visual Direction Draft(s)
 ↓
Select
 ↓
Refine
 ↓
Approved Visual Direction
```

Cheap representations may include text direction, references, mood boards, rough style frames, palette studies, or lighting studies.

---

## 10. Character Continuity

A character sheet is the canonical visual identity reference for a recurring person or fictional character where continuity matters.

A full specialist character-design workflow is deferred, but the core system must be able to consume or establish an approved visual identity reference and preserve it downstream.

### 10.1 Character manifest

A character manifest records semantic constraints such as:

```yaml
identity:
  preserve:
    - face
    - hair
    - eye-colour

mutable:
  - outfit
  - pose
  - lighting

continuity:
  strictness: high
```

Do not pin a model unless reproducibility intentionally requires it.

---

## 11. Product Continuity

A product manifest stores product-critical constraints.

Example:

```yaml
preserve:
  geometry: true
  colour: true
  logo: true
  packagingText: true

forbid:
  - invented accessories
  - altered branding
```

Carry these constraints through storyboard, reference-frame, and shot production when product fidelity matters.

A full product-video specialisation is deferred.

---

## 12. Storyboard

A storyboard is a persistent production artifact used to validate the visual sequence before expensive multi-shot generation.

It answers:

> **What is the visual sequence?**

It preserves:

- sequence;
- shot purpose;
- staging;
- composition;
- story progression;
- rough pacing;
- character/product placement.

### 12.1 Storyboard frame

Each frame is independently addressable so it can be selected, refined, evaluated, or promoted without recreating the entire storyboard.

A frame may include:

```yaml
shot: 1
purpose: hook
framing: close-up
subject: creator
action: reacts to the problem
dialogue: "..."
```

Detailed executable camera and continuity requirements belong in the shot plan.

### 12.2 Workflow

```text
Brief
+ Visual Direction
 ↓
Text / Structural Storyboard
 ↓
Visual Storyboard Draft(s)
 ↓
Review / Compare
 ↓
Selected Storyboard
 ↓
Refine
 ↓
Approved Storyboard
```

Do not spend premium motion-generation cost while sequence and composition remain unstable.

---

## 13. Shot Plan

The shot plan answers:

> **What exactly must be produced for each shot?**

It may preserve:

```text
shot ID
purpose
duration target
framing
subject
action
camera angle
camera movement
character references
product references
environment references
dialogue/audio requirements
continuity constraints
transition requirements
technical constraints
```

The schema should grow from real production requirements rather than attempt to model every professional shot-list field in advance.

### Workflow

```text
Approved Storyboard
 ↓
Shot Plan Draft
 ↓
Production-Readiness Review
 ↓
Approved Shot Plan
```

---

## 14. Animatic

An animatic is an optional low-cost sequence-level temporal test.

It answers:

> **Does the sequence work in time?**

It may use:

- storyboard images;
- rough reference frames;
- placeholder frames;
- temporary dialogue;
- guide music;
- basic cuts and transitions.

The approved decisions are timing and sequence decisions, not the pixels of the animatic.

### Workflow

```text
Storyboard
+ Shot Plan
 ↓
Animatic
 ↓
Review
 ├── sequence problem → storyboard
 ├── timing problem → shot plan / edit timing
 └── works → proceed
```

Do not build a separate animatic engine initially.

A deterministic preview is sufficient.

---

## 15. Reference Frame

A reference frame is the approved visual target for one shot.

It may inherit from:

```text
visual direction
+
storyboard frame
+
shot plan
+
character/product/environment references
```

It should preserve:

- subject identity;
- product fidelity;
- environment;
- composition;
- framing;
- lighting;
- styling;
- continuity with adjacent shots.

### Workflow

```text
Approved Storyboard Frame
+ Shot Plan
 ↓
Reference-Frame Draft(s)
 ↓
Select
 ↓
Refine
 ↓
Approved Reference Frame
 ↓
Video Shot Production
```

When consistency matters, prefer this to asking a video model to invent composition and motion simultaneously.

---

## 16. Motion Prototype

A motion prototype is an optional low-cost shot-level video draft.

It tests:

- action;
- within-shot timing;
- camera movement;
- object interaction;
- transition behaviour where relevant.

### Workflow

```text
Approved Reference Frame
 ↓
Motion Prototype
 ↓
Motion acceptable?
 ├── No → revise frame / shot plan / instructions
 └── Yes → final shot production
```

Do not require motion prototypes for every shot.

---

## 17. Video Shot

`video_shot` is the fundamental produced motion unit.

A shot should inherit approved decisions from the most specific available production artifacts.

Priority should normally be:

```text
approved reference frame
shot plan
character/product constraints
visual direction
brief
```

not a fresh reinterpretation of the brief.

### 17.1 Candidate shots

Execution may produce:

```text
shot-012-a
shot-012-b
shot-012-c
```

These are shot candidates with common lineage.

They are not automatically a `draft_set`.

### 17.2 Selection

Editorial should explicitly reference the selected shot candidate.

---

## 18. Editorial Workflow

The authoritative editorial artifact is `edit_timeline`.

Do not create separate schemas for:

```text
assembly
rough cut
fine cut
picture lock
```

These are revisions/states of one edit timeline.

### 18.1 Progression

```text
Selected Shots
 ↓
Assembly
 ↓
Rough Cut
 ↓
Review
 ↓
Fine Cut
 ↓
Picture Lock
```

### 18.2 Minimal timeline semantics

The core representation needs only enough information to express:

```text
source shot
order
in/out
duration
transition
audio source
audio timing
basic graphics/title placement
```

It does not need to be a general nonlinear-editor interchange format.

### 18.3 Picture lock

Picture lock is:

```text
decisionState: locked
```

on the edit timeline.

Once locked, finishing work may assume picture timing remains stable.

Reopening the lock should be explicit.

---

## 19. Audio Mix

The project may consume:

- recorded dialogue;
- generated speech;
- music;
- stems;
- sound effects.

Early edits may use temporary audio.

Final mixing is justified only when picture timing is sufficiently stable.

The initial implementation owns simple video-specific integration, not a full sound-post pipeline.

`audio_mix` is the picture/program mix for the video. It may balance supplied music against dialogue and effects, but it does not replace the internal mix or master of the music asset itself.

### Initial progression

```text
guide audio
 ↓
rough mix
 ↓
review
 ↓
refined mix
 ↓
final audio mix
```

---

## 20. Finishing

Finishing may include:

- shot correction;
- simple compositing;
- visual matching;
- colour adjustments;
- graphics/titles;
- audio integration.

The initial system should validate decisions cheaply before applying finishing broadly.

Do not create separate first-class artifact types for every finishing operation.

---

## 21. Video Master

A `video_master` is the approved highest-quality source video from which delivery variants are derived.

It is not a creative draft.

A video still under creative review is an edit preview, not yet the master.

### Workflow

```text
Locked Edit
+ approved finishing
+ final audio mix where applicable
 ↓
Video Master
 ↓
QC
```

---

## 22. Delivery Variant

A delivery variant adapts the approved master for a target output.

Possible adaptations include:

- aspect ratio;
- crop or reframe;
- resolution;
- frame rate;
- codec/container;
- audio requirements;
- captions/subtitles;
- platform requirements.

A variant should trace back to its source master.

Initial proof requires only one valid master.

Multi-platform delivery automation is deferred until real workflows justify it.

---

## 23. Promotion Rules

Prefer promotion over restart.

Examples:

```text
selected visual direction
→ approved visual direction
```

```text
storyboard frame
→ reference frame
```

```text
reference frame
→ video shot
```

```text
motion prototype
→ final shot instructions
```

```text
selected video shot
→ edit timeline
```

```text
locked edit timeline
→ video master
```

Rule:

> **Never recreate approved decisions from the original brief when a more specific approved artifact or its provenance can be used downstream.**

---

## 24. Refinement Rules

Refinement should operate at the smallest meaningful artifact.

Examples:

```text
identity drift
→ refine character/reference material or affected shot
```

```text
bad storyboard composition
→ refine one storyboard frame
```

```text
wrong camera movement
→ revise motion prototype / shot plan / affected shot
```

```text
weak cut
→ revise edit timeline
```

```text
bad audio balance
→ revise audio mix
```

```text
wrong delivery crop
→ regenerate one delivery variant
```

### 24.1 Command-level refinement routing

`refine` is the production-side routing command.

It should use evaluation evidence and artifact lineage to select the smallest owning command:

```text
reference composition defect
→ create-reference

camera/action design defect
→ plan-shots or create-motion-prototype

execution-only shot defect
→ generate-shot

wrong selected take
→ select-shot

pacing / ordering defect
→ assemble-edit

audio balance or sync defect
→ integrate-audio

master encode defect
→ render-master

delivery crop / format defect
→ create-delivery
```

The correction target is part of the expected result. A refinement that fixes the visible symptom by rewriting unrelated approved work is still a failure.

---

## 25. Provenance

Persistent artifacts should retain lightweight lineage.

Minimum useful information may include:

```text
artifact ID
artifact type
workflow state
decision state
approving party where the decision state is approved or locked
production policy
parent artifact
variant relationship
references
execution provider/model where relevant
requested changes
source files
```

Example:

```yaml
id: reference-frame-03
type: reference_frame
workflowState: refine
decisionState: selected
approvedBy: null
productionPolicy: balanced
parent: storyboard-frame-03-b
references:
  - character-sheet.png
changesRequested:
  - move product closer to camera
  - preserve character pose
```

The provenance layer must remain lightweight.

It is not a workflow engine or graph database.

---

## 26. Evaluation Lifecycle

Evaluation depends on both artifact type and lifecycle.

### Draft

Ask:

> Is this artifact useful for the decision it was created to support?

### Refine

Check:

- requested correction;
- preservation of approved properties;
- continuity;
- regressions.

### Final

Check all applicable production and technical requirements.

Evaluation should produce an actionable diagnosis.

---

## 27. Artifact-Specific Evaluation

### Visual direction

Check:

- compatibility with brief;
- internal coherence;
- enough distinction to compare alternatives.

### Storyboard

Check:

- understandable sequence;
- clear shot purpose;
- coherent subject placement;
- major continuity contradictions;
- readiness for shot planning.

### Reference frame

Check:

- intended composition;
- approved references preserved;
- identity/product fidelity where relevant;
- shot-generation readiness.

### Motion prototype

Check:

- intended action;
- camera movement;
- timing;
- gross motion defects.

### Video shot

Check:

- shot purpose achieved;
- technical validity;
- identity/product constraints;
- continuity;
- editorial usability.

### Edit timeline / preview

Check:

- sequence completeness;
- clarity;
- pacing;
- shot connection;
- missing coverage.

### Video master

Check:

- approved edit represented;
- required audio present;
- creative requirements satisfied;
- technical QC passed.

---

## 28. Creative Evaluation vs Technical QC

`evaluation_report` and `qc_report` are separate.

### Evaluation report

Answers:

> **Is the production creatively and functionally good enough?**

Possible dimensions:

- brief compliance;
- shot purpose;
- visual direction;
- composition;
- identity/product fidelity;
- continuity;
- motion quality;
- editorial quality;
- pacing;
- video sequence/message clarity against supplied intent;
- fidelity to supplied campaign constraints where applicable;
- audio/video relationship.

### QC report

Answers:

> **Is the media technically valid and deliverable?**

Possible checks:

- readable file/container;
- expected duration;
- resolution;
- aspect ratio;
- frame rate;
- expected streams;
- audio presence;
- gross sync;
- obvious corruption;
- delivery requirements.

Do not run expensive semantic judgement before cheap deterministic validation when the file is technically invalid.

---

## 29. Corrective Actions

Evaluation should recommend one of:

```text
accept
refine-current
retry-execution
revise-reference
revise-shot-plan
revise-storyboard
revise-edit
change-capability
reject
```

The recommendation should identify the layer that owns the failure.

---

## 30. Failure Taxonomy

### Execution

- transient provider error;
- invalid response;
- failed upload/download;
- corrupt output.

### Capability

- required conditioning unsupported;
- required duration/control unavailable;
- selected execution path cannot satisfy constraints.

### Prompt/reference

- instructions ambiguous;
- reference conditioning insufficient;
- wrong visual interpretation.

### Shot design

- poor composition;
- wrong camera motion;
- impossible or unclear action.

### Continuity

- identity drift;
- product mismatch;
- wardrobe/prop mismatch;
- environmental mismatch;
- screen direction or lighting mismatch.

### Editorial

- poor structure;
- wrong selection;
- weak pacing;
- missing coverage.

### Technical

- invalid media;
- wrong aspect ratio;
- wrong frame rate;
- audio problem;
- delivery mismatch.

---

## 31. Retry and Escalation

Use:

```text
transient failure
→ retry same execution once

capability failure
→ discover compatible execution

structural failure
→ revise owning production artifact

local media defect
→ regenerate/refine affected asset

editorial failure
→ revise edit timeline
```

Use optional secondary provider execution only for a real capability gap or explicit user choice.

Do not automatically escalate to the most expensive model.

---

## 32. Core Workflows

### 32.1 Single-shot video

```text
Brief
→ Visual Direction where needed
→ Reference Frame
→ Optional Motion Prototype
→ Video Shot
→ Evaluation / QC
→ Video Master
```

### 32.2 Multi-shot video

```text
Brief
→ Visual Direction
→ Storyboard
→ Shot Plan
→ Optional Animatic
→ Reference Frames
→ Optional Motion Prototypes
→ Video Shots
→ Edit Timeline
→ Audio / Finishing
→ Video Master
→ Evaluation / QC
```

### 32.3 Character-driven video

```text
Brief
→ Visual Direction
→ Approved Character Reference
→ Storyboard
→ Shot Plan
→ Reference Frames
→ Video Shots
→ Edit Timeline
→ Video Master
```

The approved character identity reference remains available throughout the sequence.

### 32.4 Product-focused video

```text
Brief
→ Product Manifest / References
→ Visual Direction
→ Storyboard
→ Shot Plan
→ Product-Critical Reference Frames
→ Video Shots
→ Edit Timeline
→ Product Fidelity Evaluation
→ Video Master
```

### 32.5 Short-form / UGC-style execution

Video Production Skills may execute a short-form video from supplied campaign inputs.

Advertising Production Skills, where present, owns:

- audience;
- proposition;
- campaign positioning;
- claims;
- broader campaign strategy.

A dedicated UGC skill remains deferred until repeated workflows prove that it requires independent behaviour.

---

## 33. Cross-Project Handoffs

Artifacts from other family projects enter the workflow as production inputs.

### Narrative → Video

```text
story brief
screenplay
scene plan
character profile
world bible
dialogue
```

These remain upstream story artifacts. Video may translate them into visual staging, shot sequencing, timing, and editorial decisions without taking ownership of plot, character arcs, world logic, or medium-independent narrative development.

### Advertising → Video

```text
campaign brief
video concept
approved claims
CTA
audience constraints
```

These remain upstream campaign-strategy artifacts. Video executes them but does not redefine audience, positioning, proposition, claims strategy, CTA strategy, or cross-channel campaign logic.

### Music → Video

```text
music track
stems
timing map
audio brief
```

Video owns placement, timing, and picture/program balance. Music Production Skills retains ownership of music composition and the internal mix/master of the supplied music asset.

### Video Game Assets → Video

```text
character sheet
environment sheet
prop reference
visual reference
```

These remain game-asset artifacts used as visual references; Video does not take ownership of reusable game-ready asset production.

### Comic → Video

No canonical handoff is required initially. Supplied comic panels or artwork may be consumed as generic visual references, but comic panels and video storyboard frames do not share a contract merely because both are sequential images.

Video Production Skills should not require those repositories at runtime merely to consume their artifacts.

---

## 34. Deferred Production Capabilities

The following remain deliberate follow-up improvements:

- full character-design workflow;
- full product-video workflow;
- dedicated UGC workflow;
- advanced animatics;
- specialist audio-post;
- advanced compositing and colour;
- richer graphics/title workflows;
- OpenTimelineIO interchange;
- broadcast-grade QC;
- automated multi-platform delivery.

These should be added when actual production work demonstrates independent value.

---

## 35. Workflow Acceptance Criteria

The workflow model is correct when:

1. the agent chooses only the stages required by the current production uncertainty;
2. lifecycle, decision state, and production policy remain independent;
3. drafts are decision-useful rather than merely low-fidelity;
4. draft sets are created only for genuine comparison;
5. selection and approval are distinct;
6. locked decisions are explicit;
7. visual direction is persistent;
8. storyboard and shot plan are distinct;
9. storyboard frames remain independently addressable;
10. animatics test sequence timing rather than final visual fidelity;
11. reference frames bridge approved planning and shot production;
12. motion prototypes remain optional;
13. shot candidates preserve common lineage;
14. the edit timeline, not a rendered preview, is the authoritative editorial artifact;
15. picture lock is represented as a decision lock on the edit timeline;
16. simple audio integration is supported without absorbing Music Production Skills;
17. the master is distinct from an edit preview and from delivery variants;
18. evaluation is artifact-specific;
19. creative evaluation is distinct from technical QC;
20. failures are diagnosed at the correct production layer;
21. retries operate on the smallest relevant unit;
22. provenance remains lightweight;
23. approved work is preserved downstream;
24. cross-project inputs enter through artifacts rather than runtime coupling;
25. deferred specialisations remain outside the core until production evidence justifies them;
26. command boundaries map cleanly onto existing artifact transitions without replacing the artifact model;
27. command-level refinement routes defects to the smallest owning behaviour;
28. commands do not create a parallel lifecycle or require a workflow runtime.

---

**Video Production Skills — Creative Skills Workflows and Artifacts Specification v4**
