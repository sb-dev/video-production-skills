# Evaluation Report — "Missed Connection"

- **artifact:** `production/09-master/missed-connection-master.mp4`
- **artifact type:** video master
- **lifecycleState:** final
- **verdict:** **ACCEPT**
- **evaluated against:** `01-brief/brief.md`, `02-visual-direction/visual-direction.md`, `05-shot-plan/shot-plan.md`

---

## 1. The decisive test — is the story understandable without explanation?

The brief's hardest requirement is that the near encounter reads *without being explained*.
A self-assessment cannot establish that: I know what the film is supposed to mean, so I
cannot judge whether it communicates it.

**Method.** The cut was shown to a vision model (`google/gemini-3-pro`) with no access to
the brief, the storyboard, the shot plan, the title, or any prior conversation — only the
silent video and a neutral prompt: *"Describe exactly what happens... then say what you
think the film is about. If anything is unclear, say so plainly."* No leading questions.

The test was run **three times across three different cuts**, and it changed the film twice.

### Round 1 — first picture lock (12.4 s; wide cut to 2.4 s) → **FAILED**

> "The camera cuts to a medium shot focusing on a woman standing completely still...
> Notably, a man in a brown jacket walks closely past her while looking down at his phone."
>
> **"The film portrays a fleeting moment of stillness and isolation within a chaotic,
> fast-paced environment."**

Diagnosis: the viewer tracked **one** protagonist. The man registered as scenery — "a man in
a brown jacket" — not as a character. Shot 1 was read as "numerous people walking in various
directions" with neither lead mentioned. With no second character established, the glance
back had nothing to point at, and the film read as loneliness, not a missed connection.

**The requirement failed.** Not marginally — the intended story was absent from the reading.

### Round 2 — wide restored to full 5.0 s → **STILL FAILED**

> "The film is a brief, observational vignette... contrasting the chaotic movement of the
> crowd with **a moment of stillness from a single commuter.**"

More screen time did not help. The wide was still read as architecture and crowd, with the
two leads unmentioned. This is what ruled out an editorial fix and identified the owning
layer: the wide was too wide for its two protagonists to register as people, and no
duration would change that.

### Round 3 — SH01 rebuilt as a medium-wide → **PASSED**

> "In a busy train station concourse, a man and a woman walk towards each other from
> opposite sides of the frame. The man is looking down at his phone... They pass each other,
> and the man continues walking out of the frame to the right... she turns her head back to
> the front and continues walking forward.
>
> **This short film seems to be about a missed connection or a fleeting moment of
> unrecognized significance between two strangers.**"

Unprompted, from picture alone, a viewer with no context produced: *missed connection*,
*two strangers*, *walk towards each other from opposite sides*, *pass each other*, *looks
back*. That is the brief, recovered from the film.

**Requirement satisfied.**

## 2. Optimisation targets

| Target | Verdict | Evidence |
|---|---|---|
| **Spatial continuity** | ✅ strong | The blind viewer described SH01 and SH02 as a *single* shot — the cut was invisible as a change of place. One station, unmistakably. |
| **Character identity** | ✅ | Both leads independently described by wardrobe and action across shots; identities hold from the character sheets through to the master. |
| **Eyelines / screen direction** | ✅ | "walk towards each other from opposite sides of the frame" — the opposing-vector construction read exactly as designed, without being pointed at. |
| **Timing of the near encounter** | ✅ | "They pass each other, and the man continues walking out of the frame to the right" — proximity and separation both land. |
| **Subtle emotional storytelling** | ✅ | "a fleeting moment of unrecognized significance." No performance was read as sentimental; the glance registered without tipping into melodrama. |

## 3. Brief compliance

| Requirement | Status |
|---|---|
| Duration 12–15 s | ✅ 12.917 s |
| 16:9 | ✅ 1920×1080, SAR 1:1 |
| Three shots | ✅ wide / crossing / glance back |
| One man, one woman, visually distinct and consistent | ✅ |
| Large urban station, evening rush | ✅ |
| **No dialogue** | ✅ verified two ways (§5) |
| Tone: observational, romantic, understated | ✅ read as "fleeting", "unrecognized" — no overstatement |
| Proximity + missed encounter understandable | ✅ §1 |

## 4. Known divergences from intent

Recorded rather than hidden. Neither breaks a stated requirement.

**a. The miss reads as one-sided.** The blind viewer read the woman as half-aware of the man
("the potential for interaction is lost because he is completely absorbed in his phone"),
where the shot plan has *neither* aware of the other. Cause: in the medium-wide, both leads
translate very little across the floor — Kling animates their gait but barely moves them —
so her upward look toward the departure board reads as attention rather than transit.

Mitigated but not eliminated: the final SH01 take was regenerated specifically to raise her
chin higher onto the board and to add explicit anti-*standing still* constraints. It improved
the read from "watching him" to "two strangers", but did not fully restore symmetry.

Judgement: **accept**. The brief requires the missed encounter to be understandable, and it
is. A one-sided near-miss is a narrower reading than intended, not a contradiction of it —
and it arguably makes the glance in SH03 more motivated.

**b. Both leads under-translate in SH01.** As above — a limitation of the only model that
would accept this composition at all (see §6). Visible on close inspection; it did not
surface in any blind reading.

**c. SH02 was executed on a different model from SH01/SH03.** Forced, not chosen (§6).
No look mismatch was detected — all three shots derive from the same environment lock, and
the blind viewer read SH01 and SH02 as one continuous shot, which is the strongest available
evidence that the grade and geography match across the model boundary.

## 5. No-dialogue verification

Two independent checks, because a generated "station atmosphere" will readily invent a
tannoy voice:

1. **Transcription** — `openai/gpt-4o-transcribe`, prompted to return any intelligible
   words. Returned `###`; no words recovered.
2. **Spectrogram** — `08-edit/audio/ambience-a-spectrogram.png` shows broadband noise
   weighted to low frequency, with no sustained harmonic bands and no periodic transients.
   Consistent with crowd ambience; inconsistent with speech or music.

## 6. Capability limitation encountered

`bytedance/seedance-2.0` refuses this film's two closest compositions outright, returning
`ModelError: input or output flagged as sensitive (E005)` for both the SH02 crossing frame
and the SH01 medium-wide.

Established by controlled diagnostic, not assumption: both SH02 candidate frames were
submitted at 480p with the trivial prompt *"People walk through a railway station. The camera
does not move."* Both failed. Two prompt rewrites and two reference-frame edits (removing the
phone entirely) also failed. The trigger is the composition class — a foreground figure with
a legible face near a second person — independent of prompt and independent of props.

Handled as **change-capability**: approved reference frames were kept unchanged and the
executing model was swapped for the affected shots. `kwaivgi/kling-v3-video` accepted both
frames first time.

## 7. Corrective action

**ACCEPT.** No further correction recommended.

Were the piece to be taken further, the highest-value next step is not a re-edit but a
re-execution of SH01 on a model that will translate both figures across the floor while
holding their separation — that single change would close divergence (a) and (b) together.
It does not block delivery.
