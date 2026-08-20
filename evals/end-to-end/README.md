# End-to-End Evals

The first end-to-end eval is intentionally behavioural. It checks workflow choice, artifact inheritance, provider delegation, local retry and master lineage rather than treating the subjective beauty of nondeterministic generated pixels as a stable regression target.

Live provider execution is a narrow smoke test and should not run on every pull request.
