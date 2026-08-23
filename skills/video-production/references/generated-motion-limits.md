# Generated Motion Limits

Current video models fail in predictable places. Stage so those places are outside the frame, rather than staging into them and then paying to fight the result.

## Frame out the weak spots

| Weakness | Staging response |
|---|---|
| Feet sliding, gait without ground contact | Keep feet out of frame where the shot allows; favour tighter framing over full-figure wides |
| Background figures morphing and swapping | Shallow depth of field so crowds resolve as bokeh rather than articulated bodies |
| Pseudo-text on signage, boards, displays | Keep text out of frame or defocus it deliberately; never rely on "illegible" as a safeguard |
| Repeating architectural lattice warping | Avoid long held wides on regular structures; break up the pattern with foreground |
| Subjects rotating on an axis instead of stepping | Prototype any turn before committing; keep turns short |
| Drift accumulating through a take | Prefer shorter takes; cut before the take destabilises |
| Detached or soft contact shadows | Avoid large uninterrupted reflective floors under moving subjects |

## Measured example

From `examples/level-2-missed-connection`, three shots of the same location, measured with `detect-motion-artifacts.ts`:

| Shot | Staging | Isolated spikes |
|---|---|---|
| SH02 | shallow depth of field, large foreground figure, crowd defocused | none |
| SH01 | medium-wide, mid-scale crowd in focus | first frame only |
| SH03 | medium, mid-scale crowd in focus | five, every ~19.7 frames |

The cleanest shot was the one staged closest to the model's strengths. That relationship is worth designing for, not discovering afterwards.

## Duration and holds

Long static holds on a generated crowd are where morphing is most visible, because nothing else in frame is moving to mask it. If a beat needs a hold, hold on something the model renders stably.

Shorter shots also bound drift: a defect that grows through a take is invisible in the first two seconds and obvious by the fifth.

## Model choice is a quality decision

Temporal stability varies by model, and provider acceptance says nothing about output quality. When several models can execute a shot, compare a short test with `detect-motion-artifacts.ts` before committing to the expensive take.

Do not encode a fixed ranking of models here. Measure the artifact, not the reputation.
