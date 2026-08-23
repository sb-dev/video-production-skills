# Video Shot Selection — "Missed Connection"

- **decisionState:** selected → approved
- **provenance:** `jobs-shots-v1/v2/v3/v4.provenance.json`, `jobs-sh01-v5/v7/v8.provenance.json`, `jobs-sh03-v6.provenance.json`, `jobs-sh02-diagnostic.provenance.json`

| Shot | Selected | Model | Why |
|---|---|---|---|
| SH01 | `sh01-t5` | `bytedance/seedance-2.0` | Only candidate in which **both** screen vectors are correct — Elias travels left→right, Nora travels right→left. |
| SH02 | `sh02-k1` | `kwaivgi/kling-v3-video` (pro) | Cleanest crossing beat; diverging eyelines hold; Elias exits frame-right cleanly. |
| SH03 | `sh03-t2` | `bytedance/seedance-2.0` | Only candidate with the full arc — walks away → glances back over her **right** shoulder → walks on. |

Three different failures had to be diagnosed and corrected at three different levels. Each
is recorded below because the correction level, not the fix itself, is the reusable part.

---

## Failure 1 — provider content filter on SH02 (capability failure)

**Symptom:** every `bytedance/seedance-2.0` call using the SH02 reference frame returned
`ModelError: The input or output was flagged as sensitive (E005)`. Four attempts, two
prompt rewrites, zero successes.

**Diagnosis path:**

1. Rewrote the prompt to remove anything that could read as one person tracking another
   ("blocking her from view", "hides her", "neither ever notices"). Still failed → not the prompt.
2. Hypothesised the phone (man holding a phone with a woman behind him → covert-photography
   pattern). Refined the frame twice to remove it — paper ticket, and empty hand on the
   satchel strap. **Still failed** → not the phone.
3. Ran a controlled diagnostic: both SH02 candidate frames at 480p with the trivial prompt
   *"People walk through a railway station. The camera does not move."* Both failed.

That isolates it: the composition itself trips seedance's input classifier, independent of
prompt and independent of the phone. Not a prompt failure, not a reference failure — a
**provider capability limitation**.

**Correction:** the approved reference frame was kept unchanged and the *executing model*
was swapped for that shot only. `kwaivgi/kling-v3-video` and `google/veo-3.1` both accepted
the identical frame on the first attempt.

Look consistency is protected because all three shots are conditioned on frames derived
from the same environment lock, so the first frame of SH02 is pixel-identical regardless of
which model animates it.

**Kling over Veo:** Veo's Nora sits lower in frame at the closest approach, so her upward
look reads more like a glance at his shoulder than at the board; Kling keeps her chin high
and her gaze unambiguously elevated and past him. Veo also re-introduced a rust-orange
figure at the left edge after Elias had exited, and its grade runs warmer than SH01/SH03.

## Failure 2 — SH01 motion (shot-design failure)

**Symptom (first pass):** an aggressive push-in instead of the specified imperceptible one;
the crowd degenerating into time-lapse streaks; and Elias and Nora converging until they
walked side by side — destroying the premise that they do not meet in the wide.

**Correction attempt 1 (prompt level):** dropped the push-in entirely, added explicit
real-time-speed and anti-streaking instructions, and forbade convergence. This fixed the
camera and the streaking — but exposed a deeper problem: **Nora's teal coat desaturated to
near-black** and she became unfindable at wide-shot scale.

**Correction attempt 2 (shot-design level):** the root cause was figure size. Two people
occupying a few dozen pixels each will not survive generation with their identity intact.
Rather than re-prompting again, the **reference frame** was rebuilt tighter — same camera
side, same geography, same landmarks, longer lens — so Elias stands about a third of frame
height and Nora about a quarter. Promoted as `SH01-establish.jpg`.

This is why the failure is logged as shot-design rather than prompt: no wording could have
made a 40-pixel-tall figure hold a saturated colour through generation.

## Failure 3 — SH01 screen direction (prompt failure, isolated by elimination)

**Symptom:** with the tighter frame, both Kling and Seedance moved Nora **rightwards** and
walked her out of the right edge — the exact opposite of her required vector, and a direct
contradiction of SH02 and SH03.

Verified against the source: cropping the reference frame confirmed she is staged in clean
**left-facing** profile, mid-stride. The frame was right; the instruction was being misread.

**Rejected fix:** first/last-frame conditioning. An end frame was generated with both leads
displaced, but the model returned them at essentially their original positions, so there was
no traversal to interpolate. Abandoned rather than iterated — it was solving the wrong problem.

**Correction:** replaced abstract direction with **landmark-anchored** direction. Instead of
"walks toward the LEFT of frame" — ambiguous between screen-left and the character's own left —
the prompt names destinations that exist in the picture:

> *"walks AWAY FROM THE TICKET GATES and TOWARDS THE WARMLY LIT COFFEE KIOSK ON THE
> LEFT-HAND SIDE OF THE PICTURE"*

Seedance then produced correct opposing vectors on the first attempt. Kling did not, and
still drifted her rightwards — so the same instruction is not equally legible to every model.

---

## Verified on the selected shots

| Check | SH01 | SH02 | SH03 |
|---|---|---|---|
| Elias travels left → right | ✅ x 640→1482 | ✅ exits frame-right | n/a (absent) |
| Nora travels right → left | ✅ x 1297→ off-left | ✅ crosses to his left | ✅ walks away leftwards |
| Camera behaviour as specified | ✅ locked off | ✅ locked off | ✅ slight drift, settles |
| Real-time speed, no streaking | ✅ | ✅ | ✅ |
| No eye contact between leads | ✅ | ✅ | n/a |
| Eyelines diverge at the crossing | n/a | ✅ his down-right, hers up-left | n/a |
| Glance back over the **right** shoulder, looking screen-right | n/a | n/a | ✅ |
| No rust-orange present | n/a | n/a (Elias present) | ✅ |
| Landmarks consistent with the ledger | ✅ | ✅ board left, column right | ✅ board right, kiosk left |
| Silent (no generated audio) | ✅ | ✅ | ✅ |

## Known defects carried into the edit

| Shot | Defect | Handling |
|---|---|---|
| SH01 | Elias and Nora fully cross at ~1.6–2.4 s, so the wide contains a distant version of the near-miss | Trimmed in the edit to end on the pass, so SH02 reads as a cut-in to the same encounter rather than a second one |
| SH02 | Nora stops walking after ~2.5 s and stands reading the board | Trimmed before the stall becomes noticeable; a commuter pausing at a departure board is in-register anyway |
| SH02 | Kling outputs 1928×1072, not 1920×1080 | Scaled and centre-cropped to fill at master render, not letterboxed |
| SH03 | She turns back almost immediately and holds the look ~2.5 s — a lingering search, not the planned brief glance | Accepted. The brief asks for the glance "moments after the other has disappeared"; an early turn is on-brief, and the long hold plays as searching rather than sentimental |
