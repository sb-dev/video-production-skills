---
name: video-extension-pack-creator
description: Create, adapt, review, validate, and catalogue reusable Video Production customisation or extension packs. Use when deciding whether a reusable pack is justified, defining pack behaviour, creating pack-aware evals, or creating canonical showcase examples with full generation prompts.
license: Apache-2.0
compatibility: Requires Node.js 24.12+ for the bundled TypeScript validation script; no media tooling, provider credentials or network access are needed, because pack authoring produces contracts rather than generated output.
---

# Video Extension Pack Creator

Create coherent Video Production extension packs from real production needs.

## Operating sequence

1. Inspect the existing extension-pack catalogue before proposing a new pack.
2. Decide whether to reuse an existing pack, adapt one with project-specific instructions, or create a genuinely new reusable pack.
3. Define one coherent pack identity.
4. Translate format, genre and style into operational production behaviour.
5. Define pack-aware evaluation and optional voice behaviour where relevant.
6. Create the smallest self-contained Agent Skill package that is sufficient.
7. Create behavioural evals.
8. Create one canonical showcase with the exact generation prompt.
9. Validate the pack.
10. Add it to the catalogue only after validation succeeds.

Do not create a new pack when an existing pack plus project-specific instructions is sufficient.

## Commands

Use these existing internal command contracts:

```text
define-pack
derive-production-profile
define-evaluation-profile
define-voice-profile
create-skill-package
create-evals
create-showcase
create-catalogue-entry
validate-pack
```

They are bundled under `commands/` and are not independently installable Agent Skills.

`define-pack` owns the catalogue inspection and reuse/adapt/create decision before a new pack is defined.

## Precedence

```text
1. explicit user/project instructions
2. approved or locked video artifacts and production decisions
3. selected extension pack
4. Video Production Skills defaults
```

Never silently reopen approved work to satisfy a pack.

## Required authoring behaviour

A pack must:

- represent a coherent production grammar rather than a style label;
- distinguish hard constraints from softer defaults;
- describe observable visual, cinematographic, motion, editorial, audio, graphics and delivery behaviour only where relevant;
- define what must be preserved;
- define intentional traits that evaluation must tolerate;
- define genuine defects that evaluation must reject;
- define optional voice/performance direction safely;
- remain self-contained after selective installation;
- avoid provider/API reimplementation;
- include behavioural evals;
- include one canonical showcase with an exact fenced `## Prompt`;
- be registered with catalogue and benchmark surfaces only after validation.

## Minimum generated pack

```text
skills/<pack-slug>/
├── SKILL.md
├── references/
│   └── production-profile.md
└── evals/
    └── evals.json
```

Create extra references, assets or scripts only when they contain necessary runtime guidance.

## Canonical showcase

The source-repository catalogue showcase should live at:

```text
extension-packs/<pack-slug>/README.md
```

It must contain:

```markdown
## Prompt

```text
<exact copy-ready generation prompt>
```
```

Do not fabricate generated results, model provenance, costs, evaluation outcomes or benchmark scores before the showcase has actually been run.

## Local references

Read only what is needed:

- `references/pack-contract.md`
- `references/authoring-workflow.md`
- `references/showcase-examples.md`

## Validation

When repository tooling is available, use:

```bash
node scripts/validate-pack.ts <pack-directory>
```

Validation does not replace semantic evaluation, but structural failure blocks catalogue inclusion.

---

**Video Extension Pack Creator**  
**Version 3 — 27 August 2026**
