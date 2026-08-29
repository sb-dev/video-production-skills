# Video Production Skills — Extraction Candidates

## 1. Purpose

This register records possible cross-domain abstractions discovered while implementing Video Production Skills.

It is evidence for later review, not a roadmap and not permission to create shared runtime dependencies.

The governing rule is:

> **Share an abstraction only after at least two production domains need substantially the same concept.**

A candidate may be extracted only when:

1. at least two domains have independently implemented it;
2. the semantics are substantially equivalent;
3. a stable common contract exists;
4. extraction removes more complexity than it adds.

All candidates below are `observe only`.

---

## 2. Candidate Register

### 2.1 Draft-set semantics

**Implemented in**

- Video Production Skills

**Video semantics**

A deliberate set of comparable creative alternatives created to resolve a production decision. It is not synonymous with multiple execution takes.

**Possible second domains**

- Comic Production Skills — layout/panel alternatives
- Video Game Asset Production Skills — style/asset alternatives
- Narrative Production Skills — concept/scene alternatives
- Music Production Skills — concept/arrangement alternatives

**Known differences**

The media, comparison criteria, cost model, and promotion target differ by domain.

**Status**

`observe only`

---

### 2.2 Artifact provenance

**Implemented in**

- Video Production Skills

**Video semantics**

Lightweight lineage connecting production artifacts, parents, references, variants, requested changes, source files, and provider execution facts.

**Possible second domains**

- all production-family projects

**Known differences**

Domain-specific artifact relationships and provider evidence may differ substantially.

**Status**

`observe only`

---

### 2.3 Promotion and refinement semantics

**Implemented in**

- Video Production Skills

**Video semantics**

Approved decisions are inherited by downstream artifacts; refinements begin from the selected/approved parent and change only the required deficiency.

**Possible second domains**

- Narrative Production Skills
- Comic Production Skills
- Video Game Asset Production Skills
- Music Production Skills

**Known differences**

What constitutes an approved property and what is physically promotable differs by medium.

**Status**

`observe only`

---

### 2.4 Decision-state semantics

**Implemented in**

- Video Production Skills

**Current states**

```text
open
selected
approved
locked
```

**Possible second domains**

- Comic Production Skills
- Music Production Skills
- Video Game Asset Production Skills
- Advertising Production Skills

**Known differences**

`locked` has strong video editorial meaning through picture lock; other domains may require different commitment semantics.

**Status**

`observe only`

---

### 2.5 Staged evaluation lifecycle

**Implemented in**

- Video Production Skills

**Video semantics**

Evaluation intensity changes between `draft`, `refine`, and `final`, while the rubric remains artifact-specific.

**Possible second domains**

- all production-family projects

**Known differences**

The family may share lifecycle terminology while quality rubrics and corrective actions remain domain-native.

**Status**

`observe only`

---

### 2.6 Visual direction / art-direction semantics

**Implemented in**

- Video Production Skills

**Video semantics**

Persistent visual decisions covering look, palette, lighting, cinematography, camera language, styling, and environmental direction.

**Possible second domains**

- Video Game Asset Production Skills — art direction and style references
- Comic Production Skills — visual style/direction if independently required

**Known differences**

Camera, lens, movement, and shot-language semantics are intrinsically video-specific. A future shared abstraction must not weaken those concepts into a vague generic style object.

**Status**

`observe only`

---

### 2.7 Character identity

**Implemented in**

- Video Production Skills

**Video semantics**

A visual identity reference and semantic constraints reused across shots to preserve recurring-character continuity.

**Possible second domains**

- Video Game Asset Production Skills — character design sheets
- Comic Production Skills — recurring visual character references
- Narrative Production Skills — character profile, but semantic equivalence is uncertain

**Known differences**

A narrative character profile, visual character sheet, game-ready design sheet, and voice identity are not automatically the same abstraction.

**Status**

`observe only — high semantic-risk`

---

## 3. Explicit Non-Candidates

The following concepts currently remain domain-specific even when another project uses similar words.

### Video storyboard frame vs comic panel

Do not extract. A storyboard frame is a previsualisation/shot-planning artifact; a comic panel is final visual-narrative content or a direct precursor to it.

### `audio_mix` vs music mix

Do not extract. Video's `audio_mix` is a picture/program mix combining dialogue, supplied music, and effects for the video. Music Production Skills owns the internal mix/master of the music asset.

### `video_master` vs music master

Do not extract. They are final masters of different media with different production and delivery semantics.

### `delivery_variant` vs advertising channel adaptation

Do not extract. A video delivery variant adapts an approved video master technically/visually; Advertising Production Skills owns strategic channel adaptation of campaign creative.

### `shot_plan`, `reference_frame`, `motion_prototype`, `edit_timeline`

Keep local to Video Production Skills. They are video-production concepts unless a later domain independently proves equivalent semantics.

### Technical QC

Keep domain-native. Video media QC, game-asset technical readiness, comic readability/export checks, and music mix/master constraints may share infrastructure but not one quality contract today.

---

## 4. Review Trigger

Revisit this register when another production-domain repository reaches a working implementation.

For each candidate:

```text
implemented independently in 2+ domains?
        ↓ yes
semantically equivalent?
        ↓ yes
stable common contract?
        ↓ yes
net simplification?
        ↓ yes
extract
```

Otherwise leave the implementations independent.

## claude-video/watch — candidate execution substrate, not extracted

`claude-video/watch` provides scene-aware frame extraction and transcription, which is the
substrate `video-evaluate` needs to inspect video at all.

Not adopted: `docs/03` §5 requires each skill to remain self-contained, and
`skills/video-evaluate/scripts/sample-frames.ts` already covers extraction with no external
dependency. Recorded here so the overlap is visible if the self-containment rule is ever revisited.

Related prior art borrowed at the vocabulary level rather than extracted is credited in
`docs/04-testing-and-benchmark-spec.md` §5.
