# SH02 / SH03 Reference Frames — selection

- **decisionState:** selected → approved
- **conditioning:** `selected/SH01-wide.jpg` (environment lock) + character references
- **provenance:** `jobs-sh02-sh03-v1.provenance.json`, `jobs-sh02-v1-retry.provenance.json`, `jobs-sh03-refine-v2.provenance.json`

A transient `ModelRateLimitError` killed both SH02 candidates on the first pass.
Classified as a **provider failure**, not a prompt failure — retried once, unchanged,
and both succeeded. No prompt was altered in response to it.

---

## SH02 — the crossing

| | Geography | Eyelines | Identity risk | Verdict |
|---|---|---|---|---|
| sh02-a | board upper-left ✅, column right edge ✅ | his down-right ✅, hers up-left ✅ | **two extra teal coats** in the mid-ground, one close to Nora | rejected |
| **sh02-b** | board upper-left ✅, column right edge ✅ | his down-right ✅, hers up-left ✅ | one small teal coat, far back and minor | **SELECTED** → `selected/SH02-crossing.jpg` |

**Why sh02-b.** Both frames get the hard geometry right. The separator is identity.
`sh02-a` puts a second and third teal coat in the mid-ground, one of them near Nora and
at similar scale. This shot is where the audience has to hold two specific people in one
frame for about half a second; a duplicate of a protected colour standing next to the
person it protects is the most expensive error available here.

`sh02-b` also gives Elias more foreground mass — he reads unambiguously as the nearer
plane, which is what makes "he passed in front of her, two metres away" legible rather
than merely asserted.

**Checked and confirmed on sh02-b:**

- Elias enters at the left, cropped by the frame edge, striding right — a true *entry*
  state, so the crossing happens inside the generated motion.
- His head is down and angled right at the phone. Her chin is up and turned left toward
  the board. The sightlines diverge; no accidental intersection is geometrically possible.
- Depth separation is real: his scale versus hers puts roughly two metres between the planes.
- Board upper-left, column right edge — consistent with the kiosto→board→column chain
  locked by SH01.

**Accepted defect:** a small dark-red object at the extreme bottom-right corner, largely
cropped. SH02 is the one shot where rust-orange is *supposed* to be present, so a
desaturated red at the frame edge cannot be mistaken for Elias.

## SH03 — the glance back

| | Geography | Identity risk | Verdict |
|---|---|---|---|
| **sh03-a** | board upper-right ✅, kiosk far left ✅ | clean — Nora is the only teal in frame | **SELECTED**, then refined |
| sh03-b | board upper-right ✅, kiosk far left ✅ | **a second woman in a teal coat holding a coffee cup**, prominent, right of frame | rejected |

**Why sh03-b was rejected outright.** It reproduces Nora's *entire* silhouette signature —
teal coat, coffee cup, dark hair — on a second, prominent figure. In the shot whose whole
job is "the person you are looking for is not here," a near-duplicate of the person you
*are* watching is disqualifying.

**Why sh03-a still needed a refine pass.** SH03's payload is an absence: the rust-orange
the audience has spent nine seconds learning to hunt for must not appear. `sh03-a` carried
a small orange-ish item in the mid-ground crowd. Small, but it sits exactly in the region
Nora looks back into, and a viewer primed for that colour will find it.

**Refine (`sh03-a-r1`), from the selected parent:** recolour stray orange/red garments and
carried objects to the muted crowd palette. Everything else — camera, framing, crowd
positions, Nora's pose and wardrobe, lighting, grade — explicitly preserved. The warm amber
*lamp light* was explicitly protected, since that is lighting, not wardrobe, and it is part
of the approved visual direction.

This is a **reference-frame-level** correction: the failure was composition/content within
one frame, so it was fixed in that frame rather than by reopening the shot plan.
