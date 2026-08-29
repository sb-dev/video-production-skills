# Video Production Customisation Packs Specification

## 1. Purpose

Video Production Customisation Packs provide reusable creative production profiles for `video-production`.

A pack defines **what kind of video should be produced** without replacing the production workflow itself.

```text
video-production
→ knows how to produce video

customisation pack
→ defines the production language for a particular kind of video
```

A pack may define:

```text
format
+
genre
+
style
+
audience
+
optional voice casting
```

It may also provide production-specific direction for cinematography, motion, editing, audio, graphics, delivery, and evaluation.

Customisation packs are distributed as installable Agent Skills and consumed as peer skills by `video-production`.

---

## 2. Status

This is a **supplemental Video Production Skills specification**.

It does not replace the three canonical Creative Production Skills specs:

```text
docs/01-creative-skills-system-spec.md
docs/02-creative-skills-workflows-and-artifacts-spec.md
docs/03-creative-skills-repository-and-contracts-spec.md
```

The canonical specs continue to own the core production system, workflow, artifact model, repository structure, and skill contracts.

This spec owns only the customisation-pack concept and its integration with `video-production` and `video-evaluate`.

---

## 3. Goals

Customisation packs should:

- make a recognisable production language reusable across projects;
- combine format, genre, style, audience, and optional voice direction into one coherent package;
- influence the entire production workflow rather than acting as a single generation prompt;
- preserve approved creative decisions throughout downstream production;
- adapt evaluation criteria to intentional stylistic choices;
- remain optional;
- install independently through the Agent Skills ecosystem;
- avoid adding provider execution logic that already belongs to provider skills or deterministic tools.

---

## 4. Non-Goals

Customisation packs do not:

- replace `video-production`;
- replace `video-evaluate`;
- implement image, video, or audio provider APIs;
- own screenplay or narrative development;
- own advertising strategy or positioning;
- own music composition or music mastering;
- require a universal style-composition engine;
- require users to install separate skills for every format, genre, style, and voice attribute;
- silently override explicit user instructions or approved upstream artifacts.

---

## 5. Core Model

A customisation pack represents a **coherent creative production recipe**.

```text
CUSTOMISATION PACK

Format
   +
Genre
   +
Style
   +
Audience
   +
Voice casting (optional)
        ↓
Production profile
        ↓
video-production
        ↓
video-evaluate
```

A pack should be usable as a complete unit.

Users should not normally need to assemble a production from several low-level configuration skills such as:

```text
video-format-commercial
video-genre-horror
video-style-clay
video-voice-narrator-01
```

Ready-made packs should combine compatible decisions into one installable skill.

Modular composition may be explored later if repeated real-world use demonstrates that users need it.

---

## 6. Pack Dimensions

### 6.1 Format

Format defines **what is being delivered**.

Example formats:

```text
cinematic-short
commercial
music-video
documentary-short
explainer
social-video
vertical-short
product-film
trailer
opening-title-sequence
```

A format may define:

- typical duration;
- aspect ratio;
- delivery variants;
- shot density;
- pacing expectations;
- title and credit conventions;
- graphics requirements;
- audio expectations;
- platform-specific constraints.

Format does not define the complete artistic style.

---

### 6.2 Genre

Genre defines dramatic and audience expectations.

Example genres:

```text
science-fiction
horror
thriller
comedy
romance
action
fantasy
documentary
noir
western
musical
```

A genre may influence:

- dramatic rhythm;
- shot language;
- lighting tendencies;
- performance direction;
- sound language;
- editing conventions;
- recurring genre expectations.

Genre direction must not replace deeper narrative development owned by Narrative Production Skills.

---

### 6.3 Style

Style defines the visual, material, motion, and cinematographic treatment of the production.

A style must be expressed through operational production characteristics rather than only a label.

For example:

```yaml
style: puppet-animation

visual:
  materials:
    - visible fabric
    - miniature painted surfaces
    - practical textures

motion:
  cadence: stop-motion
  character_movement: deliberately incremental
  imperfections: preserve subtle handmade variation

camera:
  scale: miniature-set cinematography
  movement: restrained
  depth_of_field: shallow

lighting:
  approach: practical miniature lighting
```

A style pack should tell the production system what must remain recognisable across reference frames, generated shots, edits, and evaluation.

---

### 6.4 Audience

Audience is optional but recommended when it materially changes production decisions.

Examples:

```text
children
family
teen
general-adult
professional
luxury-consumer
technical-audience
```

The same style and genre may produce substantially different results for different audiences.

For example:

```text
claymation
+ adventure
+ children
```

is not equivalent to:

```text
claymation
+ psychological horror
+ adults
```

Audience may influence:

- visual intensity;
- performance;
- pacing;
- dialogue density;
- humour;
- graphic treatment;
- sound intensity;
- content boundaries.

---

### 6.5 Optional Voice Casting

A pack may contain no voice configuration, general voice direction, or references to specific licensed provider voices.

Example:

```yaml
voices:
  narrator:
    role: narrator
    direction: calm, mature, understated
    provider: elevenlabs
    voice_id: optional-provider-voice-id

  protagonist:
    role: lead
    direction: energetic, dry humour
    provider: elevenlabs
    voice_id: optional-provider-voice-id
```

Voice configuration may define:

- role;
- vocal character;
- age range where useful;
- performance direction;
- accent or language where appropriate;
- provider;
- provider voice identifier;
- pronunciation notes;
- consistency requirements.

Packaged voice references must use voices the pack author is permitted to distribute or reference.

A customisation pack must not require voice casting when the production has no spoken audio.

---

## 7. Style Catalogue

The initial style catalogue may include the following groups.

### Traditional and 2D Animation

```text
cel-animation
rubber-hose-animation
anime-limited-animation
rotoscoped-animation
```

Typical production concerns include:

- line quality;
- frame cadence;
- drawing consistency;
- controlled deformation;
- pose design;
- painted or illustrated backgrounds;
- selective motion;
- camera treatment appropriate to 2D artwork.

### Stop Motion and Tactile Animation

```text
paper-cutout-animation
claymation
pixilation
puppet-animation
paint-on-glass
sand-animation
```

Typical production concerns include:

- tactile materials;
- incremental movement;
- handmade variation;
- miniature scale;
- practical lighting language;
- material continuity;
- deliberate stop-motion cadence.

### 3D and Computer Graphics

```text
photoreal-cgi
stylised-3d
machinima
low-poly-3d
```

Typical production concerns include:

- geometry consistency;
- material treatment;
- rendering language;
- animation cadence;
- lighting model;
- environmental coherence;
- intentional realism or non-photorealism.

### Motion Graphics and Digital Design

```text
vector-flat-design
kinetic-typography
whiteboard-animation
2-5d-parallax
```

Typical production concerns include:

- layout;
- graphic hierarchy;
- typography;
- timing;
- transitions;
- synchronisation with voice or music;
- legibility across delivery formats.

### Live-Action Cinematographic Styles

```text
found-footage
mockumentary
continuous-take
cinema-verite
```

Typical production concerns include:

- camera behaviour;
- lens and framing language;
- performance naturalism;
- lighting realism;
- coverage strategy;
- editing conventions;
- intentional imperfection.

---

## 8. Production Profile

A pack should translate its high-level dimensions into a production profile that `video-production` can apply.

The profile may define:

```text
visual language
cinematography
lighting
motion language
performance direction
editing language
audio direction
graphics / typography
delivery constraints
evaluation criteria
```

Example:

```yaml
pack: found-footage-horror

format:
  type: cinematic-short
  duration: 45-90s
  aspect_ratio: 16:9

genre:
  type: horror

audience:
  type: general-adult

style:
  type: found-footage

cinematography:
  camera: handheld-consumer-camera
  framing: reactive
  focus: imperfect-but-readable
  exposure: practical-light-driven

motion:
  camera_movement: operator-driven
  stabilisation: minimal

editing:
  continuity: intentionally rough
  cuts: motivated-by-recording-events

sound:
  perspective: camera-local
  ambience: prominent
  polish: restrained

evaluation:
  do_not_penalise:
    - intentional handheld instability
    - minor exposure variation
    - imperfect framing
  still_require:
    - readable action
    - coherent spatial progression
    - consistent recording-device language
```

---

## 9. Decision Precedence

A customisation pack provides defaults and constraints but must not silently override stronger production decisions.

Use this precedence:

```text
1. explicit user instructions
2. approved upstream artifacts and approved production decisions
3. selected customisation pack
4. video-production defaults
```

If the pack conflicts with an approved artifact, `video-production` should surface the conflict rather than silently changing either one.

---

## 10. Integration with `video-production`

`video-production` must remain fully usable without a customisation pack.

```text
video-production
       │
       ├── no pack
       │   → derive production direction from the brief
       │
       └── customisation pack
           → inherit predefined production language
```

When a pack is active, `video-production` should apply it to relevant stages including:

```text
brief interpretation
visual direction
storyboard
shot planning
reference frames
motion prototypes
video-shot generation
shot selection
editing
audio integration
finishing
delivery variants
```

The pack should influence only the stages relevant to its production profile.

A kinetic-typography pack may strongly affect graphics and timing while having little or no character-performance guidance.

A puppet-animation pack may strongly affect materials, motion cadence, camera scale, and lighting while having no typography rules.

### 10.1 Command-aware production guidance

A pack may specialise relevant `video-production` commands without replacing them.

Example:

```text
claymation-family-adventure

define-direction
→ tactile clay materials, miniature scale, warm practical lighting

create-reference
→ preserve model proportions, fingerprints, handmade surfaces

generate-shot
→ deliberate stop-motion cadence; avoid accidental smoothing

assemble-edit
→ preserve readable family pacing and tactile continuity

refine
→ never "fix" intentional stepped motion by smoothing it
```

Pack guidance should be scoped to commands where it changes production behaviour. Do not require every pack to define overrides for every command.

The core command contract still owns inputs, outputs, preservation semantics, and production boundaries. The pack supplies production-language constraints.

---

## 11. Integration with `video-evaluate`

Customisation packs must be able to adjust evaluation expectations.

This prevents intentional stylistic characteristics from being treated as defects.

Examples:

```text
stop-motion
→ stepped motion can be intentional

found footage
→ unstable handheld framing can be intentional

limited animation
→ selective movement can be intentional

low-poly 3D
→ simplified geometry can be intentional

cinéma vérité
→ imperfect composition can be intentional
```

A pack may therefore define:

```yaml
evaluation:
  preserve:
    - handmade frame cadence
    - tactile material variation

  do_not_penalise:
    - intentional stepped motion

  reject:
    - accidental photoreal materials
    - interpolation that destroys stop-motion cadence
    - character material drift
```

A pack may also specialise evaluation commands:

```text
evaluate
→ apply the pack's quality target

check-motion
→ distinguish intentional cadence from motion defects

check-fidelity
→ preserve pack-specific materials, geometry, graphic language, or camera treatment

diagnose
→ route pack violations to the smallest owning production command
```

`video-evaluate` must still detect unintended failures such as:

- identity drift;
- broken continuity;
- unreadable action;
- product deformation;
- accidental artifacts;
- technical QC failures;
- deviations from approved pack constraints.

The pack changes the quality target, not the requirement for quality.

---

## 12. Agent Skills Packaging

Customisation packs should be distributed as Agent Skills.

Example repository:

```text
video-customisation-packs/
├── README.md
├── LICENSE
├── skills/
│   ├── anime-sci-fi-short/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   │   ├── production-profile.md
│   │   │   ├── visual-language.md
│   │   │   ├── cinematography.md
│   │   │   ├── motion.md
│   │   │   └── voice-casting.md
│   │   └── evals/
│   │
│   ├── claymation-family-short/
│   ├── found-footage-horror/
│   └── premium-product-film/
└── evals/
    └── end-to-end/
```

Only create references that the pack actually needs.

A simple pack may consist only of:

```text
SKILL.md
references/production-profile.md
```

Do not create empty files or directories for structural symmetry.

---

## 13. Pack Skill Contract

Each pack `SKILL.md` should define:

```text
pack identity
intended use
format
genre
style
audience when relevant
optional voice requirements
production constraints
what must remain consistent
integration with video-production
integration with video-evaluate
external skill/provider requirements
```

A pack should instruct the agent to apply the profile rather than reproduce the pack documentation verbatim in production outputs.

---

## 14. Example Ready-Made Packs

### `retro-cartoon-comedy`

```text
Format: animated short
Genre: comedy
Style: rubber-hose animation
Audience: family / general
Voices: optional ensemble cast
```

Primary concerns:

```text
bouncy rhythmic movement
rubber-hose limb behaviour
simple graphic shapes
period-inspired motion language
comic timing
```

### `tactile-childrens-story`

```text
Format: narrative short
Genre: family adventure
Style: puppet animation
Audience: children / family
Voices: narrator + optional characters
```

Primary concerns:

```text
handmade materials
miniature environments
warm practical lighting
clear silhouettes
readable character performance
```

### `anime-sci-fi-short`

```text
Format: cinematic short
Genre: science fiction
Style: limited 2D animation
Audience: teen / adult
Voices: optional multilingual cast
```

Primary concerns:

```text
detailed key artwork
selective movement
dynamic composition
strong lighting states
dramatic editorial rhythm
```

### `found-footage-horror`

```text
Format: cinematic short
Genre: horror
Style: found footage
Audience: adult
Voices: naturalistic dialogue where required
```

Primary concerns:

```text
recording-device consistency
operator-driven camera movement
practical lighting
naturalistic performance
intentional visual imperfection
```

### `premium-product-launch`

```text
Format: commercial / product film
Genre: advertising
Style: photoreal live-action / CGI
Audience: premium consumer
Voices: optional restrained commercial narrator
```

Primary concerns:

```text
product fidelity
controlled lighting
materials and reflections
precise motion
brand graphics
delivery variants
```

---

## 15. Installation

A pack is installed independently from `video-production`.

Example:

```bash
npx skills add <org>/video-customisation-packs \
  --skill claymation-family-short \
  --agent claude-code
```

A consuming project may install:

```bash
npx skills add <org>/video-production-skills \
  --skill video-production \
  --skill video-evaluate \
  --agent claude-code

npx skills add <org>/video-customisation-packs \
  --skill claymation-family-short \
  --agent claude-code
```

The pack is a peer capability, not a runtime dependency embedded inside `video-production`.

---

## 16. Consumer Usage

A user may invoke a pack explicitly:

```text
Use video-production with the claymation-family-short customisation pack to produce this brief.
```

Or:

```text
Produce this as a found-footage horror short using the installed found-footage-horror pack.
```

The resulting production should inherit the pack's constraints through downstream artifacts rather than repeatedly reinterpreting the style from the original brief.

---

## 17. Authoring Rules

Pack authoring starts from a production need, not from a proposed new skill.

```text
production need
→ inspect current catalogue
→ decide reuse / adapt / create
→ define coherent profile
→ author pack
→ create showcase + evals
→ validate
→ catalogue only after acceptance
```

### 17.1 Pack Necessity

Create a new pack only when the requested profile introduces a stable reusable production grammar that is not already represented.

A materially new pack may change one or more of:

```text
visual production grammar
cinematography grammar
motion / performance grammar
editing grammar
audio / voice treatment
delivery requirements
preservation rules
pack-aware evaluation target
cross-project handoff
```

Do not create a new pack when:

```text
existing pack already fits
→ reuse it

existing pack + project-specific direction is sufficient
→ adapt or override locally
```

This prevents a catalogue of near-duplicate style adjectives and delivery variants.

### 17.2 Hard Constraints and Defaults

Every pack should distinguish hard requirements from softer production defaults.

Typical hard constraints include:

```text
required format
approved character or product identity
mandatory brand/text content
required aspect/delivery format
licensed voice dependency
explicit continuity constraints
```

Typical defaults include:

```text
lighting preference
camera tendency
motion cadence
editing rhythm
sound treatment
graphics treatment
```

Genre and style guidance should not become hard failure conditions unless the production actually requires them.

### 17.3 Operational Profile

A customisation pack should:

- describe production characteristics, not merely name a style;
- contain enough direction to preserve the intended production language across multiple shots;
- define which characteristics are intentional and must survive evaluation;
- define genuine defects separately from intentional imperfections;
- define how relevant `video-production` and `video-evaluate` behaviour changes;
- define revision behaviour where pack traits must survive local correction;
- define downstream handoffs without taking over another production domain;
- avoid provider-specific execution logic unless a provider capability is an explicit pack requirement;
- keep optional voice casting separate from mandatory visual production behaviour;
- avoid unnecessary files and configuration layers;
- remain understandable and useful as one installed skill.

A pack should not attempt to reproduce a specific copyrighted work shot-for-shot or depend on an individual creator's name as its entire style definition.

### 17.4 Authoring Skill

`video-extension-pack-creator` is the optional authoring skill. It is an installable skill directory, not a standalone `SKILL.md` file:

```text
skills/video-extension-pack-creator/
├── SKILL.md
├── commands/
│   ├── define-pack.md
│   ├── derive-production-profile.md
│   ├── define-evaluation-profile.md
│   ├── define-voice-profile.md
│   ├── create-skill-package.md
│   ├── create-evals.md
│   ├── create-showcase.md
│   ├── create-catalogue-entry.md
│   └── validate-pack.md
├── references/
├── scripts/
└── evals/
```

The existing nine command contracts remain authoritative. Do not rename them merely to match another Creative Production Skills project.

`define-pack` must inspect the catalogue and decide whether to reuse, adapt, or create before a new pack is defined. `create-catalogue-entry` may register a pack only after `validate-pack` succeeds.

These are bounded authoring operations inside one installable skill. They are not separate Agent Skills.

### 17.5 Catalogue and Showcase Surfaces

The implemented catalogue should use:

```text
extension-packs/manifest.json
extension-packs/<pack>/README.md
```

The pack README is the authoritative showcase and generation-prompt source. The installable runtime package remains under:

```text
skills/<pack>/
```

The installed pack must not depend on repository-level `extension-packs/`, `benchmarks/`, `docs/`, or `examples/` at runtime.

---

## 18. Evaluation and Evals

Every pack should include lightweight evals proving that an agent can:

```text
recognise when the pack is relevant
apply the pack to visual direction
apply the pack to shot planning
preserve pack constraints across multiple shots
adapt evaluation criteria correctly
avoid applying the pack when it was not requested
respect explicit user overrides
respect approved upstream artifacts
```

Where voices are included, evals should also verify:

```text
correct voice role selection
voice consistency across scenes
provider reference resolution where applicable
no voice requirement for productions without spoken audio
```

Provider-backed generation evals may be separated from cheap structural and behavioural evals when they incur meaningful cost.

---

## 19. Acceptance Criteria

A customisation pack is ready for use when:

```text
✓ installs independently as an Agent Skill
✓ has a clear coherent production identity
✓ defines format, genre, and style
✓ defines audience when materially relevant
✓ voice casting is optional unless spoken audio is intrinsic to the pack
✓ production characteristics are operational, not only descriptive labels
✓ video-production can apply the pack across relevant artifacts
✓ video-evaluate can distinguish intentional style traits from defects
✓ explicit user instructions override pack defaults
✓ approved upstream artifacts are not silently rewritten
✓ pack does not duplicate provider execution logic
✓ a new pack is justified rather than a trivial near-duplicate
✓ hard constraints and softer defaults are distinguishable
✓ canonical showcase prompt is registered in the implemented catalogue
✓ catalogue inclusion has benchmark coverage
✓ at least one realistic example production demonstrates the pack
✓ behavioural evals pass
✓ pack guidance is scoped to relevant core commands rather than redefining the workflow
✓ pack-aware evals can target the affected production/evaluation command
```

---

## 20. Deferred Extensions

Do not implement these until real pack usage demonstrates the need:

```text
independent format skills
independent genre skills
independent style skills
independent voice-cast skills
pack inheritance
pack composition engine
pack marketplace metadata
automatic pack recommendation
automatic pack mixing
provider-specific style optimisation
central style ontology
```

These are potential follow-up improvements, not requirements for the initial customisation-pack system.

---

## 21. Initial Implementation Order

```text
1. define the pack contract
2. create 3–5 coherent ready-made packs
3. integrate pack consumption into video-production
4. integrate style-aware criteria into video-evaluate
5. add pack behavioural evals
6. exercise packs against real example productions
7. refine the contract from observed production failures
8. only then reconsider modular composition
```

The first pack set should deliberately cover different production modes rather than minor variations of the same aesthetic.

Recommended initial set:

```text
anime-sci-fi-short
claymation-family-short
found-footage-horror
premium-product-launch
kinetic-typography-explainer
```

---

**Video Production Customisation Packs Specification**  
**Version 3.1 — 27 August 2026**
