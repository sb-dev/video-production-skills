---
id: validate-pack
skill: video-extension-pack-creator
---
# validate-pack

## Purpose
Apply the acceptance gate before a pack is treated as ready.

## Inputs
Pack package, profiles, evals, showcase and catalogue/benchmark registration state.

## Outputs
PASS, FAIL or BLOCKED with explicit findings.

## Preconditions
Package, profiles, evals and showcase all exist and validation runs after authoring, never
before; catalogue and benchmark registration state is observable, even when still empty.

## Invariants
Verify at least:
- reusable pack is justified;
- no existing pack plus project instruction is sufficient;
- coherent operational profile;
- hard constraints and defaults are distinguishable;
- self-contained runtime package;
- precedence and preservation;
- pack-aware evaluation;
- voice safety where relevant;
- no unnecessary provider implementation;
- canonical showcase and exact prompt;
- behavioural eval coverage;
- benchmark readiness;
- independent installability when environment permits.

A verdict reports what was actually checked; validation is not approval, which stays a human act.

## Forbidden behaviour
- Treating missing required validation as PASS.
- Treating file existence alone as quality proof.
- Repairing the pack under validation instead of reporting the finding.
- Converting a `BLOCKED` environment check into a pass.

## External capabilities
`scripts/validate-pack.ts` performs the structural checks; semantic acceptance stays a judgement.

## Failure routing
Each finding routes to the smallest owning command: identity to `define-pack`, operational
guidance to `derive-production-profile`, tolerate/reject rules to `define-evaluation-profile`,
voice safety to `define-voice-profile`, self-containment to `create-skill-package`, coverage to
`create-evals`, prompt and showcase to `create-showcase`. An environment that cannot prove a required gate yields `BLOCKED`.

## Evaluation hooks
Include deliberately invalid packs and blocked-environment cases.
Case: `validation-blocked-not-pass`.
