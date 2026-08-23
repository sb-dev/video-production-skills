# Continuity Evaluation

Judge continuity against the most specific approved parents and constraints available.

Possible checks:

- character identity;
- product fidelity;
- wardrobe/prop consistency;
- environment;
- screen direction;
- lighting/look;
- adjacent-shot coherence.

Do not collapse a narrative character profile, a visual character sheet and a voice identity into one generic character abstraction.

A continuity failure should recommend the smallest corrective action, such as refining the reference or affected shot rather than restarting the sequence.

## Environment continuity needs a scene manifest

Environment cannot be evaluated against nothing. Ask for the scene manifest first; if the production has none, that absence **is** the finding, and the corrective action is to declare the scene before generating further frames.

Run `scripts/validate-continuity.ts` before semantic judgement. It reports, deterministically and without a provider:

| Finding | Meaning |
|---|---|
| `unknown-landmark` | a shot contains a landmark the scene never declared |
| `attachment-contradiction` | the same landmark is anchored differently between shots |
| `screen-order-contradiction` | landmark order across frame contradicts the axis from the declared camera side |
| `landmark-discontinuity` | a landmark vanishes between shots that both contain it, with no camera move to explain it |
| `axis-violation` | the camera crossed the axis without declaring it, reversing screen direction |

These are cheap and exact. Spend semantic judgement on what the declaration cannot capture: whether the *image* actually matches what it claims, and whether the look, register and lighting hold.

## Classify the finding

Continuity findings are one class among four — technical, creative, **continuity**, generation/model. Say which. A landmark that drifted between generations is a generation defect; a landmark that was never declared is a continuity defect owned by the reference stage.
