# Media QC

Run cheap deterministic checks before expensive semantic evaluation.

Core checks where applicable:

- file/container readable;
- video stream present;
- expected duration;
- expected resolution and aspect ratio;
- expected frame rate;
- audio present when required;
- obvious stream corruption;
- explicit delivery requirements.

This is deliberately not a broadcast-grade QC specification. Expand only when real delivery requirements demand it.
