# Brief — "Missed Connection"

- **projectId:** missed-connection
- **lifecycleState:** draft
- **decisionState:** approved (brief interpreted from user request)
- **productionPolicy:** balanced

## Intent

A 12–15 second, three-shot cinematic sequence. Two strangers move through a busy
urban railway station during evening rush and narrowly miss seeing each other.
The near encounter must be communicated **entirely through staging and editing** —
no dialogue, no titles, no voiceover, no explanatory device.

## Hard requirements

| Requirement | Value |
|---|---|
| Duration | 12–15 s (target **13.5 s**) |
| Aspect ratio | 16:9 |
| Tone | observational, romantic, understated |
| Characters | one man, one woman — visually distinct, consistent across all shots |
| Environment | large urban railway station, evening rush |
| Dialogue | none |
| Comprehension | proximity + missed encounter readable without explanation |

## Shot intent (from brief)

1. **Wide** — establish both characters moving through different parts of the same station.
2. **Crossing** — one passes foreground while the other moves behind.
3. **Glance back** — one character looks back moments after the other has gone.

## Optimisation targets

Ranked, because they conflict under generation pressure:

1. **Spatial continuity** — the audience must believe it is one station, one geography.
2. **Character identity** — the same two people, recognisable at wide-shot scale.
3. **Eyelines and screen direction** — the near-miss only reads if vectors oppose.
4. **Timing of the near encounter** — the proximity beat must be brief but legible.
5. **Subtle emotional storytelling** — restraint over performance.

## Explicit non-goals

- No dialogue, no on-screen text, no subtitles.
- No music score (out of scope for this skill). Ambient station atmosphere only.
- No romantic resolution — the point is that it does not happen.
- No stylisation that breaks photoreal observational documentary register.

## Production path selected

```text
Brief → Visual Direction → Character References → Storyboard → Shot Plan
      → Reference Frames → Video Shots → Edit Timeline → Master
```

**Skipped stages and why:**

- *Animatic* — sequence is three shots with a single timing question (the crossing
  beat). The still storyboard plus reference frames resolve it more cheaply.
- *Motion prototype* — motion in all three shots is pedestrian walking and one head
  turn. No material motion uncertainty to buy down. Escalating to a prototype would
  cost a shot generation to learn nothing the reference frame does not already fix.
