# Showcase Examples

The authoritative showcase for a catalogue pack lives at:

```text
extension-packs/<pack-slug>/README.md
```

Use this structure:

```markdown
# <Pack Name>

**Pack:** `<pack-slug>`

<short production identity>

## Production profile

<only relevant fields>

## What this pack changes

- ...
- ...

## Showcase

### <Showcase title>

<short production concept>

## Prompt

```text
Use video-production with the <pack-slug> extension pack to produce ...

Requirements:
- ...

Preserve:
- ...

Demonstrate:
- ...

Evaluate:
- ...
```

## Expected production traits

- ...

## Evaluation focus

- ...

## Install

```bash
npx skills add <actual-repository> \
  --skill <pack-slug> \
  --agent claude-code
```
```

The prompt must be directly usable and must expose both pack adherence and pack-specific failure modes.

Do not fabricate generated outputs, provenance, cost, evaluation results or benchmark scores.
