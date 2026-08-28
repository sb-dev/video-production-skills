# Storyboard and Shot Planning

A storyboard and shot plan answer different questions.

## Storyboard

Answers: **What is the visual sequence?**

Preserve sequence, shot purpose, staging, composition, story progression and rough pacing. Keep frames independently addressable.

### Form

A storyboard is a **board**: one sheet of small numbered panels, not a set of separate pictures.

| Property | Specification |
|---|---|
| Artifact | one composed sheet, panels in a grid, three columns by default |
| Numbering | a number beneath each panel, outside the frame |
| Frame | thin black keyline per panel, paper-white sheet background |
| Register | uniform monochrome graphite or ink line work, low fidelity, fast to read |
| Panel content | clean — no arrows, no sight-lines, no labels, no legible text inside the frame |
| Shot variety | a deliberate range: wide, medium two-shot, close insert, full-figure action, atmosphere |

Rendered full-bleed illustrations are not board panels. A panel is a sketch that can be read in a second and redrawn in a minute; polish costs money and buys no decision.

### Panel count and fidelity

A board explores beats, so it is cheap and numerous. Favour many low-fidelity panels over a few polished ones.

One panel per final shot is not a storyboard. It is an illustration of a decision already taken, and it cannot test sequence, rhythm or coverage — which is the only reason the stage exists. Expect a board to carry more panels than the sequence will have shots, including inserts and atmosphere plates that may never become shots.

### Style consistency

Every panel carries an identical style clause, so the board reads as one hand.

Generate panels **individually** so they stay independently addressable and refinable, then compose the sheet deterministically with `scripts/make-storyboard.ts`.

Do not ask an image model to lay out a grid. Layout, numbering and framing are deterministic work, and a generated grid cannot be re-ordered, re-numbered or have a single panel replaced.

### Boards inherit approved references

A board frame must carry the approved character, wardrobe and environment references. A board showing different people, different clothing or a different period than the character sheet is not approvable, and noting the contradiction in a review is not the same as resolving it.

### Do not render a board that governs nothing

If the written storyboard is authoritative, do not generate board images to illustrate it. Generated frames that have been declared non-authoritative cost money, invite contradiction with their own parents, and cannot be used to decide anything.

Render board frames only when the image is the artifact that resolves the decision.

### Keep annotations outside the frame

Arrows, sight-lines and labels drawn into a board image obscure the composition the board exists to test. Put them beside the frame.

### Boards do not validate motion

A storyboard resolves sequence and staging. It says nothing about whether the motion will hold together. Board approval is not motion validation, and a stable board is not a reason to skip a motion prototype.

## Shot plan

Answers: **What exactly must be produced for each shot?**

Record only fields the production actually needs, such as shot ID, purpose, duration, framing, subject/action, camera behaviour, references, continuity constraints, dialogue/audio and technical requirements.

Prefer machine-checkable values for duration, framing dimensions and frame rate so plan and delivery can be compared automatically. Fields expressed only as prose cannot be reconciled against the master.

Do not build a universal professional shot-list schema in advance.
