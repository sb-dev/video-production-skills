# Implementation Prompt — Generate the Video Extension Pack Catalogue

Implement the Video Production extension-pack catalogue as a **real repository catalogue**, generated from the current customisation-pack and extension-pack specifications.

The catalogue must become a first-class repository surface rather than remaining only as prose inside `docs/`.

## Goal

Materialise every currently approved Video Production extension pack as:

```text
catalogue entry
+
showcase production
+
copy-ready generation prompt
+
installable Agent Skill package
+
behavioural eval coverage
+
benchmark coverage
```

Keep the concerns separate:

```text
extension-packs/
→ human discovery
→ catalogue metadata
→ showcase production
→ authoritative generation prompt

Naming rule:

```text
Concept / product name
→ Extension Pack Catalogue

Repository folder
→ extension-packs/
```

Do not use `catalogue/` as the repository folder name.

skills/<pack>/
→ installable Agent Skill implementation

benchmarks/
→ quality measurement of the catalogue

video-extension-pack-creator
→ authoring new catalogue entries and pack packages
```

Do not turn the catalogue into a marketplace or pack-composition framework.

---

## Start by inspecting the repository

Before changing anything:

1. inspect `README.md`;
2. inspect:
   - `docs/01-creative-skills-system-spec.md`
   - `docs/02-creative-skills-workflows-and-artifacts-spec.md`
   - `docs/03-creative-skills-repository-and-contracts-spec.md`
   - `docs/04-testing-and-benchmark-spec.md`;
3. inspect the current Video Customisation Packs specification;
4. inspect the current Video Extension Pack Catalogue specification;
5. inspect `video-extension-pack-creator`;
6. inspect all existing `skills/*`;
7. inspect existing examples and showcase material;
8. inspect `benchmarks/manifest.json` if benchmark standardisation has already been implemented;
9. inspect repository validation and install-smoke tooling;
10. run the current deterministic repository checks before editing.

Record the pre-change result.

Use the repository's current catalogue specification as the source of truth.

Do not hard-code a pack count from this prompt if the specification has changed.

---

# 1. Repository Structure

Create a first-class extension-pack surface:

```text
extension-packs/
├── README.md
├── manifest.json
│
├── hand-drawn-fantasy-short/
│   └── README.md
├── retro-cartoon-comedy/
│   └── README.md
├── anime-sci-fi-short/
│   └── README.md
└── ...
```

The exact pack directories must be derived from the current Extension Pack Catalogue specification.

Keep the actual installable Agent Skills under the standard skill surface:

```text
skills/
├── video-production/
├── video-evaluate/
├── video-extension-pack-creator/
├── hand-drawn-fantasy-short/
├── retro-cartoon-comedy/
├── anime-sci-fi-short/
└── ...
```

Do **not** move installable skills under:

```text
extension-packs/<pack>/skills/
```

or:

```text
extension-packs/skills/
```

The `extension-packs/` folder is the discovery/showcase surface for the Extension Pack Catalogue.

The `skills/` directory remains the Agent Skills distribution surface.

---

# 2. Catalogue Manifest

Create:

```text
extension-packs/manifest.json
```

It is the machine-readable authority for the Extension Pack Catalogue.

For each pack include only useful fields such as:

```text
slug
name
family
format
genre
style
audience
voices
skillPath
cataloguePath
benchmarkCase
status
```

Use optional fields where appropriate.

Do not add speculative marketplace metadata such as:

```text
ranking
downloads
price
rating
featuredScore
publisherReputation
```

unless a real future distribution system requires them.

The manifest must be generated or validated against the actual catalogue directories and installable skills.

---

# 3. Catalogue Families

Preserve the current production-style families from the catalogue specification.

Expected families currently include the equivalents of:

```text
Traditional and 2D Animation
Stop Motion and Tactile Animation
3D and Computer Graphics
Motion Graphics and Digital Design
Live-Action Cinematographic Styles
Commercial / Product
```

Do not invent new family taxonomy merely to balance counts.

Use the current specification if its groups differ.

---

# 4. Catalogue Entry Contract

Every:

```text
extension-packs/<pack-slug>/README.md
```

must contain a concise, consistent catalogue entry.

Required structure:

```markdown
# <Pack Name>

**Pack:** `<pack-slug>`

<one short paragraph explaining the production identity>

## Production profile

**Format:** ...
**Genre:** ...
**Style:** ...
**Audience:** ...
**Voices:** ...

## What this pack changes

- ...
- ...
- ...

## Showcase

### <Showcase title>

<short production concept>

## Prompt

```text
<exact copy-ready generation prompt>
```

## Expected production traits

- ...
- ...

## Evaluation focus

- ...
- ...

## Install

```bash
npx skills add <actual-repository> \
  --skill <pack-slug> \
  --agent claude-code
```
```

Use the repository's actual verified identity.

Do not invent or guess repository URLs.

If repository identity cannot be established from the working repository, use the project's established placeholder convention rather than inserting an unrelated GitHub repository.

---

# 5. Authoritative Showcase Prompt

The extension-pack entry is the authoritative showcase for an extension pack.

Use:

```text
extension-packs/<pack>/README.md
```

as the single source of truth for that pack's showcase prompt.

Do not maintain a duplicate prompt in:

```text
examples/<pack>/README.md
```

unless the repository already has materially different example content that justifies retaining it.

If old extension-pack examples duplicate the same showcase:

```text
migrate useful content into extension-packs/<pack>/README.md
→ update references
→ remove the duplicate only when safe
```

Progressive core Video Production examples remain under `examples/`.

Extension-pack showcases belong under `extension-packs/`.

---

# 6. Generation Prompt Standard

Every pack must contain an exact fenced `## Prompt` block.

The prompt must be directly usable.

It should:

```text
name video-production
name the extension pack
state the intended production
state key duration/aspect requirements where relevant
state the defining pack-specific production challenge
request the relevant production workflow rather than a raw provider call
```

Example pattern:

```text
Use video-production with the <pack-slug> extension pack to produce ...

Preserve ...
Demonstrate ...
Generate ...
Evaluate ...
```

Do not make prompts generic.

The showcase prompt should expose what makes the pack distinct.

Bad:

```text
Make a cool anime video.
```

Better:

```text
Use video-production with the anime-sci-fi-short extension pack to create a 20-second three-shot science-fiction sequence ...
```

The prompt must be strong enough to expose both:

```text
pack adherence
+
pack-specific failure modes
```

---

# 7. Pack Skill Package

For every catalogue pack, create or validate:

```text
skills/<pack-slug>/
├── SKILL.md
├── references/
│   └── production-profile.md
└── evals/
    └── evals.json
```

Create additional files only when useful.

Possible optional references:

```text
visual-language.md
cinematography.md
motion.md
voice-casting.md
graphics.md
delivery.md
```

Do not create them for symmetry.

A simple coherent pack is better than a directory full of empty decomposition.

---

# 8. Pack `SKILL.md`

Each pack `SKILL.md` must define:

```text
pack identity
activation / intended use
format
genre
style
audience where relevant
optional voice direction
production behaviour
must-preserve traits
intentional traits evaluation must tolerate
genuine failure conditions
integration with video-production commands
integration with video-evaluate commands
user-instruction precedence
approved-artifact precedence
provider requirements only when genuinely necessary
boundaries
```

A style label is not enough.

For example, do not stop at:

```text
Style: claymation
```

Translate it into operational behaviour such as:

```text
tactile clay material
handmade surface variation
stop-motion cadence
miniature-set cinematography
model proportion continuity
practical-lighting feel
```

---

# 9. Command-Aware Pack Behaviour

Packs do not need their own command system.

Instead, define how each pack affects the relevant existing Video Production commands.

For example:

```text
define-direction
→ establish pack visual language

create-storyboard
→ apply pack composition/staging conventions

create-reference
→ preserve pack materials/render language

generate-shot
→ apply pack motion/performance behaviour

assemble-edit
→ apply pack pacing/edit grammar where relevant

integrate-audio
→ apply pack voice/audio direction where relevant

evaluate
→ judge against pack intent

check-motion
→ distinguish intended cadence from defects

check-fidelity
→ preserve pack-specific materials/design traits
```

Only document command effects that genuinely matter to that pack.

Do not create a giant command-by-pack matrix merely for completeness.

---

# 10. Evaluation Contract

Every pack must explicitly separate:

```text
preserve
tolerate
reject
```

Example:

```text
preserve
→ tactile clay material
→ character proportions
→ miniature scale

tolerate
→ intentional stepped motion
→ subtle handmade surface variation

reject
→ accidental smooth interpolation
→ model material drift
→ character geometry drift
→ broken continuity
```

The pack changes the quality target.

It does not excuse genuine production defects.

---

# 11. Voice Casting

Voice configuration remains optional.

A catalogue entry may define:

```text
no voice configuration
voice direction only
licensed/provider voice reference
```

Do not invent provider voice IDs.

Do not make imitation of a real identifiable actor the defining behaviour of a pack.

For voice-enabled packs define only useful information such as:

```text
role
performance direction
language
accent where relevant
pronunciation notes
consistency requirements
provider reference where authorised
```

---

# 12. Behavioural Evals

Every catalogue pack must have behavioural eval coverage.

At minimum test:

```text
pack activates when requested
pack does not activate when not requested
pack affects visual direction
pack affects relevant production artifacts
pack preserves traits across shots where applicable
pack-aware evaluation accepts intentional traits
pack-aware evaluation rejects genuine defects
explicit user instructions override pack defaults
approved upstream artifacts override conflicting pack defaults
```

Voice-enabled packs additionally test:

```text
role correctness
voice/performance consistency
no invented voice identifier
```

Use command-targeted evals where command decomposition exists.

Do not inflate eval counts with trivial restatements.

---

# 13. Catalogue Acceptance Gate

A pack enters `extension-packs/manifest.json` only when:

```text
✓ installable Agent Skill exists
✓ valid SKILL.md
✓ coherent format / genre / style combination
✓ audience defined where relevant
✓ operational production profile exists
✓ intentional traits are explicit
✓ genuine defects are explicit
✓ precedence rules are respected
✓ no unnecessary provider implementation exists
✓ behavioural evals exist
✓ catalogue README exists
✓ showcase is pack-specific
✓ exact fenced ## Prompt exists
✓ benchmark case exists
✓ install smoke succeeds
```

If any mandatory item is unavailable:

```text
status: blocked
```

or leave the pack out of the published catalogue.

Never mark it complete without evidence.

---

# 14. Benchmark Integration

If the first-class benchmark system exists, every catalogue pack must have a matching pack benchmark case.

Required invariant:

```text
extension-packs/manifest.json pack
↔
extension-packs/<pack>/README.md
↔
skills/<pack>/
↔
benchmark pack case
```

The benchmark prompt source must point to:

```text
extension-packs/<pack>/README.md
```

and extract the exact fenced `## Prompt`.

Changing the showcase prompt must invalidate the benchmark fingerprint.

Repository validation must fail when:

```text
catalogue pack has no benchmark case
benchmark pack has no catalogue pack
catalogue entry points to missing skill
catalogue entry points to missing README
```

Do not require paid generation merely to validate catalogue coverage.

---

# 15. Catalogue README

Create:

```text
extension-packs/README.md
```

This is the human browse surface.

Keep it concise and mobile-friendly.

Suggested structure:

```text
# Video Extension Pack Catalogue

What extension packs are
→ how to install one
→ browse by family
→ pack links
→ how to create a new pack
```

For each pack show only:

```text
name
one-line production identity
format / genre / style
showcase title
link to pack README
```

Do not copy every generation prompt into the root catalogue README.

Do not use a very wide Markdown table.

Prefer stacked family sections.

---

# 16. Repository README

Update the root README only enough to expose the catalogue.

Add a concise link such as:

```text
## Extension packs

Browse ready-made video production formats, genres and styles in the Extension Pack Catalogue.
```

Do not move the full catalogue into the root README.

The root README remains focused on Video Production Skills itself.

---

# 17. Extension Pack Creator

Update `video-extension-pack-creator` so its output contract matches the implemented repository.

Its catalogue-oriented flow should become:

```text
inspect existing catalogue
→ assess whether a new pack is justified
→ define pack
→ derive production profile
→ define evaluation profile
→ define optional voice profile
→ create skill package
→ create evals
→ create catalogue showcase
→ add catalogue manifest entry
→ add benchmark coverage
→ validate
```

If current commands do not include catalogue inspection / pack-need assessment, add the smallest command-level change required.

Do not automatically create a new pack when:

```text
existing pack already fits
```

or:

```text
existing pack + project-specific instruction is sufficient
```

This protects the catalogue from trivial near-duplicates.

Do not add a pack-composition engine.

---

# 18. Catalogue Generation from the Current Spec

Materialise **every currently approved pack** in the Extension Pack Catalogue specification.

Do not stop after the representative implementation subset if the user-facing catalogue specification already defines the full set.

For each current pack:

```text
create skill package
create production profile
create behavioural evals
create catalogue README
preserve the specified showcase concept
preserve the specified generation prompt intent
add manifest entry
add benchmark definition
validate
```

The full catalogue should therefore become real repository content, not a list of future ideas.

If a pack cannot yet be implemented because a required core capability is genuinely missing:

```text
do not fake implementation
→ record it explicitly as BLOCKED
→ explain the missing capability
```

---

# 19. Preserve the Catalogue Specification

The catalogue spec remains the normative design document.

The new `extension-packs/` folder is its implemented/product surface.

Do not copy the entire catalogue spec verbatim into `extension-packs/README.md`.

Update the spec only where repository layout or acceptance rules need to reflect the implemented structure.

If changed, increment the version/footer.

---

# 20. Repository Validation

Extend repository validation to verify:

```text
extension-packs/manifest.json parses
pack slugs are unique
manifest pack directories exist
catalogue README exists for each pack
skillPath exists
SKILL.md exists
required skill frontmatter is valid
pack evals exist
catalogue ## Prompt exists
prompt is fenced
prompt is non-empty
manifest family is valid
benchmark case exists when benchmark subsystem is present
no orphan catalogue directories exist
no orphan installable catalogue skills exist
```

Do not require optional references that a pack does not need.

Add deterministic tests for the validator.

---

# 21. Installation Smoke Test

Every extension pack must install independently.

Test current supported agents using the repository's established smoke-test approach.

At minimum prove the equivalent of:

```bash
npx skills add . --list

npx skills add . \
  --skill <pack-slug> \
  --agent claude-code \
  --copy --yes
```

and the current equivalent for Codex if the repository supports it.

Verify the installed pack contains all runtime resources it references.

The pack must not depend on repository-level:

```text
docs/
extension-packs/
benchmarks/
examples/
```

at runtime.

Catalogue content is discovery/documentation.

The installed skill remains self-contained.

---

# 22. TypeScript Only

Any repository tooling added for:

```text
catalogue validation
manifest validation
prompt extraction
extension-packs/benchmark coverage checks
```

must use TypeScript and the repository's current strict TypeScript conventions.

Do not add Python.

Do not add a new framework merely to generate JSON/Markdown files.

---

# 23. Non-Goals

Do not introduce:

```text
pack inheritance
pack composition DSL
automatic pack mixing
style ontology service
marketplace backend
ranking/recommendation engine
download telemetry
provider-specific pack forks
automatic voice marketplace
generic creative-profile framework
database
workflow engine
```

The Extension Pack Catalogue is:

> a curated collection of coherent, independently installable production recipes.

---

# 24. Completion Criteria

The change is complete only when:

```text
✓ extension-packs/ exists
✓ extension-packs/README.md exists
✓ extension-packs/manifest.json exists
✓ every approved catalogue pack has a catalogue directory
✓ every catalogue directory has a showcase README
✓ every showcase has an exact fenced ## Prompt
✓ every catalogue pack has an installable skill package
✓ every pack has an operational production profile
✓ every pack has behavioural eval coverage
✓ pack-aware evaluation distinguishes intentional traits from defects
✓ voice-enabled packs do not invent voice IDs
✓ catalogue manifest maps correctly to skills and showcases
✓ every catalogue showcase has benchmark coverage
✓ benchmark prompt source uses the catalogue README
✓ repository validation detects catalogue drift
✓ all packs pass structural validation
✓ independently installable packs pass smoke tests
✓ root README links to the catalogue
✓ extension-pack creator outputs the implemented catalogue structure
✓ no redundant extension-pack showcase prompts remain without justification
✓ no fabricated provider-backed quality result is introduced
✓ no unnecessary framework is introduced
```

---

# 25. Final Validation

Run the repository's actual current commands.

At minimum verify the equivalent of:

```bash
npm install
npm run check
npm run validate
npm test
npm run test:commands
npm run test:benchmark
npm run smoke:install
npm run benchmark:list
git diff --check
```

Also verify catalogue coverage explicitly.

For example, report:

```text
catalogue packs: N
installable pack skills: N
catalogue showcases: N
fenced generation prompts: N
pack behavioural eval coverage: N/N
benchmark pack coverage: N/N
install-smoke coverage: N/N
```

These are coverage counts, not semantic quality scores.

Do not mark a required check as passing if it could not run.

---

# 26. Final Report

After implementation report:

1. final `extension-packs/` tree;
2. final pack list by family;
3. catalogue pack count;
4. installable pack-skill count;
5. showcase prompt coverage;
6. behavioural eval coverage;
7. benchmark coverage;
8. installation smoke results;
9. any duplicate example/showcase material removed or retained and why;
10. extension-pack creator changes;
11. validator/tests added;
12. specs updated and version bumps;
13. blocked packs, if any;
14. anything deliberately deferred.

The final repository should make the extension-pack system tangible:

```text
browse catalogue
→ open a pack
→ see what it does
→ copy its showcase prompt
→ install it
→ produce video
→ benchmark the result
```

---

**Implementation Prompt — Generate the Video Extension Pack Catalogue**  
**Version 2 — 27 August 2026**
