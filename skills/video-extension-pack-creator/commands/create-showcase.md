---
id: create-showcase
skill: video-extension-pack-creator
---
# create-showcase

## Purpose
Create the canonical capability-led catalogue showcase.

## Inputs
Pack profile and intended production challenge.

## Outputs
`extension-packs/<pack-slug>/README.md`. `extension-packs/` is the catalogue surface specified in `docs/06` §4; it does not exist in this repository yet and is created on first use.

## Preconditions
- The production profile is approved, so the expected traits are already decided.
- The runtime package exists, so the install command names a real installable skill.

## Invariants
The README contains:
- production identity;
- production profile;
- what the pack changes;
- showcase concept;
- exact fenced `## Prompt`;
- expected production traits;
- evaluation focus;
- install command.

The prompt must expose pack adherence and pack-specific failure modes.
This README stays the single authoritative source of that prompt.

## Forbidden behaviour
- Generic showcase prompts.
- Duplicating the same authoritative prompt elsewhere without reason.
- Fabricating generated results or benchmark evidence.
- Reporting provenance, cost or evaluation outcomes before the showcase has actually been run.

## External capabilities
`references/showcase-examples.md` defines the showcase structure.

## Failure routing
Expected traits that the profile does not actually produce route to
`derive-production-profile`; an install command that resolves to nothing routes to
`create-skill-package`. Prompt weakness and showcase structure are owned here.

## Evaluation hooks
Benchmark should resolve this exact prompt as its source.
Cases: `showcase-exact-prompt`, `showcase-no-fabricated-results`.
