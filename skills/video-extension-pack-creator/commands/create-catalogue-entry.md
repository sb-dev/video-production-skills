---
id: create-catalogue-entry
skill: video-extension-pack-creator
---
# create-catalogue-entry

## Purpose
Prepare catalogue registration for a validated pack.

## Inputs
Validated pack package and canonical showcase.

## Outputs
Catalogue manifest entry and cross-references.

## Preconditions
`validate-pack` must have succeeded. A `FAIL` or `BLOCKED` verdict stops registration.

## Invariants
Register only real paths and benchmark references.
Do not guess repository identity.
The registered entry describes the validated pack unchanged; it introduces no new pack behaviour.

## Forbidden behaviour
- Catalogue registration before acceptance.
- Orphan manifest entries.
- Invented marketplace metadata.
- Treating registration as the human approval that acceptance requires.

## Failure routing
If validation or benchmark coverage is missing, do not catalogue.
A failing gate routes to the command `validate-pack` names as its owner; a missing or
non-authoritative showcase reference routes to `create-showcase`. Only manifest content and
cross-reference correctness are owned here.

## Evaluation hooks
Validate manifest → skill → showcase → benchmark cross-references.
Case: `catalogue-requires-validation`.
