---
id: define-evaluation-profile
skill: video-extension-pack-creator
---
# define-evaluation-profile

## Purpose
Define how `video-evaluate` should judge outputs produced with the pack.

## Inputs
Operational production profile and preservation rules.

## Outputs
Pack-aware evaluation behaviour.

## Preconditions
- `derive-production-profile` has produced an operational profile whose intentional traits and
  must-preserve traits are stated observably.
- A trait that cannot be observed cannot be judged, so it is resolved upstream first.

## Invariants
Where useful distinguish:
- preserve;
- do_not_penalise;
- reject.

Intentional stylistic traits must not hide genuine production defects.
The preservation rules carried in from the production profile remain unchanged here.

## Forbidden behaviour
- Excusing broken continuity as style.
- Penalising intentional traits the pack explicitly requires.
- Restating a trait as intentional when the production profile does not declare it.
- Implementing evaluation itself; this command defines behaviour for `video-evaluate` to apply.

## Failure routing
A trait that is unobservable, missing or ambiguous in the profile routes to
`derive-production-profile`. A pack identity that cannot support a stable
tolerate/reject boundary routes to `define-pack`. Mis-set tolerance is owned here.

## Evaluation hooks
Use paired intentional-trait and real-defect controls.
Cases: `evaluation-intentional-vs-defect`, `evaluation-does-not-excuse-continuity`.
