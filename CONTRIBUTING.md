# Contributing

Video Production Skills grows from real production workflows rather than speculative framework design.

## Contribution bar

A material change should answer:

1. What video-production problem does this solve?
2. Which workflow stage or artifact changes?
3. Which approved behaviour must remain stable?
4. How is the change evaluated?
5. What example or fixture demonstrates it?
6. Does it duplicate provider functionality or another Creative Production Skills project?

If the last answer may be yes, record the overlap in `docs/extraction-candidates.md`; do not extract it automatically.

## Keep the repository lean

Do not add generic provider abstractions, static model/pricing catalogues, workflow engines, artifact graph databases, universal creative schemas, empty guide trees, or specialist skills without demonstrated need.

## Skill changes

Each installable skill must remain self-contained under `skills/<skill-name>/`. Runtime references and scripts must travel with the skill.

For behaviour changes, update the relevant skill evals. Significant changes should also update the end-to-end fixture when applicable.

## Pull requests

Keep changes focused. Explain the production problem, the smallest change that solves it, and how you validated preservation of existing behaviour.
