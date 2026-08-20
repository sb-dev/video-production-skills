# Three-Shot Character Sequence

This is the initial end-to-end repository scenario. It demonstrates the production artifact chain without committing the repository to a specific generation model.

## Scenario

Create a short three-shot sequence of the same fictional courier arriving at a quiet apartment door, noticing a handwritten note, and reacting with cautious relief.

The example is deliberately small enough to inspect manually while still exercising visual direction, recurring identity, storyboard → shot-plan separation, reference-frame intent, shot selection, editorial lineage and evaluation/QC structure.

## Files

- `brief.md` — production intent;
- `visual-direction.yaml` — approved visual language;
- `character-manifest.yaml` — identity constraints;
- `storyboard.yaml` — sequence and shot purpose;
- `shot-plan.yaml` — executable shot requirements;
- `edit-timeline.json` — selected-shot editorial structure;
- `provenance.yaml` — lightweight lineage example;
- `evaluation-report.yaml` — example creative diagnosis structure;
- `qc-report.yaml` — example technical-QC structure.

Actual reference frames and video shots are produced during a live provider smoke run rather than committed as fake model output.
