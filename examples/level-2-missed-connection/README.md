# Missed Connection

**Level 2 — two-character near miss**

Two strangers cross a busy station and narrowly miss each other, told through staging alone.

## Prompt

```text
Use video-production to create a 12–15 second three-shot cinematic sequence called "Missed Connection".

Two strangers move through a busy railway station and narrowly miss seeing each other. The sequence should communicate the near encounter entirely through staging and editing, without dialogue.

Requirements:
- Duration: 12–15 seconds
- Format: 16:9
- Tone: observational, romantic, understated
- Characters: one man and one woman, each visually distinct and consistent
- Environment: large urban station during the evening rush
- Dialogue: none
- Visual storytelling must make their proximity and missed encounter understandable

Plan approximately three shots:
1. Wide shot establishing both characters moving through different parts of the same station
2. Crossing shot where one passes foreground while the other moves behind
3. Final shot showing one character glance back moments after the other has disappeared

Workflow:
- Define visual direction and station geography
- Establish character references for both people
- Storyboard the sequence before motion generation
- Build a shot plan that preserves spatial relationships and screen direction
- Produce reference frames for each shot
- Generate and select video-shot candidates
- Assemble the sequence
- Evaluate whether the story is understandable without explanation

Optimise for:
- spatial continuity
- character identity
- eyelines and screen direction
- timing of the near encounter
- subtle emotional storytelling
```

## What happened

A production run was made and failed. It self-declared **ACCEPT / QC PASS** and shipped a sequence
carrying visible generation seams, a pillar present in one approved reference frame and in no other
shot, and creative direction nobody had approved. The run is not kept here.
`docs/research-logs/2026-08-23-missed-connection-postmortem.md` records the failure chain, and
`docs/04-testing-and-benchmark-spec.md` specifies the testing layers it produced.

The brief above is unchanged and still open.

## Files

Seven stills from the failed run are retained under `production/`, and nothing else is. They are
inputs to the defect benchmark: `tests/fixtures/defects/taxonomy.json` scores the evaluation against
them, because artifacts whose defects are known in advance are what make a detection score mean
anything. They are not an example of what the workflow should produce.
