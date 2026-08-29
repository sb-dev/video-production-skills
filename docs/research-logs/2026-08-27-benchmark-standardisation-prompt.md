# Implementation Prompt — Bring Video Production Skills Benchmark to Narrative Production Skills Standard

Update the `video-production-skills` repository so its benchmark system follows the same **quality-assurance standard and first-class benchmark architecture** as the current Narrative Production Skills project, while preserving Video Production Skills' stronger media-specific deterministic tests, fixtures, historical semantic evidence, and command decomposition.

## Goal

Turn the Video benchmark from a collection of test fixtures and runners into a **first-class, manifest-driven benchmark subsystem** that makes capability coverage explicit.

The target hierarchy is:

```text
command
→ one bounded production behaviour

skill
→ command selection and orchestration

workflow
→ cross-command / cross-skill production correctness

production
→ end-to-end video quality

extension pack
→ pack fidelity across real showcase production

pack authoring
→ quality of newly created extension packs
```

The benchmark must distinguish:

```text
production-contract failure
→ approved work lost
→ wrong artifact revised
→ continuity broken
→ pack ignored
→ delivery constraint violated

creative-quality failure
→ technically valid output
→ but composition, motion, continuity, edit, audio, style, or production effect is weak
```

Do not collapse these into one generic video-quality score.

---

## Start by inspecting the repository

Before changing anything:

1. inspect `README.md`;
2. inspect all current `skills/*/SKILL.md`;
3. inspect all `skills/*/commands/*.md`;
4. inspect current skill evals;
5. inspect:
   - `docs/01-creative-skills-system-spec.md`
   - `docs/02-creative-skills-workflows-and-artifacts-spec.md`
   - `docs/03-creative-skills-repository-and-contracts-spec.md`
   - `docs/04-testing-and-benchmark-spec.md`
   - customisation-pack specification
   - extension-pack catalogue;
6. inspect the existing benchmark runner(s);
7. inspect:
   - `tests/fixtures/defects/`
   - existing semantic transcripts
   - existing baseline/result metadata
   - stage tests
   - media-QC tests
   - continuity tests
   - production-lint tests;
8. inspect every progressive production example;
9. inspect every current extension-pack showcase and its generation prompt;
10. run the current deterministic test suite before editing.

Record the pre-change result.

Do not hard-code case counts, extension-pack counts, command counts, or example counts from this prompt. Derive them from the repository's current state.

---

## 1. Preserve Existing Video Benchmark Evidence

The current Video benchmark already has valuable media-specific infrastructure. Preserve it.

This includes, where currently present:

```text
synthetic FFmpeg fixtures
motion-artifact detection
usable-range checks
continuity validation
media QC
production lint
timeline validation
semantic open/closed review
recorded semantic transcripts
historical measured results
staleness checks
baseline/regression/flakiness behaviour
```

Do not delete or weaken these merely to make the repository resemble Narrative Production Skills.

Existing semantic evidence must remain auditable.

If moving any historical transcript, baseline, or case definition:

```text
preserve case identity
preserve evidence
preserve hashes/fingerprints where possible
preserve historical measured results
preserve old scorer interpretation where needed for audit
```

Prefer leaving historical evidence in place and referencing it from the new benchmark manifest unless a lossless migration is clearly simpler.

Never rewrite old benchmark questions, criteria, prompts, or recorded results merely to fit the new structure.

---

## 2. Introduce a First-Class `benchmarks/` Surface

Create a lean first-class benchmark area modelled on the Narrative Production Skills standard.

Target shape:

```text
benchmarks/
├── README.md
├── manifest.json
├── rubrics/
│   ├── diagnostic.json
│   ├── video-quality.json
│   ├── pack-adherence.json
│   └── pack-authoring.json
├── cases/
│   ├── diagnostic/
│   ├── production/
│   ├── packs/
│   └── pack-authoring/
└── fixtures/
    ├── scorer-pass.json
    └── scorer-fail.json
```

This is the **benchmark definition and coverage surface**.

Do not move ordinary low-level test fixtures into `benchmarks/` merely for visual symmetry.

The intended boundary is:

```text
benchmarks/
→ benchmark cases
→ rubrics
→ capability coverage
→ fingerprints
→ benchmark documentation

tests/fixtures/
→ synthetic/raw test evidence
→ low-level deterministic fixtures

tests/stages/
→ deterministic production-stage tests

skills/*/evals/
→ command and skill behavioural evals

tools/
→ benchmark/eval execution
```

Create result/baseline directories only when real measured evidence justifies them.

Video already has historical semantic measurements, so preserve or reference those deliberately rather than pretending the benchmark starts empty.

---

## 3. `benchmarks/manifest.json` Is the Coverage Authority

The manifest must provide a machine-readable answer to:

```text
what capabilities are claimed?
which benchmark cases prove them?
which skills are exercised?
which commands are exercised?
which examples are covered?
which extension-pack showcases are covered?
which rubrics apply?
which cases require provider generation?
which cases require semantic review?
which cases are deterministic?
which measured baselines exist?
```

Each benchmark case should identify at least:

```text
id
suite
capability
skills
commands where relevant
rubric
prompt or promptSource
required dimensions
hard gates
execution requirements
```

Use optional fields where a dimension is not relevant.

Do not create generic fields solely for theoretical future use.

---

## 4. Benchmark Suites

Use the same conceptual suite separation as Narrative Production Skills.

### `diagnostic`

Minimal seeded failures and clean controls.

Measure:

```text
detection
evidence
root-cause routing
correction scope
preservation
boundary compliance
precision
```

Retain Video-specific classes such as:

```text
motion seam
frozen range
character identity drift
product geometry drift
reference contradiction
camera-motion mismatch
screen-direction / axis failure
wrong shot selected
pacing failure
audio-sync failure
delivery crop failure
pack trait drift
intentional trait misclassified
real defect excused as style
wrong owning artifact
wrong corrective action
over-broad revision
```

Use the smallest fixture that exposes the failure.

A correct diagnosis with the wrong corrective target is not a strict pass.

### `production`

Benchmark the repository's actual progressive production examples.

The example README generation prompt must be the benchmark prompt source wherever practical.

Do not duplicate the advertised prompt into a second manually maintained benchmark prompt.

The invariant is:

> **The benchmark measures the productions the repository actually advertises.**

Changing an example generation prompt must change the case fingerprint.

### `packs`

Every current extension-pack showcase must have benchmark coverage.

Do not benchmark only a representative subset at the **definition/coverage** level.

A smaller representative subset may be used for frequent paid execution, but:

```text
catalogue showcase exists
→ matching benchmark case must exist
```

Repository validation must fail if an extension-pack showcase is added without benchmark coverage.

A full catalogue release must be able to run the complete pack suite.

### `pack-authoring`

Benchmark `video-extension-pack-creator`.

At minimum cover:

```text
normal pack creation
partial/style-only request
voice-enabled pack
voice-free pack
refinement of an existing pack
boundary / unsafe or creator-name-only request
redundant-pack / catalogue-reuse decision
showcase generation
evaluation-profile generation
pack validation
```

Do not require one benchmark case per creator command if a smaller case exercises several commands meaningfully.

---

## 5. Quality Model

Report quality as separate surfaces.

Use:

```text
1. Command correctness
2. Skill orchestration
3. Production correctness
4. Video quality
5. Extension-pack fidelity
6. Pack-authoring quality
```

Never let a strong score in one surface hide a regression in another.

---

## 6. Command Conformance

Preserve the existing command decomposition.

Commands remain internal behavioural contracts, not public Agent Skills and not a command runtime.

The benchmark must measure command correctness separately from skill orchestration.

For every shipped command, require at least:

```text
one normal/positive case
+
one meaningful boundary/forbidden case where applicable
```

Use deterministic assertions wherever possible.

Use semantic/provider-backed execution only when the behaviour genuinely requires judgement or generated media.

Report command coverage by owning skill and command.

A command with zero coverage is a **gap**, not a pass.

The benchmark must distinguish:

```text
wrong command selected
→ skill-orchestration failure

right command selected
but command contract violated
→ command failure

correct commands
wrong sequence or handoff
→ orchestration/workflow failure

correct workflow
weak final video
→ end-product quality failure
```

Do not backfill missing command coverage from a passing end-to-end production.

---

## 7. Command Evaluation Axes

Evaluate command cases against the installed command contract.

Use relevant axes such as:

```text
input discipline
context discipline
output correctness
must behaviour
must-not behaviour
preservation
completion / stop condition
failure routing
```

For critical Video commands require stronger evidence.

Examples:

```text
video-production / refine
→ correction scope
→ preservation of approved work
→ no unrelated regeneration

video-evaluate / diagnose
→ detection
→ evidence
→ owning artifact/stage
→ corrective action
→ maximum justified scope

video-evaluate / check-continuity
→ seeded defect
→ clean control

video-evaluate / check-motion
→ seeded temporal defect
→ clean control

video-evaluate / check-fidelity
→ reference mismatch
→ matching control

video-evaluate / qc
→ invalid media/requirement
→ valid control
```

Keep low-level deterministic stage tests where they are already stronger than command-semantic tests.

---

## 8. Skill-Orchestration Benchmark

Measure whether each installable skill chooses and sequences commands correctly.

Relevant axes:

```text
command selection
sequence correctness
artifact/state handoff
skip behaviour
re-entry from existing approved artifacts
upstream conflict handling
stop condition
```

Important examples:

```text
approved reference already exists
→ do not recreate visual direction/storyboard unnecessarily

single failing shot
→ refine affected production unit
→ do not restart full production

evaluation request
→ diagnose/report
→ do not silently perform revision

technical delivery failure
→ QC/delivery correction
→ do not regenerate creative assets

pack active
→ apply pack only to relevant commands
→ do not leak pack behaviour when not requested
```

---

## 9. Diagnostic Scoring

Use the Narrative benchmark's diagnostic discipline, adapted to video.

Score each applicable repeat separately on:

### Detection

Did the system identify the seeded problem, or correctly leave a clean control alone?

### Evidence

Did it cite supplied artifact/media evidence?

Examples:

```text
frame/time range
reference mismatch
timeline source
manifest contradiction
brief constraint
pack rule
technical measurement
```

### Routing

Did it identify the highest useful owning artifact/stage/command?

Examples:

```text
wrong camera move caused by shot plan
→ shot_plan / plan-shots

bad composition already present in approved reference
→ reference_frame / create-reference

good shots but weak rhythm
→ edit_timeline / assemble-edit

wrong crop
→ delivery_variant / create-delivery
```

### Scope

Did it choose the smallest sufficient correction?

### Preservation

Did approved/locked work survive?

### Boundary

Did it stay inside Video Production Skills responsibilities?

### Precision

Did it avoid unsupported additional findings?

Precision remains separately visible and should not invalidate a correct diagnosis merely because a second finding may also be genuine.

A strict diagnostic pass requires all applicable hard axes except precision.

---

## 10. Video Production Quality Rubric

Add a `video-quality.json` rubric using an anchored four-point scale:

```text
0 = fails or contradicts the requirement
1 = material weakness; not production-ready
2 = acceptable production quality
3 = strong, deliberate execution
```

Do not use an unanchored 1–10 scale.

Select only relevant dimensions per case.

Candidate dimensions:

```text
instruction adherence
visual-direction adherence
composition and staging
character / subject fidelity
product / object fidelity
environment continuity
motion quality
camera behaviour
physical interaction
spatial continuity
editing and pacing
shot selection
audio / video integration
voice continuity where relevant
graphics / typography where relevant
technical integrity
delivery fit
production discipline
specificity / intentionality
```

Do not require every case to score every dimension.

### Hard gates

Where relevant, hard gates should include:

```text
instruction adherence
approved-decision preservation
required character/product fidelity
continuity
technical integrity
delivery correctness
production discipline
```

A visually attractive video that breaks an approved product design or contains invalid media is not production-ready.

### Production readiness

A semantic production repeat is production-ready when:

```text
no applicable hard gate fails
+
every required scored dimension >= 2
```

Report dimensions separately.

Do not sum them into one authoritative video-quality score.

---

## 11. Extension-Pack Benchmark Standard

Every catalogue showcase must have a case.

Measure whether the pack materially changes production rather than merely appearing as a style label in the prompt.

Use relevant dimensions:

```text
format
genre
style
audience
voice casting
pack consistency
pack-aware evaluation
user-instruction precedence
approved-artifact precedence
delivery behaviour
project/domain boundary
```

### Style

Judge style through operational production behaviour, for example:

```text
materials
line/rendering language
motion cadence
camera behaviour
lighting
editing
graphics
sound treatment
intentional imperfections
```

Do not judge a pack solely by asking whether the output "looks like claymation", "looks anime", etc.

### Pack-aware evaluation

Require paired controls where useful:

```text
intentional stepped stop-motion
→ accepted

actual accidental interpolation / motion defect
→ rejected
```

and:

```text
intentional found-footage instability
→ accepted

broken unreadable action / continuity failure
→ rejected
```

The pack changes the target, not the requirement for quality.

### Catalogue coverage gate

Validation must fail if:

```text
extension-pack showcase exists
+
no matching benchmark case exists
```

Likewise, stale catalogue entries or benchmark cases for removed packs must be detected.

---

## 12. Pack-Authoring Benchmark Standard

Measure `video-extension-pack-creator` on:

```text
necessity
contract completeness
operational specificity
self-contained packaging
showcase quality
generation-prompt quality
eval coverage
voice safety
provider boundary
project boundary
catalogue integration
benchmark integration
```

### Necessity is a hard quality gate

The creator must not create a new extension pack merely because it can.

It should distinguish:

```text
existing pack already fits
→ reuse existing pack

existing pack + one project-specific difference
→ use project instruction/override

stable reusable production profile
→ create new extension pack
```

If the current creator skill does not explicitly support this decision, add the benchmark case and report the capability gap.

Do not silently weaken the benchmark to match current implementation.

If needed, update the creator specification/skill contract narrowly so pack proliferation is prevented.

### Showcase gate

A created pack is incomplete without:

```text
realistic showcase example
+
exact fenced generation prompt
+
expected production traits
+
evaluation focus
```

---

## 13. Prompt Sources

Production and extension-pack benchmark cases should reference the real repository prompts.

Prefer:

```text
examples/<production>/README.md
examples/<extension-pack>/README.md
```

or the repository's actual current equivalent.

Extract the exact fenced generation prompt under the canonical prompt heading.

Do not duplicate it into the benchmark case unless the repository has no authoritative prompt source.

The prompt source path and resolved prompt content must participate in the case fingerprint.

---

## 14. Case Fingerprints and Staleness

A benchmark fingerprint should bind at least:

```text
case definition
+
resolved generation/diagnosis prompt
+
rubric
+
relevant command/skill contract revision where required
```

For provider-backed generation, recorded evidence should additionally retain observable execution identity:

```text
repository revision
host agent
provider
model/version
generation settings
active extension-pack revision
input artifact hashes
output artifact hashes
repeat number
budget/cost where observable
reviewer identity
```

If a case, prompt, rubric, or relevant evidence changes:

```text
STALE RESULT
```

Do not compare it directly with the old measurement.

Never silently reuse semantic evidence against a different question.

---

## 15. Repeats, Variance and Baselines

One semantic run is not a baseline.

Use at least three repeats for baselined semantic behaviour.

Report:

```text
per-repeat readiness
per-dimension results
median / majority where appropriate
pass rate
flakiness
known blind spots
cost
```

Preserve the existing Video distinction:

```text
REGRESSION
FLAKY
NEW FAILURE
NOT RUN
STALE
```

A baseline update must be deliberate.

A normal passing run must never rewrite the baseline automatically.

Do not fabricate scores for new benchmark surfaces.

New command, pack, production, routing, preservation, or authoring baselines remain:

```text
UNMEASURED
```

until actual evidence is collected.

---

## 16. Semantic Judge Discipline

Semantic review is evidence, not an oracle.

Where practical:

```text
generation
→ one invocation/model

review
→ separate invocation/model or human review
```

Do not rely on the generator's self-assessment as the only quality evidence.

For important release comparisons, support optional blinded pairwise A/B comparison:

```text
same benchmark case
same benchmark revision
A/B order
B/A order
retain both outputs
```

Pairwise comparison is supplementary.

It never overrides hard production invariants.

---

## 17. Deterministic vs Semantic Responsibilities

Preserve Video's strong deterministic checks.

Prefer deterministic checks for:

```text
decode validity
duration
resolution
frame rate
audio presence
timeline source resolution
master/source lineage
motion seams
frozen ranges
crop/delivery dimensions
production governance
known manifest contradictions
```

Use semantic review only for questions deterministic tooling cannot answer reliably, such as:

```text
composition
identity similarity
product fidelity
motion plausibility
style adherence
performance
editorial effectiveness
pack intent
creative brief fulfilment
```

Never replace a cheap deterministic check with an LLM judge merely to unify the benchmark.

---

## 18. Benchmark Runner

Refactor or extend the existing benchmark runner so `benchmarks/manifest.json` becomes the benchmark catalogue authority.

Support at least:

```bash
npm run test:benchmark
npm run benchmark:list
```

and a built runner equivalent to:

```bash
node dist/tools/run-benchmark.js --case <case-id>
node dist/tools/run-benchmark.js --score <result.json>
node dist/tools/run-benchmark.js --rescore <result.json>
```

Retain existing useful Video runner functionality such as filtering by defect class and free re-scoring of recorded semantic evidence.

Do not create multiple redundant runner architectures.

If existing `tools/run-benchmark.ts` can be evolved cleanly, evolve it.

Provider-backed generation collection remains opt-in and must never silently run as part of ordinary CI.

---

## 19. Command Eval Runner

Preserve or implement deterministic command coverage validation:

```bash
npm run test:commands
```

Support listing/preparing targeted command cases using the repository's existing tool style.

The component test path should expose:

```text
skill
command
case ID
contract
inputs/fixture
expected behaviour
forbidden behaviour
case fingerprint
```

A host agent or external harness may execute semantic command cases.

Scoring of a recorded structured result should be offline where possible.

Do not turn the eval runner into a production command runtime.

---

## 20. Release Tiers

Define at least:

### Core release tier

```text
diagnostic
+
progressive production
+
command/skill conformance relevant to changed core behaviour
```

### Catalogue release tier

```text
all current extension-pack cases
+
pack-authoring
```

A targeted pack case may run during development.

A release claiming catalogue support must validate complete catalogue coverage.

Paid generation frequency may differ from definition coverage.

That means:

```text
every pack has a benchmark definition
≠
every commit regenerates every pack
```

---

## 21. CI

Normal CI should run only free/deterministic work plus re-scoring of already recorded valid evidence.

Minimum intended deterministic gate:

```text
typecheck
repository validation
unit tests
command-definition/coverage validation
stage tests
structural skill evals
benchmark-definition validation
deterministic benchmark
semantic result/transcript staleness validation
skill install smoke
catalogue/showcase benchmark coverage validation
```

Provider-backed generation and fresh semantic collection run separately.

CI must fail when:

```text
required deterministic check fails
benchmark manifest is invalid
declared command lacks required coverage
example prompt source cannot be resolved
extension-pack showcase has no benchmark case
benchmark case references removed pack/example
required recorded evidence is stale
selective skill install loses required command/eval resources
```

CI must not fail merely because an optional paid benchmark was not requested.

Paid cases should report:

```text
NOT RUN
```

not `PASS`.

---

## 22. Update the Testing and Benchmark Spec

Update `docs/04-testing-and-benchmark-spec.md` to reflect the implemented architecture.

Bring it to the same standard as the current Narrative Production Skills benchmark specification while retaining Video-specific concerns.

It should explicitly define:

```text
quality model
benchmark suites
command conformance
testing layers
standing rules
repository layout
runbook
case contract
diagnostic scoring
video-quality scoring
extension-pack scoring
pack-authoring scoring
semantic judging protocol
fingerprints and staleness
evidence retention
re-scoring
baselines/regressions/flakes
release tiers
CI
known blind spots
measured results
acceptance criteria
```

Preserve historical Video benchmark findings rather than deleting them.

Increment the document version/footer.

---

## 23. Update Repository/Contracts Spec Where Necessary

Update `docs/03-creative-skills-repository-and-contracts-spec.md` only where the new first-class benchmark surface changes repository contracts.

Add:

```text
benchmarks/
→ first-class repository quality-assurance surface
```

Make clear that:

```text
skill evals
≠ benchmark cases

tests
≠ benchmark catalogue

benchmark definitions
≠ generated outputs/results
```

Update technical acceptance criteria.

Increment the version/footer.

Do not rewrite unrelated sections.

---

## 24. Update Extension-Pack Specs Where Necessary

Update the customisation-pack / extension-pack catalogue contract only where needed to enforce:

```text
showcase pack
→ exact generation prompt
→ benchmark case
```

and:

```text
catalogue inclusion
→ behavioural evals exist
→ showcase exists
→ benchmark coverage exists
```

Do not introduce a marketplace, pack inheritance, composition engine, or provider-specific fork.

Increment versions only for documents actually changed.

---

## 25. Benchmark README

Create `benchmarks/README.md` as a concise contributor runbook.

It should answer:

```text
what is benchmarked?
what are the suites?
how do I list cases?
how do I run deterministic validation?
how do I prepare one semantic case?
how do I score recorded evidence?
how do I add a new defect?
how do I add a production example?
how do I add an extension pack without missing benchmark coverage?
how are fingerprints/staleness handled?
what is paid vs free?
```

Do not duplicate the entire testing specification.

---

## 26. Benchmark Manifest Validation

Add deterministic validation for at least:

```text
unique case IDs
valid suite names
existing rubric references
existing skill references
existing command references where declared
resolvable promptSource
required dimensions exist in rubric
hard gates are valid dimensions/invariants
production examples have benchmark coverage
extension-pack showcases have benchmark coverage
pack benchmark points to the correct pack
removed examples/packs do not leave orphan cases
case fingerprints are deterministic
```

Add clean unit tests for the validator.

---

## 27. Preserve Historical Video Measurements

The current Video benchmark contains historical measured semantic results.

Do not relabel those old results as if they measured new dimensions they never scored.

For example, if the historical run measured:

```text
open detection
closed detection
precision
```

then it remains evidence only for those dimensions.

New dimensions such as:

```text
routing
correction scope
preservation
command correctness
skill orchestration
pack fidelity
pack-authoring quality
```

must remain `UNMEASURED` until collected.

The updated measured-results section should distinguish:

```text
historical measured evidence
current deterministic coverage
new benchmark coverage definitions
unmeasured semantic capabilities
```

---

## 28. Known Blind Spots

Record rather than hide limitations.

At minimum consider:

```text
semantic reviewer subjectivity
reviewer/model drift
visual-style judgement variance
motion judgement from sampled evidence
audio quality judgement limits
precision penalties for additional true findings
provider/model generation drift
catalogue-scale pack discrimination
cross-model comparability
long-video / many-sequence scaling
command-boundary stability after real use
host-agent variance
cost of full catalogue generation
```

Do not add new infrastructure merely to make these blind spots disappear on paper.

---

## 29. Non-Goals

Do not introduce:

```text
generic benchmark platform
benchmark database
workflow engine
graph database
command runtime
command registry service
pack marketplace
automatic model leaderboard
automatic provider optimiser
single universal video-quality score
one benchmark case per trivial implementation detail
new provider SDK
mandatory paid CI
```

Use TypeScript only for repository tooling.

Follow the repository's strict TypeScript/Node conventions.

---

## 30. Completion Criteria

The benchmark upgrade is complete only when:

```text
✓ benchmarks/ exists as a first-class repository surface
✓ benchmarks/manifest.json is authoritative for benchmark coverage
✓ benchmarks/README.md explains contributor usage
✓ diagnostic suite is represented
✓ progressive production examples are represented
✓ every current extension-pack showcase is represented
✓ pack-authoring suite is represented
✓ command conformance is visible separately from release benchmark cases
✓ command coverage gaps are visible by skill/command
✓ skill-orchestration failure is distinguishable from command failure
✓ video-quality rubric uses anchored dimensions
✓ diagnostic routing/scope/preservation are hard benchmark concepts
✓ pack-aware evaluation distinguishes intentional traits from real defects
✓ pack-authoring measures necessity, not only package completeness
✓ example/showcase prompt sources are resolved from real repository prompts
✓ fingerprints invalidate stale comparisons
✓ historical semantic evidence remains auditable
✓ old measured dimensions are not re-labelled as new measurements
✓ no fabricated baseline is introduced
✓ deterministic benchmark validation is executable
✓ catalogue/showcase coverage validation is executable
✓ existing Video deterministic media tests still pass
✓ existing install-smoke behaviour still passes
✓ docs are updated and versioned
✓ no unnecessary framework or provider abstraction is introduced
```

---

## 31. Final Validation

Run the repository's real commands, using current script names rather than blindly copying names from this prompt.

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

If a required command does not yet exist, implement it where it belongs.

Do not mark a required check as passing if it cannot execute.

---

## 32. Final Report

After implementation, report:

1. final `benchmarks/` tree;
2. benchmark suites and case counts derived from the repository;
3. progressive-example benchmark coverage;
4. extension-pack showcase coverage;
5. command coverage by skill;
6. pack-authoring coverage;
7. rubrics added;
8. validator and runner changes;
9. old benchmark evidence preserved;
10. deterministic test results before vs after;
11. semantic capabilities still `UNMEASURED`;
12. any stale historical evidence discovered;
13. any benchmark case or command still missing coverage;
14. spec files updated and version bumps;
15. anything deliberately deferred.

The result should provide Video Production Skills with the same **benchmark discipline** as Narrative Production Skills while retaining Video's domain-specific strengths rather than reducing both projects to an identical implementation.
