---
id: derive-production-profile
skill: video-extension-pack-creator
---
# derive-production-profile

## Purpose
Translate the approved pack definition into operational Video Production behaviour.

## Inputs
Approved pack definition and relevant production requirements. The pack definition must be
human-approved before this command consumes it.

## Outputs
Operational production profile.

## Preconditions
- `define-pack` has produced a create-or-adapt decision with a justified pack identity.
- That definition is approved; a reuse decision ends the authoring run instead.

## Invariants
Include only relevant dimensions:
- visual language;
- materials / rendering;
- cinematography;
- lighting;
- motion / performance;
- editing;
- audio;
- graphics / typography;
- delivery;
- preservation;
- hard constraints;
- softer defaults.

Hard constraints and softer defaults stay distinguishable, and explicit instructions and
approved artifacts keep precedence over the profile.

## Forbidden behaviour
- Style labels without operational meaning.
- Turning every optional dimension into a requirement.
- Reimplementing provider behaviour.
- Reopening or restating the approved pack identity to fit a convenient profile.

## External capabilities
`references/pack-contract.md` for the permitted pack dimensions.

## Failure routing
An incoherent or unjustified pack identity routes back to `define-pack`.
A trait that evaluation tolerates or rejects wrongly routes to `define-evaluation-profile`.
Only unobservable or missing operational guidance is owned here.

## Evaluation hooks
A style-only request must become observable production guidance.
Cases: `derive-profile-style-only`, `derive-profile-complete-brief`, `derive-profile-adapt-existing`, `derive-profile-labels-not-operational`.
