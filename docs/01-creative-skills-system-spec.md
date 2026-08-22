# Video Production Skills — Creative Skills System Specification

## 1. Purpose

**Video Production Skills** is an open-source Agent Skills project for directing AI-assisted video production from a creative brief to a production-ready video.

It owns the production intelligence required to:

- reduce creative and production uncertainty before expensive generation;
- preserve approved decisions through later production stages;
- coordinate existing image, video, audio, and deterministic media tools;
- refine the smallest failing production unit rather than restart from the brief;
- evaluate outputs against video-specific creative and technical criteria.

The project does **not** replace model providers or media tools.

The governing boundary is:

> **Video Production Skills owns video-production workflow, artifact semantics, decision preservation, and evaluation. Existing provider skills and deterministic tools own media execution.**

The system should automate production work that can be delegated reliably while keeping consequential creative choices inspectable and human-selectable.

---

## 2. Project Goal

Video Production Skills enables AI agents to direct end-to-end AI-assisted video production from a creative brief to production-ready video while:

1. progressively reducing uncertainty before expensive production;
2. preserving approved creative decisions;
3. selecting the cheapest useful representation for the current production question;
4. delegating media execution to existing tools;
5. evaluating outputs using video-native quality criteria;
6. correcting the smallest relevant production unit when something fails.

A successful workflow produces more than generated clips. It produces a coherent chain of production artifacts that can be inspected, selected, refined, assembled, evaluated, and delivered.

---

## 3. Intended Users

The project is intended for:

- filmmakers and video creators using AI-assisted production;
- creative technologists;
- content-production teams;
- advertising and marketing teams producing video assets;
- developers building agent-driven media workflows.

Users should interact with a production agent, not with a generic generation API.

---

## 4. Supported Production Scenarios

The project should support:

- single-shot video;
- multi-shot video;
- character-driven sequences;
- product-focused video;
- short-form and UGC-style video execution;
- production from an existing screenplay, scene plan, campaign brief, or reference set;
- evaluation and refinement of existing production artifacts.

Specialist workflows may be added later when repeated use proves that they require independent skills.

---

## 5. Core Principles

### 5.1 Domain first

Production behaviour is derived from real video-production practice, not from the capabilities of current generation models.

### 5.2 Draft before expensive production

Use the least expensive representation that can resolve the current uncertainty.

### 5.3 Preserve approved work

> **Preserve approved decisions and change only what needs to change.**

Do not restart from the original brief when a more specific approved artifact can drive the next production stage.

### 5.4 Automate execution; expose consequential creative decisions

The agent may plan, generate, compare, refine, evaluate, and recommend.

Consequential creative decisions should remain visible and selectable.

### 5.5 Spend breadth early and depth late

Explore alternatives cheaply. Concentrate higher-cost production on selected and approved work.

### 5.6 Retry the smallest relevant unit

Correct the artifact or decision that owns the failure.

Do not regenerate an entire sequence to fix one shot.

### 5.7 Provider intelligence stays below production intelligence

The project should not maintain model catalogues, provider SDKs, static pricing, or generic inference abstractions.

### 5.8 Build vertically before extracting abstractions

Video-specific concepts remain local until another production domain independently implements substantially equivalent semantics.

---

## 6. Scope

Video Production Skills owns:

- interpretation of a video-production brief;
- production-path selection;
- video-specific visual-direction and cinematography decisions;
- storyboard development;
- shot planning;
- optional animatic decisions;
- reference-frame development;
- optional motion-prototype decisions;
- shot-production orchestration;
- character and product continuity where relevant;
- shot selection;
- editorial progression;
- picture-lock semantics;
- simple audio integration and finishing;
- video-master production;
- basic delivery adaptation where required;
- workflow lifecycle and decision state;
- lightweight artifact provenance;
- creative evaluation;
- technical QC policy;
- failure diagnosis;
- targeted retry and upstream revision;
- cross-project artifact handoffs.

---

## 7. Non-Goals

Video Production Skills does not own:

- generic model APIs;
- provider SDKs;
- a generic image-generation skill;
- a generic video-generation skill;
- a generic speech-generation skill;
- a static model registry;
- a static pricing catalogue;
- automatic global optimisation across providers;
- a universal provider abstraction;
- a production workflow engine;
- an artifact graph database;
- a nonlinear editing application;
- a universal creative-production schema;
- medium-independent story development, plot design, character/world development, or narrative editorial evaluation;
- advertising audience strategy, positioning, proposition, claims, campaign messaging, or cross-channel strategy;
- music composition, music-track mixing/mastering, or standalone music production;
- game-ready asset production as a general discipline;
- game development;
- a universal Creative Production framework.

Narrative, Music, Comic, Advertising, and Video Game Asset Production remain separate project domains.

---

## 8. High-Level Production Model

The canonical production grammar is:

```text
INPUT
Brief
+ optional upstream artifacts
+ source references
        ↓

CREATIVE DEFINITION
Visual Direction
├── character references
├── product references
└── environment / style references
        ↓

PREVISUALISATION
Storyboard
        ↓
Shot Plan
        ↓
Optional Animatic
        ↓

SHOT DEVELOPMENT
For each required shot:
    Storyboard Frame
        ↓
    Reference Frame
        ↓
    Optional Motion Prototype
        ↓
    Video Shot Candidate(s)
        ↓
    Selected / Approved Video Shot
        ↓

EDITORIAL
Selected Shots
        ↓
Edit Timeline
├── assembly
├── rough cut
├── fine cut
└── picture lock
        ↓

FINISHING
Locked Edit
├── shot refinement where required
├── colour / visual matching
├── graphics / titles where required
├── dialogue / sound / music integration
└── audio mix
        ↓

MASTERING
Video Master
        ↓

QUALITY
Creative Evaluation
+
Technical QC
        ↓

DELIVERY
Delivery Variant(s) where required
```

Continuity, approval state, and provenance cross the entire workflow.

Not every production requires every stage.

The agent chooses the shortest credible path for the current production problem.

---

## 9. Core Skills

The initial project contains two domain-native skills:

```text
video-production
video-evaluate
```

### 9.1 `video-production`

Owns the end-to-end production workflow.

Responsibilities include:

- interpret the brief;
- determine required production stages;
- establish visual direction;
- create and refine storyboards;
- create shot plans;
- use animatics when sequence timing is uncertain;
- develop reference frames;
- use motion prototypes when motion is uncertain;
- produce shots through upstream provider skills;
- preserve character/product/reference constraints;
- select produced shots;
- create and refine an edit timeline;
- reach picture lock;
- integrate simple audio and finishing;
- render a video master;
- preserve lightweight lineage;
- perform lightweight production gates;
- retry or revise the smallest failing unit.

### 9.2 `video-evaluate`

Owns independent evaluation and diagnosis.

Responsibilities include:

- evaluate storyboards;
- evaluate reference frames;
- evaluate motion prototypes;
- evaluate video shots;
- evaluate edit previews;
- evaluate final masters;
- assess continuity;
- assess character/product fidelity where relevant;
- analyse pacing and editorial quality;
- run basic technical QC;
- separate creative failures from execution failures;
- recommend the smallest appropriate corrective action.

`video-evaluate` must be independently usable on artifacts not created by `video-production`.

---

## 10. Execution Architecture

The selected execution architecture is **primary provider + specialist providers**.

```text
                    Video Production Skills
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
        Default Media    Specialist       Deterministic
          Execution        Audio             Tools
              ↓              ↓              ↓
        Replicate       ElevenLabs      FFmpeg/ffprobe
         Skills           Skills         ImageMagick
              ↓              ↓
         Replicate      ElevenLabs

Optional secondary image/video execution:
fal.ai / genmedia
```

### 10.1 Default image/video execution

Official Replicate Agent Skills are the default image/video discovery and execution layer.

Expected capabilities include:

- model discovery;
- model comparison;
- image prompting;
- video prompting;
- prediction execution.

Video Production Skills must not implement a direct Replicate API client.

### 10.2 Specialist audio

ElevenLabs skills may be used when the workflow requires:

- text-to-speech;
- speech-to-text;
- generated sound effects;
- selected audio cleanup capabilities.

Music composition remains outside Video Production Skills.

### 10.3 Deterministic media tools

Use FFmpeg/ffprobe for:

- media inspection;
- frame and audio extraction;
- trimming;
- concatenation;
- simple transitions;
- scaling and cropping;
- audio mixing;
- edit previews;
- master rendering;
- delivery encoding;
- technical QC evidence.

Use ImageMagick for:

- storyboard sheets;
- comparison grids;
- character/reference sheets;
- contact sheets;
- labels;
- deterministic image layouts.

### 10.4 Optional secondary execution

fal.ai/genmedia is an optional secondary image/video execution path.

Use it only when:

1. the default execution layer cannot satisfy a hard production requirement; or
2. the user explicitly selects that execution path.

The project must not automatically compare all providers for every task.

---

## 11. Production State

Three independent axes describe production state.

### 11.1 Lifecycle state

```text
draft
refine
final
```

- `draft` — explore alternatives or resolve uncertainty;
- `refine` — improve selected/approved work while preserving accepted properties;
- `final` — produce a final production input or deliverable.

### 11.2 Decision state

```text
open
selected
approved
locked
```

- `open` — still under exploration;
- `selected` — preferred option chosen for further work;
- `approved` — downstream production may rely on it;
- `locked` — downstream production may assume the decision will not change.

### 11.3 Production policy

```text
economy
balanced
quality
```

Production policy is independent from lifecycle and decision state.

A draft may require a high-capability execution path.

A final artifact may be produced inexpensively when the requirement is already satisfied.

---

## 12. Draft Strategy

The governing rule is:

> **A draft is the cheapest useful representation that can resolve the current production uncertainty without prematurely paying for downstream fidelity.**

Examples:

| Production question | Preferred representation |
|---|---|
| What should the video look like? | visual-direction draft |
| Does the sequence work? | storyboard |
| Does the timing work? | animatic |
| Does the composition work? | reference frame |
| Does the camera/action work? | motion prototype |
| Is the final motion usable? | video shot |
| Does the sequence cut well? | edit preview |

Multiple alternatives should be generated only when genuine comparison is useful.

A `draft_set` represents deliberate creative exploration, not every set of execution alternatives.

---

## 13. Selection and Approval

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

Picture lock is a specialised `locked` state on the edit timeline, not another lifecycle stage.

---

## 14. Promotion and Refinement

Downstream artifacts should inherit the relevant approved decisions from upstream artifacts.

Typical progression:

```text
brief
 ↓
visual_direction
 ↓
storyboard
 ↓
shot_plan
 ↓
reference_frame
 ↓
motion_prototype
 ↓
video_shot
 ↓
edit_timeline
 ↓
video_master
 ↓
delivery_variant
```

Promotion does not mean each artifact mechanically transforms into the next.

It means downstream work must preserve the approved decisions relevant to it.

---

## 15. Failure and Retry Policy

Before retrying, classify the failure.

```text
execution / transient failure
→ retry the same execution once

capability failure
→ discover a compatible model
→ use optional secondary execution only if required

prompt failure
→ revise instructions

reference failure
→ revise or replace the reference

composition failure
→ revise reference frame

motion failure
→ revise motion prototype or shot instructions

shot-design failure
→ revise shot plan

sequence failure
→ revise storyboard

editorial failure
→ revise edit timeline

technical delivery failure
→ correct deterministic render / delivery settings
```

Do not solve structural production failures by automatically increasing generation cost.

---

## 16. Evaluation Policy

Evaluation intensity depends on artifact type and lifecycle state.

### Draft

Ask only whether the artifact can support the decision it was created to test.

### Refine

Verify:

- requested correction succeeded;
- approved properties were preserved;
- continuity remains acceptable;
- no major regression was introduced.

### Final

Run all applicable:

- production-alignment checks;
- continuity checks;
- identity/product fidelity;
- motion quality;
- editorial quality;
- audio checks;
- technical media QC;
- delivery validation where required.

Evaluation should diagnose the failure layer and recommend an action, not merely produce a score.

---

## 17. Cross-Project Artifact Handoffs

Composition should happen through artifacts before runtime dependencies.

### May consume from Narrative Production Skills

```text
story brief
character profile
world bible
screenplay
scene plan
dialogue
```

Treat these as upstream story constraints. Video Production Skills may translate them into staging, shots, camera, timing, and edit decisions, but it does not take ownership of plot, character arcs, world logic, or medium-independent narrative development.

### May consume from Advertising Production Skills

```text
campaign brief
audience constraints
proposition
approved claims
video concept
CTA
```

Advertising owns campaign strategy. Video Production Skills owns video execution.

Treat campaign artifacts as upstream strategic constraints. Video Production Skills may execute the supplied concept, claims, CTA, and audience requirements, but it does not redefine positioning, proposition, claims strategy, or cross-channel campaign logic.

### May consume from Music Production Skills

```text
music track
stems
timing map
audio brief
```

Video Production Skills owns integration into the video, not general composition.

Any `audio_mix` produced here is the picture/program mix for the video. It does not replace or redefine the internal mix/master of a supplied music track.

### May consume from Video Game Asset Production Skills

```text
character design sheet
environment sheet
prop reference
game-ready visual reference
```

Use these as production references. Video Production Skills does not take ownership of reusable game-ready asset production merely because a game asset is used in a video.

### Comic Production Skills

No canonical Comic → Video runtime dependency or shared artifact schema is required initially. Supplied comic artwork may be consumed as a generic visual reference. Comic panels and video storyboard frames remain separate production concepts until repeated implementation proves a stable shared contract.

### May produce for other projects

```text
character sheet
visual references
storyboard
reference frame
video shot
video master
delivery variant
evaluation report
qc report
```

No shared schema should be extracted until another domain independently converges on substantially equivalent semantics.

---

## 18. Core Proof Boundary

The first complete vertical implementation must prove:

```text
Brief
 ↓
Visual Direction
 ↓
Storyboard Draft
 ↓
Select / Approve
 ↓
Shot Plan
 ↓
Reference Frames
 ↓
Video Shots
 ↓
Select Shots
 ↓
Simple Edit Timeline
 ↓
Video Master
 ↓
Evaluation + QC
```

Throughout the workflow it must demonstrate:

```text
approved decisions persist
+
lineage persists
+
local retry works
+
provider execution remains external
```

The recommended end-to-end scenario is a short three-shot character sequence with one provided visual reference.

---

## 19. Build Order

Implement vertically.

```text
1. video-production:
   brief → visual direction → storyboard → shot plan

2. reference-frame production through default provider skills

3. video-shot production and shot selection

4. simple edit timeline + FFmpeg master render

5. video-evaluate:
   artifact readiness + technical QC + diagnosis

6. end-to-end core proof

7. installability and external smoke test
```

Do not implement specialist workflows before the core proof passes.

---

## 20. Deferred Improvements

The following ideas are valid but intentionally outside the first implementation.

### Follow-up specialisations

- full character-design workflow;
- product-video specialisation;
- UGC specialisation;
- advanced editorial skill;
- advanced audio-post workflow;
- multi-platform delivery automation;
- dedicated technical-QC skill;
- standalone visual-direction or planning skills.

### Follow-up interoperability

- OpenTimelineIO interchange;
- richer NLE handoffs;
- secondary fal.ai execution path in automated tests;
- platform-specific delivery profiles.

### Follow-up production sophistication

- advanced compositing;
- colour pipelines;
- Foley and ADR;
- stem and M&E workflows;
- advanced loudness handling;
- richer animatics;
- broadcast-grade QC.

### Explicitly deferred infrastructure

Do not introduce until real production evidence requires it:

- generic `VideoProvider` interface;
- cross-provider optimiser;
- provider/model database;
- workflow engine;
- artifact graph database;
- universal artifact schema;
- complex lifecycle state machine;
- full editing engine.

A deferred concept should be promoted only when concrete workflows prove that it reduces more complexity than it adds.

---

## 21. Extraction Policy

Potential cross-domain abstractions belong in:

```text
docs/2026-08-20-extraction-candidates.md
```

A concept may move into Creative Production Skills only when:

1. at least two production domains independently implement it;
2. the semantics are substantially equivalent;
3. a stable reusable contract exists;
4. extraction reduces more complexity than it adds.

Potential candidates include:

- draft-set semantics;
- artifact provenance;
- promotion/refinement semantics;
- decision-state semantics;
- staged evaluation;
- video visual-direction / broader art-direction semantics;
- shared character identity concepts.

All remain `observe only` until the criteria are met.

---

## 22. System Acceptance Criteria

The system is correctly designed when:

1. the project has exactly the domain skills required by proven workflows rather than provider-shaped symmetry;
2. `video-production` and `video-evaluate` are the initial core skills;
3. provider/model integration remains below domain production behaviour;
4. Replicate skills own default image/video model discovery and execution;
5. ElevenLabs is used only for specialist audio capabilities when required;
6. FFmpeg/ffprobe and ImageMagick own deterministic media operations;
7. fal.ai/genmedia remains an optional secondary execution path rather than a universal router;
8. no custom provider SDK or static model/pricing catalogue exists;
9. lifecycle, decision state, and production policy remain independent;
10. visual direction, storyboard, shot plan, reference frame, video shot, edit timeline, and video master have explicit production semantics;
11. optional stages remain optional;
12. approved work is preserved downstream;
13. retries operate on the smallest relevant production unit;
14. evaluation distinguishes creative judgement from technical QC;
15. evaluation recommends corrective actions rather than only scores;
16. cross-project composition happens through artifacts;
17. the core proof reaches an actual edited video master rather than stopping at generated shots;
18. deferred improvements remain deferred until production evidence justifies them;
19. shared abstractions are extracted only after proven duplication.

---

**Video Production Skills — Creative Skills System Specification v3**
