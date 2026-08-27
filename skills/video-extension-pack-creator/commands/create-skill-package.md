---
id: create-skill-package
skill: video-extension-pack-creator
---
# create-skill-package

## Purpose
Create the smallest self-contained installable Agent Skill package that implements the approved profile.

## Inputs
Approved pack definition, production profile, evaluation profile, optional voice profile.

## Outputs
`skills/<pack-slug>/` runtime package.

## Preconditions
- The pack definition is human-approved and the production and evaluation profiles exist.
- The voice decision is recorded, including the decision that the pack has no voice profile.

## Invariants
- `SKILL.md` and required runtime references live inside the skill directory.
- No runtime dependency on repository-level `docs/`, `extension-packs/`, `benchmarks/` or `examples/`.
- Add files only when necessary.
- The packaged behaviour is the approved profiles restated for runtime, not new pack decisions.

## Forbidden behaviour
- Empty symmetry directories.
- Provider/API implementation duplicated inside the pack.
- Repository-relative runtime references outside the skill.
- Introducing production or evaluation behaviour that no approved profile declares.

## External capabilities
`references/pack-contract.md` defines the minimum runtime package layout.

## Failure routing
Missing or unusable operational guidance routes to `derive-production-profile`; a wrong
tolerate/reject rule routes to `define-evaluation-profile`; a voice reference defect routes to
`define-voice-profile`. Only packaging, file placement and self-containment defects are owned here.

## Evaluation hooks
Selective installation must retain all referenced runtime resources.
Case: `package-self-contained`.
