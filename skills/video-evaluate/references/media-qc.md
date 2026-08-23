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

## Scope

This is deliberately not a broadcast-grade QC specification. It covers container validity and the failure modes generated media actually exhibits. Expand only when real delivery requirements demand it.
