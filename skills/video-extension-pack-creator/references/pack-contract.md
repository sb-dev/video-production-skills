# Video Extension Pack Contract

A Video Production extension pack is one coherent reusable production profile consumed by `video-production` and `video-evaluate`.

## Decision order

```text
explicit user/project instructions
→ approved or locked artifacts/decisions
→ selected extension pack
→ core Video Production defaults
```

## Pack dimensions

Use only dimensions that materially affect the production:

```text
identity
intended use
format
genre
operational style
audience
optional voice/performance direction
hard constraints
defaults
visual language
cinematography
lighting
motion/performance
editing
audio
graphics/typography
delivery
must-preserve traits
pack-aware evaluation
revision behaviour
handoffs
external requirements
conflicts/incompatibilities
```

## Creation threshold

Create a new pack only when the production grammar is reusable and materially distinct.

Prefer:

```text
existing pack
+
project-specific instruction
```

over a trivial near-duplicate.

## Runtime package

```text
skills/<pack-slug>/
├── SKILL.md
├── references/
│   └── production-profile.md
└── evals/
    └── evals.json
```

Additional files must be justified by actual runtime content.

The installed pack must not depend on repository-level documentation or catalogue files.
