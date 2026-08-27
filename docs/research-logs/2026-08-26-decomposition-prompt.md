# Implementation Prompt — Video Production Skills Command Decomposition

Implement the command-decomposition changes defined by the updated Video Production Skills specifications.

## Goal

Keep the public/installable skill surface unchanged:

```text
video-production
video-evaluate
```

Decompose each skill into named, independently testable command contracts so production behaviour can be tested and benchmarked at component level.

The target architecture is:

```text
Skill
→ user-facing Agent Skill and orchestration surface

Command
→ skill-local behavioural contract

Script
→ deterministic implementation where code is more reliable than prose
```

Commands are **not** separate Agent Skills, CLI commands by default, provider abstractions, or a new workflow runtime.

The implementation must improve testability and failure localisation without increasing architectural complexity.

## Read first

Before changing code, read the repository's current versions of:

```text
docs/01-creative-skills-system-spec.md
docs/02-creative-skills-workflows-and-artifacts-spec.md
docs/03-creative-skills-repository-and-contracts-spec.md
docs/04-testing-and-benchmark-spec.md
skills/video-production/SKILL.md
skills/video-evaluate/SKILL.md
skills/video-production/evals/evals.json
skills/video-evaluate/evals/evals.json
tools/run-evals.ts
tools/run-benchmark.ts
package.json
```

Also inspect existing scripts and tests. Preserve behaviour that already satisfies the updated specs.

Do not blindly replace working code or existing measured benchmark evidence.

## 1. Add command contracts

Create:

```text
skills/video-production/commands/
├── define-direction.md
├── create-storyboard.md
├── plan-shots.md
├── create-animatic.md
├── create-reference.md
├── create-motion-prototype.md
├── generate-shot.md
├── select-shot.md
├── assemble-edit.md
├── integrate-audio.md
├── render-master.md
├── create-delivery.md
└── refine.md
```

Create:

```text
skills/video-evaluate/commands/
├── evaluate.md
├── diagnose.md
├── check-continuity.md
├── check-motion.md
├── check-fidelity.md
└── qc.md
```

Every command file must use the same lightweight headings:

```markdown
# <Command>

## Purpose

## Inputs

## Outputs

## Preconditions

## Preserve

## Procedure

## External capabilities

## Failure routing

## Acceptance criteria
```

Do not create YAML/JSON command registries unless the current repository already has a proven mechanism that makes them unnecessary to duplicate.

Do not create one script per command merely for symmetry.

A command may reference an existing deterministic script or peer Agent Skill when required.

## 2. Command semantics

Implement the command contracts according to these boundaries.

### `video-production`

#### `define-direction`

```text
brief + approved upstream constraints
→ visual_direction
```

Must convert production intent into operational visual direction while preserving explicit user and approved upstream constraints.

#### `create-storyboard`

```text
brief + visual_direction
→ storyboard
```

Must resolve sequence/staging decisions before expensive shot generation.

#### `plan-shots`

```text
approved storyboard + visual_direction
→ shot_plan
```

Must define only the shot information required for production, including continuity constraints.

#### `create-animatic`

```text
storyboard + shot_plan
→ animatic
```

Optional. Use only when sequence or timing uncertainty warrants it.

#### `create-reference`

```text
storyboard_frame + shot_plan + approved references
→ reference_frame candidate(s) + explicit selection
```

Must preserve the most specific approved character, product, environment, composition, and style constraints.

#### `create-motion-prototype`

```text
reference_frame + shot_plan
→ motion_prototype
```

Optional. Use only when action, timing, camera movement, or interaction remains uncertain.

#### `generate-shot`

```text
approved reference + shot_plan
→ video_shot candidate(s)
```

Must delegate model discovery/execution to existing provider skills. Do not add a direct provider client.

#### `select-shot`

```text
video_shot candidates
→ selected video_shot
```

Must record selection explicitly and prevent rejected candidates leaking into the edit.

#### `assemble-edit`

```text
selected shots
→ edit_timeline
```

Own source selection, order, in/out, timing, transitions, and basic graphic/audio placement.

#### `integrate-audio`

```text
edit_timeline + supplied/generated audio
→ audio_mix / updated video-specific audio placement
```

Own video-specific integration only. Do not absorb general music production.

#### `render-master`

```text
locked edit_timeline + approved finishing/audio
→ video_master
```

Prefer deterministic FFmpeg/ffprobe operations and verify the master corresponds to the authoritative timeline.

#### `create-delivery`

```text
video_master + delivery requirements
→ delivery_variant
```

Handle deliberate adaptation such as crop/reframe, resolution, codec, audio/caption requirements, and target aspect ratio.

#### `refine`

```text
artifact + evaluation_report + preserve set
→ smallest justified revision
```

This is a critical routing command.

It must choose the smallest owning behaviour:

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

audio balance / sync defect
→ integrate-audio

master encode defect
→ render-master

delivery adaptation defect
→ create-delivery
```

A correction that fixes the visible symptom by rewriting unrelated approved work is a failure.

### `video-evaluate`

#### `evaluate`

```text
artifact + production context
→ evidence-backed evaluation findings
```

Use only criteria relevant to the artifact and lifecycle state.

#### `diagnose`

```text
evaluation findings + artifact lineage + production context
→ owning layer + corrective action + correction scope
```

This is a critical routing command.

Detection without correct routing is not sufficient.

#### `check-continuity`

Cover applicable:

```text
character identity
product/prop identity
environment
landmarks
screen direction
axis
eyelines
wardrobe/state
lighting progression
```

Use deterministic checks where available and semantic judgement only where required.

#### `check-motion`

Cover applicable:

```text
generation seams
frozen regions
repeated action
motion discontinuity
physics
camera behaviour
action execution
usable range
```

Do not confuse intentional style cadence with a defect.

#### `check-fidelity`

Compare relevant artifacts against approved references/manifests for:

```text
character
product
prop
environment
visual direction
extension-pack/style traits when supplied
```

#### `qc`

Technical media/delivery checks only:

```text
readability
container/streams
duration
resolution
aspect ratio
frame rate
audio presence
gross sync
corruption
declared delivery requirements
```

Keep creative evaluation separate from technical QC.

## 3. Update `SKILL.md`

Do not make users invoke command files manually.

`SKILL.md` remains the Agent Skill activation/orchestration surface.

Update `skills/video-production/SKILL.md` so it:

- lists the internal commands;
- routes narrow requests to the smallest relevant command;
- orchestrates several commands through artifacts for end-to-end production;
- loads only relevant command/reference material where practical;
- preserves the existing production lifecycle, approval, provenance, provider, and boundary rules.

Update `skills/video-evaluate/SKILL.md` similarly.

Do not duplicate the full command contracts inside `SKILL.md`.

## 4. Extend eval schema minimally

Keep:

```text
skills/<skill>/evals/evals.json
```

Do **not** create one eval file per command.

Add an optional/required-when-targeted field:

```json
{
  "command": "create-reference"
}
```

Reuse the existing eval format and validation wherever possible.

Do not introduce a new eval framework.

## 5. Add command-targeted eval coverage

Every initial command must have at least one targeted case.

Where false positives are meaningful, include a clean/control case.

At minimum, add strong coverage for:

```text
video-production/refine
video-evaluate/diagnose
video-evaluate/check-continuity
video-evaluate/check-motion
video-evaluate/check-fidelity
video-evaluate/qc
```

### Required routing/preservation cases

Add cases equivalent to:

#### Reference-frame preservation

Context:

```text
approved character identity
approved composition except requested product position
```

Request:

```text
move product closer to camera
preserve character, pose, lighting
```

Expected:

```text
command: create-reference or refine → create-reference
preserve unchanged approved traits
do not restart from brief
```

#### Wrong camera movement

Seed a shot whose camera movement is wrong because the shot plan is ambiguous.

Expected:

```text
diagnose
→ owning layer: shot plan
→ corrective action: revise-shot-plan
→ correction scope: affected shot only
```

Do not accept:

```text
retry the same generation repeatedly
regenerate entire sequence
```

#### Edit-first correction

Use good source shots with a pacing/reveal problem caused only by the edit.

Expected:

```text
diagnose → assemble-edit
```

Do not route to shot regeneration.

#### Delivery crop

Use a valid master with a bad vertical crop.

Expected:

```text
diagnose → create-delivery
```

Do not alter the master or reshoot.

#### Evaluation-only boundary

When asked only to evaluate:

```text
evaluate / diagnose
```

must not rewrite or regenerate production artifacts.

## 6. Update eval runner

Extend `tools/run-evals.ts` to support command filtering without breaking existing skill-level behaviour.

Required target interface:

```bash
node tools/run-evals.ts --skill video-production
node tools/run-evals.ts --skill video-production --command create-reference
node tools/run-evals.ts --skill video-production --command refine
node tools/run-evals.ts --skill video-evaluate --command diagnose
```

Add a script alias:

```text
npm run test:commands
```

The exact internal implementation may reuse the existing eval runner.

Report command coverage separately.

Example:

```text
video-production
  define-direction              PASS 2/2
  create-storyboard             PASS 2/2
  ...
  refine                        PASS 3/3

video-evaluate
  evaluate                      PASS 2/2
  diagnose                      PASS 4/4
  ...
```

A command with no executable evidence must report something explicit such as:

```text
MANUAL
NOT RUN
UNCOVERED
```

It must never appear green by implication.

## 7. Update benchmark integration

Preserve existing benchmark cases, transcripts, baselines, and measured historical results.

Do not rewrite historical benchmark prompts to make new scoring pass.

Extend benchmark reporting so command failures can be localised.

The benchmark must continue to report these semantic axes separately:

```text
detection
precision
evidence
routing
correction scope
preservation
pack adherence/style awareness where applicable
strict
```

For routing cases, record both:

```text
owningArtifact / owning production layer
owningCommand
correctiveAction
correctionScope
```

Do not collapse these into one quality score.

If new routing/preservation/command evidence has not been collected, report:

```text
UNMEASURED
NOT RUN
```

Do not infer it from historical detection scores.

## 8. Command structural validation

Extend repository validation to check:

- declared command directories/files exist;
- no duplicate command names within a skill;
- every command file contains the required headings;
- every eval `command` value names a real command in that skill;
- command files use only skill-local/runtime-safe references;
- selective skill installation includes the command directory;
- installed skills remain self-contained.

Do not create a general Markdown AST framework if simple validation is sufficient.

## 9. Installation regression

Update clean-project install tests so each installed core skill contains:

```text
SKILL.md
commands/
references/
scripts/
evals/
```

Verify command files survive:

```text
Claude Code installation
Codex installation
```

Do not require the two skills to be installed together.

## 10. Extension-pack compatibility

Core command decomposition must allow an installed extension/customisation pack to specialise relevant command behaviour without changing the core command contract.

Examples:

```text
claymation pack

define-direction
→ tactile material / miniature-scale direction

create-reference
→ preserve clay model proportions and handmade surfaces

generate-shot
→ preserve deliberate stop-motion cadence

check-motion
→ do not penalise intentional stepped motion

check-fidelity
→ reject material/style drift

diagnose
→ route pack violations to the smallest owning core command
```

Do not embed the full extension-pack catalogue into the core skills.

If extension packs or `video-extension-pack-creator` are maintained in a separate repository, do not move them into `video-production-skills`. Only preserve the peer-skill integration contract.

If those files already live in this repository, update them according to their current specs instead of creating duplicates.

## 11. Do not introduce

Do not implement:

```text
new installable skill per command
command runtime
command registry service
workflow engine
generic command bus
generic provider interface
provider SDK/client
static provider/model catalogue
artifact graph database
new lifecycle state machine
one eval file per command
one script per command for symmetry
pack composition engine
```

The goal is component testability, not a new framework.

## 12. TypeScript requirements

Keep repository tooling in TypeScript.

Preserve existing strict TypeScript standards, including the repository's configured equivalents of:

```text
strict
noUncheckedIndexedAccess
exactOptionalPropertyTypes
noImplicitReturns
noUnusedLocals
noUnusedParameters
NodeNext
noEmit
```

Validate untrusted JSON/runtime inputs rather than casting them blindly.

Use safe subprocess invocation with argument arrays and no `shell: true`.

## 13. Documentation

Update the canonical repository files in place:

```text
docs/01-creative-skills-system-spec.md
docs/02-creative-skills-workflows-and-artifacts-spec.md
docs/03-creative-skills-repository-and-contracts-spec.md
docs/04-testing-and-benchmark-spec.md
```

Use the updated spec versions supplied with this task as the normative target.

Do not create version-suffixed duplicates inside the repository.

Update README only where necessary to explain that users still install the same two skills. Do not expose the command decomposition as if users need to install or configure 19 separate components.

## 14. Test order

Run the cheapest checks first:

```text
typecheck
→ repository validation
→ unit tests
→ command tests
→ stage tests
→ structural evals
→ deterministic benchmark
→ semantic transcript re-score
→ install smoke
```

Provider-backed generation or semantic collection remains opt-in.

Do not spend provider calls merely to prove structure that can be checked offline.

## 15. Acceptance gate

The implementation is complete when:

```text
✓ public skill surface remains video-production + video-evaluate
✓ all declared command files exist
✓ every command contract has the required sections
✓ no command runtime/framework was introduced
✓ SKILL.md routes behaviour through command contracts
✓ existing production behaviour remains intact
✓ every initial command has command-targeted eval coverage
✓ refine has preservation + correction-scope regression coverage
✓ diagnose has detection + evidence + routing + scope coverage
✓ continuity/motion/fidelity/QC commands have defect + control coverage
✓ eval runner can filter by --command
✓ command coverage is reported explicitly
✓ existing benchmark transcripts/baselines are preserved
✓ historical scores are not relabelled as command/routing evidence
✓ deterministic tests pass
✓ command tests pass
✓ benchmark re-score passes for current transcripts
✓ clean-project installation includes commands/
✓ video-production installs independently
✓ video-evaluate installs independently
✓ Claude Code install smoke passes
✓ Codex install smoke passes where currently supported
✓ no provider SDK/client is added
✓ no unrelated approved behaviour is removed
```

If a required external check cannot run, report it as `BLOCKED` or `NOT RUN`; do not convert it into a pass.

## 16. Final implementation report

At completion report:

```text
files added
files changed
commands implemented
command coverage by skill
tests run
benchmark changes
historical evidence preserved
new evidence collected, if any
blocked/not-run checks
deferred follow-ups
```

Keep the implementation lean. The command decomposition succeeds only if it makes the existing two-skill architecture easier to test and diagnose without turning it into a framework.
