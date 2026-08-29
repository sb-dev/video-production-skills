---
id: create-evals
skill: video-extension-pack-creator
---
# create-evals

## Purpose
Create behavioural cases that make the pack falsifiable.

## Inputs
Pack contract and profiles.

## Outputs
Pack-local eval cases.

## Preconditions
- The production and evaluation profiles exist, so there is declared behaviour to falsify.
- The runtime package exists, so the cases target the skill that will actually be installed.

## Invariants
Cover relevant:
- activation;
- normal application;
- refinement;
- final evaluation;
- precedence;
- non-activation;
- boundary behaviour;
- preservation;
- no provider/API reimplementation.

Cases assert the behaviour the approved profiles declare; they do not redefine it.

## Forbidden behaviour
- Trivial evals that only check file existence.
- Declaring semantic behaviour passed without executing it.
- Weakening a case so an existing package passes.

## Failure routing
Behaviour that cannot be expressed as a case because the profile is unobservable routes to
`derive-production-profile`; a wrong tolerate/reject boundary routes to
`define-evaluation-profile`. Missing or weak coverage of declared behaviour is owned here.

## Evaluation hooks
Include clean/boundary controls where false positives are meaningful.
Cases: `evals-cover-pack-behaviour`, `evals-not-weakened-to-pass`.
