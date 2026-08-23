# Media QC

Run cheap deterministic checks before expensive semantic evaluation.

## Container and stream checks

- file/container readable;
- video stream present;
- expected duration;
- expected resolution and aspect ratio;
- expected frame rate;
- audio present when required;
- obvious stream corruption;
- explicit delivery requirements.

These establish that the file is valid. They say nothing about whether the picture holds together.

## Temporal and motion checks

Generated video fails inside a container-valid file. Run `scripts/detect-motion-artifacts.ts` on every shot considered for selection and on the master.

- **Periodic seams.** Evenly spaced discontinuities are the signature of a clip assembled from fixed-length latent chunks. Report the period. Random spikes from fast motion or a real cut are not evenly spaced.
- **Frozen frames.** Runs of near-identical frames, where a subject stops without the shot intending it.
- **Drift.** A steadily rising frame-to-frame delta means the take is destabilising as it runs; the usable region may be shorter than the take.
- **Sub-luma variation is not a seam.** Encoder keyframes and integer-pixel rounding of smooth motion both produce perfectly periodic sub-luma bumps. An absolute floor separates those from real seams; the relative ratio alone does not.

## Sampling adequacy

Still frames and contact sheets cannot show a temporal artifact, and sampling stills at an interval near the artifact's period hides it entirely. Treat still review as a staging check, never as a motion check.

### Frame-pack density

A review pack must be sampled at **no more than half** the shortest artifact period it is meant to reveal. Above that the sampling aliases and the defect becomes structurally invisible however carefully the frames are read.

Worked example: a pack sampled every 10 frames against a ~19.7-frame seam period is above the limit. Every sample lands between seams, so nothing looks wrong, and a defect present five times in five seconds survives review.

`scripts/sample-frames.ts` supports both modes:

- `--count N` spreads a handful of frames across the clip. This answers staging questions and nothing else.
- `--every N` samples every Nth frame in one pass. This is the review pack; choose N below half the period you care about, and default to a small N when the period is unknown.

## Usable range

`scripts/detect-motion-artifacts.ts` reports the longest span carrying neither a spike nor a frozen run.

Report it with every shot evaluation, including passes. Without it editorial picks an out-point by eye, and a take whose usable range is far shorter than its duration was never usable at the length it was cut to.

## Scope

This is deliberately not a broadcast-grade QC specification. It covers container validity and the failure modes generated media actually exhibits. Expand only when real delivery requirements demand it.
