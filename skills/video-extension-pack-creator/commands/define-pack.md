---
id: define-pack
skill: video-extension-pack-creator
---
# define-pack

## Purpose
Decide whether a reusable Video Production extension pack is needed and, when justified, define its coherent identity.

## Inputs
Production need, current catalogue, explicit project instructions, relevant approved artifacts.

## Outputs
One of:
- reuse existing pack;
- adapt existing pack with project-specific instructions;
- new pack definition with justification.

## Preconditions
- Runs before authoring a new pack or materially redefining an existing one.
- Inspect the current catalogue first.

## Invariants
- Do not create trivial near-duplicates.
- Format, genre, style, audience and voice are dimensions of one coherent profile.
- Explicit instructions and approved artifacts remain higher precedence.

## Forbidden behaviour
- Creating a pack only because a style adjective differs.
- Skipping catalogue inspection.
- Treating a named creator or existing film as the complete style definition.
- Approving its own pack definition; approval is a human act and records `approvedBy`.

## External capabilities
`references/pack-contract.md`, current catalogue.

## Failure routing
If an existing pack is sufficient, stop new-pack creation and route to reuse/adaptation.
A defect in downstream operational behaviour routes here only when the pack identity
itself is incoherent or unjustified; otherwise it belongs to `derive-production-profile`.

## Evaluation hooks
Test reuse, adapt and create decisions separately.
Cases: `define-pack-reuse-existing`, `define-pack-project-override`, `define-pack-create-justified`.
