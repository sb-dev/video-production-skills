# Continuity

Continuity is evaluated against approved production constraints, not against a generic aesthetic preference.

Typical dimensions include:

- recurring character identity;
- product geometry, colour, branding and required text;
- wardrobe and props when specified;
- environment;
- screen direction;
- lighting and visual direction;
- adjacency between shots.

When continuity fails, correct the smallest artifact that owns the failure. Do not regenerate unaffected shots.

## Environment continuity is checked against a declaration

"Environment" is only checkable if something declares what the environment contains. Without that, continuity is judged against recollection, and a landmark can appear in one approved frame while existing in no other shot.

Before generating reference frames for any multi-shot production sharing a location, declare a **scene manifest**:

- **landmarks** — the fixed features that recur, each with an id and, where it matters, what it is attached to;
- **axis order** — the order landmarks occupy along the location's long axis;
- **camera side** — which side of that axis the camera works from;
- **per shot** — which landmarks are present, their screen order, and any attachment.

Every reference frame then declares the scene it belongs to and the landmarks in frame, and is checked against the manifest before approval. When `video-evaluate` is installed, its continuity validator performs this check deterministically.

A landmark that appears in a shot but in no manifest is an invention. Downstream shots will not agree about it, and the contradiction surfaces only after the expensive work is done.

## Do not edit the declaration to match the output

When a generated frame disagrees with the manifest, the frame is wrong until a human decides otherwise. Amending the manifest to fit whatever was produced converts a continuity failure into a silent redefinition, and the artifact stops governing anything.
