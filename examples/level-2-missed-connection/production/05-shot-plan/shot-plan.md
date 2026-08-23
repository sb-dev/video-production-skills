# Shot Plan — "Missed Connection"

- **lifecycleState:** final
- **decisionState:** approved
- **parents:** `04-storyboard/storyboard.md`, `04-storyboard/review.md`, `02-visual-direction/visual-direction.md`, `03-characters/characters.md`

Total: **13.5 s** (5.0 + 4.5 + 4.0). Delivery 16:9, 1080p, 24 fps.

---

## Global constraints (apply to all three shots)

| Constraint | Value |
|---|---|
| Camera side | south of the concourse axis, looking north. **Never crossed.** |
| Elias vector | screen **left → right**, always |
| Nora vector | screen **right → left**, always |
| Kiosk vs board | coffee kiosk L5 is **always screen-left of** departure board L1 |
| Clock L2 | reads **17:48** in every shot |
| Crowd palette | charcoal / black / navy / beige / olive / grey only — no rust, no teal |
| Dialogue | none. Shots generated **silent**; audio built once at master. |
| Prohibited | subtitles, on-screen text, readable signage copy, logos, slow-motion, lens flare, rain, music |

**Reference frames are first frames.** Every reference frame depicts the shot's *entry
state*, not its payoff. The dramatic event happens inside the generated motion.

---

## SH01 — WIDE / ESTABLISH

| Field | Value |
|---|---|
| **shotId** | SH01 |
| **purpose** | Establish one station, one time, two identifiable people on converging paths |
| **duration** | 5.0 s |
| **framing** | high wide, ~28–35 mm equiv., camera on the south mezzanine looking north across the concourse; deep-ish focus |
| **entry state (reference frame)** | Elias at the **bottom-left**, near walking plane, mid-stride facing right, small but colour-legible. Nora **right of centre**, one depth plane further back, mid-stride facing left, coffee cup at chest height. Roughly one third of frame width between them. |
| **action** | Both continue on their vectors through the crowd. They do not meet within this shot; they end the shot closer together than they began. |
| **camera** | near-imperceptible slow push-in across the full 5 s. No pan, no tilt. |
| **required landmarks** | L1 board + L2 clock (upper centre), L3 arched roof + pendant lamps, L4 stone column (mid-concourse), L5 kiosk (screen-left of board), L6 platform gates (far side) |
| **continuity constraints** | Establishes the master geography. L1/L2/L3/L4/L5 positions set here bind SH02 and SH03. Camera is furthest back and highest of the three shots. |
| **references** | `03-characters/selected/CHAR-M-elias.jpg`, `03-characters/selected/CHAR-F-nora.jpg` |
| **audio** | silent |
| **risk** | Two small figures in a dense crowd may not read. Mitigation: protected colours, restricted crowd palette, and a pool of clear floor around each lead. |

## SH02 — THE CROSSING

| Field | Value |
|---|---|
| **shotId** | SH02 |
| **purpose** | The near miss — proximity and non-recognition, in one unbroken frame |
| **duration** | 4.5 s |
| **framing** | eye level, ~85 mm, compressed; Elias large in foreground, Nora sharp-enough mid-ground ~2 m behind |
| **entry state (reference frame)** | Elias **just entering at the frame-left edge**, foreground, partially cropped, striding right, head tilted **down-and-right** toward the phone in his right hand. Nora established **right of centre**, mid-ground, walking left, head tilted **up-and-left** toward the board. L4 stone column at the right edge. L1 board + L2 clock upper-left. |
| **action** | 0.0–1.2 s crowd and Nora only movement; 1.2–2.6 s Elias crosses foreground, briefly occluding her; **2.6–3.2 s the beat** — both in frame at closest proximity, sightlines diverging; 3.2–4.5 s Elias clears frame-right, Nora continues left, crowd closes |
| **camera** | locked off. No movement of any kind. |
| **required landmarks** | L1 board + L2 clock (upper-left), L4 stone column (right edge), L3 pendant lamps overhead |
| **continuity constraints** | Elias's eyeline **down-right**; Nora's **up-left**. Near-perpendicular, diverging, physically incapable of intersecting. Neither may turn toward the other at any frame. Same 17:48 clock. |
| **references** | selected SH01 reference frame (environment lock) + both character references |
| **audio** | silent |
| **risk** | The model may "helpfully" have them notice each other. Mitigation: eyelines specified as absolute constraints in the prompt, plus explicit negative instruction. |

## SH03 — THE GLANCE BACK

| Field | Value |
|---|---|
| **shotId** | SH03 |
| **purpose** | Give the miss an emotional cost without stating one |
| **duration** | 4.0 s |
| **framing** | ~50 mm medium, camera trailing slightly behind and to Nora's left; she is three-quarters-rear in the entry state |
| **entry state (reference frame)** | Nora **centre-left**, seen from three-quarters behind, walking away toward the left, head **still facing forward**. L1 board + L2 clock **upper-right** (behind her). L5 kiosk warm pool **screen-left** (ahead of her). Only anonymous charcoal/grey crowd in the space to her right. |
| **action** | 0.0–1.3 s she walks on, ordinary; 1.3–2.0 s she slows, head begins to turn back over her **right** shoulder; 2.0–3.0 s she looks **screen-right**, face three-quarters to camera, expression small and unresolved; 3.0–4.0 s she faces forward again and walks on out of frame left |
| **camera** | very slight tracking with her, settling to near-static as she turns |
| **required landmarks** | L1 board + L2 clock (upper-**right** — corrected from storyboard), L5 kiosk (screen-**left**), L3 pendant lamps |
| **continuity constraints** | **No rust-orange anywhere in frame.** Elias is gone; the colour the audience has been trained to hunt for must be absent. No other character may be distinctive enough to read as the object of her look. |
| **references** | selected SH01 reference frame (environment lock) + `CHAR-F-nora.jpg` |
| **audio** | silent |
| **risk** | Expression may overplay into longing, breaking the understated tone. Mitigation: prompt for "small, unresolved, almost nothing"; reject candidates that smile or emote. |

---

## Spatial continuity ledger

| Landmark | SH01 | SH02 | SH03 |
|---|---|---|---|
| L1 departure board | upper centre | upper **left** | upper **right** |
| L2 clock 17:48 | beneath board | beneath board | beneath board |
| L3 arched roof / pendants | full width | overhead | overhead |
| L4 stone column | mid-concourse, centre | **right edge, foreground** | — |
| L5 coffee kiosk | screen-left | — | screen-**left** |
| L6 platform gates | far side | — | — |

Board position migrates centre → left → right because the camera walks **westward
along the south side** across the sequence, following Nora. It never crosses the axis,
so the board stays north of frame throughout and the kiosk stays west of the board.
That migration is consistent, not contradictory, and it is what makes the three shots
feel like one continuous room rather than three matched angles.

## Execution

| Stage | Model | Settings |
|---|---|---|
| Reference frames | `google/nano-banana-pro` | 16:9, 2K, jpg, character + environment references |
| Video shots | `bytedance/seedance-2.0` | 16:9, 1080p, `image` = approved reference frame, `generate_audio: false` |
| Assembly / master | ffmpeg via `render-timeline.ts` | 1920×1080, 24 fps, H.264 |
| Ambience | generated once over picture lock | station atmos, no dialogue, no music |

`generate_audio: false` on every shot. Per-shot generated audio would cut with picture
and expose all three edit points; the brief also forbids dialogue, and a model asked for
station ambience will readily invent a tannoy voice.
