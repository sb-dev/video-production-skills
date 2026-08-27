# Video Production Extension Pack Catalogue Specification

## 1. Purpose

This specification defines the curated catalogue of installable extension packs for Video Production Skills and the `video-extension-pack-creator` skill used to create new packs.

An **extension pack** is the installable Agent Skill distribution unit that implements the Video Production Customisation Pack contract.

```text
Customisation Pack contract
        ↓
Extension Pack
        ↓
installable Agent Skill
        ↓
video-production + video-evaluate
```

Every catalogue pack must include:

```text
pack identity
format
genre
style
audience
optional voice casting
production profile
evaluation behaviour
showcase example
generation prompt
behavioural evals
```

The catalogue exists to make the system immediately usable and to provide strong reference implementations for authors creating new packs.

## 2. Goals

The catalogue should:

- offer coherent ready-made production identities rather than low-level style fragments;
- cover a broad range of video formats, genres, production styles, and audiences;
- demonstrate each pack with a production that visibly exercises its defining characteristics;
- provide a copy-ready generation prompt for every showcase example;
- keep packs optional and independently installable;
- make pack-aware evaluation explicit;
- provide reference implementations for `video-extension-pack-creator`;
- avoid tying a pack to imitation of a named living creator or a single copyrighted work.

## 3. Catalogue Entry Contract

Every catalogue entry must contain the following fields.

```text
Name
Slug
Format
Genre
Style
Audience
Voices
Production focus
Showcase example
Generation prompt
```

The generation prompt must be fenced in a `text` code block and should be directly usable with `video-production` after the relevant extension pack is installed.

A showcase example should expose the traits that make the pack distinct. It should not be a generic production that happens to use the pack.

## 4. Repository Layout

The catalogue, installable skills, and benchmark are separate repository surfaces.

> **Target layout.** Only `docs/` and `skills/video-extension-pack-creator/` exist today. The
> `extension-packs/` surface below — its `manifest.json`, its per-pack showcases, and the pack
> skills themselves — is specified here and must be created before it can be cited as available.

```text
video-production-skills/
├── docs/
│   ├── video-customisation-packs-spec.md
│   └── video-extension-pack-catalogue.md
│
├── extension-packs/
│   ├── manifest.json
│   ├── README.md
│   ├── hand-drawn-fantasy-short/
│   │   └── README.md
│   ├── retro-cartoon-comedy/
│   │   └── README.md
│   └── ...
│
├── skills/
│   ├── video-extension-pack-creator/
│   │   ├── SKILL.md
│   │   ├── commands/
│   │   │   ├── define-pack.md
│   │   │   ├── derive-production-profile.md
│   │   │   ├── define-evaluation-profile.md
│   │   │   ├── define-voice-profile.md
│   │   │   ├── create-skill-package.md
│   │   │   ├── create-evals.md
│   │   │   ├── create-showcase.md
│   │   │   ├── create-catalogue-entry.md
│   │   │   └── validate-pack.md
│   │   ├── references/
│   │   ├── scripts/
│   │   └── evals/
│   │       └── evals.json
│   │
│   ├── hand-drawn-fantasy-short/
│   ├── retro-cartoon-comedy/
│   ├── anime-sci-fi-short/
│   └── ...
│
└── benchmarks/
    └── ...
```

Surface responsibilities:

```text
docs/06-video-extension-pack-catalogue-spec.md
→ normative catalogue design

extension-packs/
→ implemented discovery/showcase surface

skills/<pack>/
→ installable runtime surface

benchmarks/
→ measurement surface
```

`extension-packs/manifest.json` is the machine-readable authority for the implemented catalogue. Each pack should record only useful fields such as:

```text
slug
name
family
format
genre
style
audience
skillPath
cataloguePath
benchmarkCase
status
```

Use optional fields where appropriate. Do not add marketplace ranking, pricing, download counts, ratings, or speculative provider metadata.

The canonical showcase and exact generation prompt live at:

```text
extension-packs/<pack>/README.md
```

Do not duplicate the same authoritative showcase prompt under `examples/` unless materially different production evidence justifies a separate example.

Only create pack-local runtime files that contain useful production guidance.

## 5. Catalogue

# Traditional and 2D Animation

## 5.1 Hand-Drawn Fantasy Short

**Slug:** `hand-drawn-fantasy-short`

**Format:** cinematic animated short  
**Genre:** fantasy / adventure  
**Style:** cel / hand-drawn animation  
**Audience:** family / general  
**Voices:** optional narrator and character cast

**Production focus:** expressive drawn poses, consistent line work, painted backgrounds, clear silhouettes, fluid key motion, controlled frame-to-frame deformation.

**Showcase example:** **The Lantern Keeper**

A young keeper climbs a mountain path at dusk to relight a giant lantern before darkness reaches the valley.

**Generation prompt:**

```text
Use video-production with the hand-drawn-fantasy-short extension pack to create a 20-second animated sequence called "The Lantern Keeper".

Show a young lantern keeper climbing a windswept mountain path at dusk, protecting a small flame before using it to ignite a giant beacon overlooking the valley. Preserve the same character design, clothing, lantern, line quality, painted background language, and hand-drawn motion treatment across every shot.

Use 3 to 5 shots with expressive poses, readable silhouettes, fluid key movement, restrained secondary animation, and warm firelight against cool twilight. Create a storyboard and approved reference frames before final motion generation, then evaluate drawing consistency, motion cadence, character continuity, and lighting progression.
```

## 5.2 Retro Cartoon Comedy

**Slug:** `retro-cartoon-comedy`

**Format:** animated comedy short  
**Genre:** physical comedy  
**Style:** rubber-hose animation  
**Audience:** family / general  
**Voices:** optional ensemble cast

**Production focus:** bouncy rhythmic motion, elastic limbs, simplified forms, strong silhouettes, musical timing, controlled squash and stretch.

**Showcase example:** **Closing Time**

A tiny night-shift cleaner battles an impossibly stubborn rolling office chair while trying to finish work.

**Generation prompt:**

```text
Use video-production with the retro-cartoon-comedy extension pack to create a 15-second animated comedy called "Closing Time".

A small night-shift cleaner tries to push a rolling office chair under a desk, but the chair repeatedly springs away and turns the task into an escalating physical gag. Use rubber-hose limbs, bouncy rhythmic timing, strong silhouettes, simplified graphic backgrounds, controlled squash and stretch, and deliberately elastic motion.

Plan the gag as a short visual setup, escalation, and payoff. Preserve the cleaner and chair designs across shots and evaluate comic timing, pose readability, rhythmic movement, and intentional deformation rather than physical realism.
```

## 5.3 Anime Science-Fiction Short

**Slug:** `anime-sci-fi-short`

**Format:** cinematic animated short  
**Genre:** science fiction  
**Style:** anime / limited 2D animation  
**Audience:** teen / adult  
**Voices:** optional multilingual cast

**Production focus:** detailed key art, selective motion, dramatic compositions, strong lighting states, held frames, impact cuts, economical animation used deliberately.

**Showcase example:** **Orbital Silence**

A maintenance engineer outside a damaged orbital station sees every city light on Earth go dark at once.

**Generation prompt:**

```text
Use video-production with the anime-sci-fi-short extension pack to create a 25-second science-fiction sequence called "Orbital Silence".

An orbital maintenance engineer works outside a damaged station above Earth. During a quiet repair, every visible city light on the planet below suddenly goes dark. Use detailed key artwork, strong perspective, selective character movement, held compositions, controlled limited animation, dramatic lighting changes, and precise editorial emphasis rather than constant motion.

Keep the engineer suit, station geometry, Earth view, and colour script consistent. Use storyboard and reference frames to resolve the reveal before motion generation, and evaluate composition, key-pose quality, selective motion, continuity, and dramatic timing.
```

## 5.4 Rotoscoped Urban Drama

**Slug:** `rotoscoped-urban-drama`

**Format:** dramatic short  
**Genre:** contemporary drama  
**Style:** rotoscoped animation  
**Audience:** adult  
**Voices:** optional naturalistic dialogue

**Production focus:** realistic human movement, traced or painted contour treatment, expressive colour, grounded performance, stylisation over believable motion.

**Showcase example:** **Platform 6**

Two former friends unexpectedly recognise each other across a crowded station platform but neither crosses the tracks to speak.

**Generation prompt:**

```text
Use video-production with the rotoscoped-urban-drama extension pack to create a 20-second dramatic sequence called "Platform 6".

Two former friends notice each other across opposite sides of a busy railway platform. They hesitate, exchange a brief look, and the arriving train blocks their view before either moves. Preserve realistic body mechanics and subtle acting while applying a coherent rotoscoped line-and-paint treatment across characters, commuters, and environment.

Use restrained camera movement and natural timing. Evaluate performance realism, contour consistency, colour treatment, identity preservation, and whether stylisation remains anchored to believable human motion.
```

# Stop Motion and Tactile Animation

## 5.5 Paper Cut-Out Satire

**Slug:** `paper-cutout-satire`

**Format:** animated short  
**Genre:** satire / comedy  
**Style:** paper cut-out animation  
**Audience:** teen / adult  
**Voices:** optional narrator and character voices

**Production focus:** layered paper materials, visible edges, limited joints, flat staging, graphic transitions, tactile imperfections.

**Showcase example:** **Quarterly Growth**

A cheerful cardboard executive keeps adding higher floors to a paper office tower while the base visibly collapses.

**Generation prompt:**

```text
Use video-production with the paper-cutout-satire extension pack to create a 15-second satirical animation called "Quarterly Growth".

A smiling cardboard executive celebrates each new floor added to a paper office tower while the lower floors visibly bend and collapse under the weight. Use layered cut-paper characters and props, visible paper edges, hinged movement, flat graphic staging, tactile shadows, and simple practical-looking transitions.

Keep the handmade material language consistent and let the physical limitations of cut-out animation shape the comedy. Evaluate paper texture, edge continuity, limited-joint motion, visual clarity, and comic escalation.
```

## 5.6 Claymation Family Adventure

**Slug:** `claymation-family-adventure`

**Format:** narrative animated short  
**Genre:** family adventure  
**Style:** claymation  
**Audience:** children / family  
**Voices:** narrator plus optional character cast

**Production focus:** clay fingerprints and tactile surfaces, miniature sets, stop-motion cadence, readable expressions, warm practical lighting, consistent model proportions.

**Showcase example:** **The Smallest Rescue**

A tiny clay fox crosses a flooded garden to return a lost toy boat to a child.

**Generation prompt:**

```text
Use video-production with the claymation-family-adventure extension pack to create a 20-second family adventure called "The Smallest Rescue".

A tiny clay fox crosses a rain-soaked miniature garden to retrieve a toy boat trapped in a puddle and return it to a waiting child. Preserve visible clay texture, subtle fingerprints, model proportions, miniature scale, warm practical lighting, and intentional stop-motion cadence across all shots.

Use clear silhouettes and simple emotional beats suitable for a family audience. Evaluate tactile material continuity, stepped motion, character readability, miniature-set coherence, and whether accidental smooth interpolation has been avoided.
```

## 5.7 Pixilation Music Video

**Slug:** `pixilation-music-video`

**Format:** music video  
**Genre:** playful / rhythmic  
**Style:** pixilation  
**Audience:** general  
**Voices:** none by default

**Production focus:** live human subjects moving in stop-motion increments, rhythmic staging, impossible-looking but physically grounded repositioning, beat synchronisation.

**Showcase example:** **Two Steps Sideways**

A dancer appears to glide through a city square without ever taking a normal step.

**Generation prompt:**

```text
Use video-production with the pixilation-music-video extension pack to create a 15-second rhythmic sequence called "Two Steps Sideways".

A dancer crosses a city square using pixilation: each pose changes in deliberate stop-motion increments so the performer appears to slide, jump, and reposition through real space without conventional continuous walking. Synchronise major pose changes to the beat and preserve the same performer, wardrobe, location, lighting, and camera position.

Do not smooth the motion into normal live action. Evaluate pose rhythm, beat synchronisation, intentional discontinuity, spatial coherence, and the distinction between designed pixilation and accidental motion artifacts.
```

## 5.8 Puppet Gothic Fantasy

**Slug:** `puppet-gothic-fantasy`

**Format:** cinematic animated short  
**Genre:** gothic fantasy  
**Style:** puppet animation  
**Audience:** teen / adult  
**Voices:** optional character cast

**Production focus:** articulated puppets, miniature practical sets, tactile costumes, expressive lighting, armature-consistent movement, atmospheric scale.

**Showcase example:** **The Clockmaker's Guest**

A wooden puppet clockmaker discovers a tiny visitor inside a grandfather clock at midnight.

**Generation prompt:**

```text
Use video-production with the puppet-gothic-fantasy extension pack to create a 25-second short called "The Clockmaker's Guest".

In a miniature candlelit workshop, an articulated wooden clockmaker puppet opens a grandfather clock at midnight and discovers a tiny cloaked visitor standing inside the mechanism. Use tactile puppet materials, miniature practical sets, visible fabric and wood textures, shallow depth of field, restrained stop-motion movement, and dramatic practical-looking lighting.

Preserve puppet proportions, costume, workshop geography, clock design, and handmade material language. Evaluate armature-consistent movement, tactile continuity, miniature scale, lighting, and atmosphere.
```

## 5.9 Paint-on-Glass Poetic Short

**Slug:** `paint-on-glass-poetic-short`

**Format:** poetic animated short  
**Genre:** impressionistic drama  
**Style:** paint-on-glass animation  
**Audience:** general / adult  
**Voices:** optional narrator

**Production focus:** fluid painterly transitions, wet-brush texture, evolving forms, colour transformation, image-to-image metamorphosis.

**Showcase example:** **After the Storm**

A painted coastline transforms from violent storm to calm sunrise without hard cuts.

**Generation prompt:**

```text
Use video-production with the paint-on-glass-poetic-short extension pack to create a 20-second animated piece called "After the Storm".

Show a coastline during a violent storm gradually transforming into a calm sunrise. The imagery should evolve continuously as if wet oil paint is being pushed, blended, erased, and repainted directly on glass. Let waves become clouds, clouds become light, and dark blues gradually turn into warm morning colours.

Avoid rigid object edges and conventional shot-to-shot cutting where possible. Evaluate painterly continuity, fluid transformation, brush texture, colour progression, and whether motion feels intentionally hand-manipulated rather than digitally morphed.
```

## 5.10 Sand Animation Fable

**Slug:** `sand-animation-fable`

**Format:** short visual fable  
**Genre:** poetic / family  
**Style:** sand animation  
**Audience:** family / general  
**Voices:** optional narrator

**Production focus:** granular silhouette drawing, flowing transformations, high-contrast lightbox presentation, economical shapes, tactile particle movement.

**Showcase example:** **The Bird and the Dune**

A small bird searches a desert for water as the landscape continuously redraws itself around it.

**Generation prompt:**

```text
Use video-production with the sand-animation-fable extension pack to create a 20-second visual fable called "The Bird and the Dune".

A small bird crosses a desert looking for water while dunes, wind, footprints, and clouds continuously transform through manipulated sand on a lit surface. Use clear silhouettes, granular texture, flowing redraws, restrained colour, and transformations created by adding, sweeping, and removing sand.

Keep the bird recognisable even as forms simplify. Evaluate granular material behaviour, silhouette readability, transformation continuity, tactile imperfection, and whether the piece preserves a genuine sand-animation visual language.
```

# 3D and Computer Graphics

## 5.11 Photoreal CGI Creature Short

**Slug:** `photoreal-cgi-creature-short`

**Format:** cinematic short  
**Genre:** naturalistic science fiction  
**Style:** photorealistic CGI  
**Audience:** general / adult  
**Voices:** none by default

**Production focus:** believable materials, physically grounded lighting, realistic creature motion, environmental integration, scale, camera realism.

**Showcase example:** **First Light**

A bioluminescent animal emerges from a misty forest at dawn and drinks from a stream.

**Generation prompt:**

```text
Use video-production with the photoreal-cgi-creature-short extension pack to create a 20-second cinematic sequence called "First Light".

At dawn in a misty forest, a previously unknown four-legged animal with subtle bioluminescent markings emerges from the trees, approaches a stream, drinks, then looks toward camera before disappearing into fog. Treat the creature as a physically present animal with consistent anatomy, weight, fur or skin response, contact shadows, reflections, and environmental interaction.

Use restrained natural-history cinematography rather than spectacle. Evaluate anatomy, material realism, motion weight, lighting integration, environmental contact, and creature continuity across shots.
```

## 5.12 Stylised 3D Fantasy Short

**Slug:** `stylised-3d-fantasy-short`

**Format:** cinematic animated short  
**Genre:** fantasy / adventure  
**Style:** stylised non-photorealistic 3D  
**Audience:** family / teen  
**Voices:** optional character cast

**Production focus:** painterly or graphic 3D rendering, intentional shape language, selective frame cadence, expressive lighting, non-photoreal materials.

**Showcase example:** **The Last Seed**

A young traveller plants the final glowing seed in a dead stone valley and watches colour return.

**Generation prompt:**

```text
Use video-production with the stylised-3d-fantasy-short extension pack to create a 25-second fantasy sequence called "The Last Seed".

A young traveller crosses a desaturated stone valley, kneels, and plants a glowing seed. Light spreads through cracks in the ground and colour gradually returns to the environment. Use deliberate stylised geometry, painterly materials, expressive shape language, controlled non-photoreal lighting, and selective frame cadence.

Do not drift toward photoreal rendering. Preserve the character, seed, environment geometry, and graphic treatment across shots. Evaluate art-direction consistency, stylised materials, animation cadence, composition, and transformation clarity.
```

## 5.13 Machinima Science-Fiction Action

**Slug:** `machinima-sci-fi-action`

**Format:** cinematic action short  
**Genre:** science fiction / action  
**Style:** machinima / real-time game-engine cinematics  
**Audience:** teen / adult  
**Voices:** optional squad dialogue

**Production focus:** real-time engine visual language, reusable game environments, virtual cinematography, gameplay-adjacent movement, coherent avatar and prop assets.

**Showcase example:** **Extraction Point**

A three-person rescue team crosses an abandoned industrial colony to reach an evacuation vehicle.

**Generation prompt:**

```text
Use video-production with the machinima-sci-fi-action extension pack to create a 25-second real-time cinematic called "Extraction Point".

A three-person rescue team moves through an abandoned industrial colony toward an evacuation vehicle while warning lights flash and distant machinery fails. Stage the action like a cinematic captured inside a coherent game world: reusable environment assets, consistent avatars, real-time lighting, practical virtual-camera moves, and readable gameplay-scale geography.

Keep armour, weapons, environment modules, and screen direction consistent. Evaluate asset continuity, spatial readability, virtual cinematography, real-time rendering coherence, and action staging.
```

## 5.14 Low-Poly Retro Promo

**Slug:** `low-poly-retro-promo`

**Format:** short promotional film  
**Genre:** retro technology / design  
**Style:** low-poly 3D  
**Audience:** general / design audience  
**Voices:** optional narrator

**Production focus:** intentionally simplified geometry, flat or minimal materials, bold lighting, retro computer-graphics motion, readable silhouettes.

**Showcase example:** **Tomorrow's Commute, 1994**

A fictional 1990s technology company presents its vision of an electric city car from the future.

**Generation prompt:**

```text
Use video-production with the low-poly-retro-promo extension pack to create a 15-second fictional technology promo called "Tomorrow's Commute, 1994".

Present a compact electric city car as if a 1990s computer-graphics studio were imagining the future. Use intentionally low polygon counts, simple geometric wheels and bodywork, flat materials, hard-edged lighting, bold gradients, primitive city geometry, and deliberate retro 3D animation.

Do not "improve" the scene into modern photoreal CGI. Evaluate geometric consistency, low-poly style preservation, retro motion language, graphic clarity, and product readability.
```

# Motion Graphics and Digital Design

## 5.15 Vector Science Explainer

**Slug:** `vector-science-explainer`

**Format:** educational explainer  
**Genre:** science / education  
**Style:** vector art / flat design  
**Audience:** general / student  
**Voices:** narrator recommended

**Production focus:** geometric illustration, bold colour systems, iconography, clean hierarchy, diagrammatic transitions, voice-led timing.

**Showcase example:** **Why Cities Feel Hotter**

A short explanation of the urban heat island effect using a simple city block and energy-flow diagrams.

**Generation prompt:**

```text
Use video-production with the vector-science-explainer extension pack to create a 30-second educational video called "Why Cities Feel Hotter".

Explain the urban heat island effect with a clean flat-vector city block. Show sunlight hitting roofs and roads, heat being retained, reduced vegetation, and the contrast with a greener neighbourhood. Use bold geometric shapes, a limited colour system, clear labels, simple icons, smooth diagrammatic transitions, and narration-led pacing.

Prioritise clarity over visual spectacle. Evaluate information hierarchy, typography, diagram accuracy, timing with narration, and consistency of the graphic system.
```

## 5.16 Kinetic Typography Launch

**Slug:** `kinetic-typography-launch`

**Format:** launch / announcement video  
**Genre:** brand / product communication  
**Style:** kinetic typography  
**Audience:** general / consumer  
**Voices:** optional voice-over

**Production focus:** animated type, rhythm, hierarchy, word emphasis, transitions, audio synchronisation, format legibility.

**Showcase example:** **Zero to Everywhere**

A fictional mobility service announces expansion from one city to fifty using only type, numbers, lines, and sound.

**Generation prompt:**

```text
Use video-production with the kinetic-typography-launch extension pack to create a 15-second announcement video called "Zero to Everywhere".

A fictional mobility service expands from one city to fifty. Tell the entire story through animated words, numbers, lines, and simple brand shapes: "1 CITY", "50 CITIES", "ONE NETWORK", then the final launch message. Synchronise type scale, movement, cuts, and transitions tightly to music and sound accents.

Keep typography legible on mobile screens and preserve a coherent type system. Evaluate hierarchy, timing, readability, audio synchronisation, and whether motion reinforces meaning rather than decorating it.
```

## 5.17 Whiteboard Concept Explainer

**Slug:** `whiteboard-concept-explainer`

**Format:** educational explainer  
**Genre:** business / learning  
**Style:** whiteboard animation  
**Audience:** professional / general  
**Voices:** narrator recommended

**Production focus:** progressive drawing, visual metaphors, hand-drawn diagrams, narration synchronisation, clear spatial organisation.

**Showcase example:** **Why Queues Suddenly Explode**

A concise explanation of queueing behaviour using customers, counters, arrows, and a simple utilisation graph.

**Generation prompt:**

```text
Use video-production with the whiteboard-concept-explainer extension pack to create a 35-second explainer called "Why Queues Suddenly Explode".

Explain how queues grow rapidly when demand approaches service capacity. Draw customers, a service counter, arrows, and a simple utilisation graph progressively as the narrator introduces each idea. Maintain the appearance of a coherent hand-drawn whiteboard session with clear spacing and readable labels.

Do not reveal the complete diagram at the start. Evaluate drawing order, narration synchronisation, spatial clarity, legibility, and whether each visual appears exactly when it becomes useful.
```

## 5.18 Parallax History Documentary

**Slug:** `parallax-history-documentary`

**Format:** documentary short  
**Genre:** history  
**Style:** 2.5D / parallax animation  
**Audience:** general / educational  
**Voices:** narrator recommended

**Production focus:** layered archival imagery, depth separation, restrained virtual camera movement, period typography, respectful enhancement rather than fabricated action.

**Showcase example:** **The Street Before the Station**

An old city photograph is transformed into a layered view explaining how a neighbourhood changed when a railway station opened.

**Generation prompt:**

```text
Use video-production with the parallax-history-documentary extension pack to create a 30-second historical sequence called "The Street Before the Station".

Start from an archival-style photograph of a city street before a major railway station was built. Separate foreground people, buildings, street furniture, and background skyline into depth layers, then use restrained 2.5D camera movement while narration explains how the area changed after the station opened.

Preserve the photographic character and avoid inventing unsupported live action. Evaluate layer separation, parallax depth, camera restraint, period coherence, typography, and documentary readability.
```

# Live-Action Cinematographic Styles

## 5.19 Found-Footage Horror

**Slug:** `found-footage-horror`

**Format:** cinematic short  
**Genre:** horror  
**Style:** found footage  
**Audience:** adult  
**Voices:** naturalistic dialogue where needed

**Production focus:** recording-device consistency, operator-driven framing, practical lighting, imperfect exposure, natural performance, credible captured audio.

**Showcase example:** **Basement Camera 03**

A building caretaker reviews a fixed security camera and notices a door opening before anyone enters the room.

**Generation prompt:**

```text
Use video-production with the found-footage-horror extension pack to create a 25-second horror sequence called "Basement Camera 03".

Present the sequence as recovered security footage from a basement service corridor. A caretaker enters, checks a utility panel, and leaves. Several seconds later the locked door at the end of the corridor slowly opens even though no person appears. Preserve one believable recording device, fixed camera position, timestamp treatment, practical fluorescent lighting, restrained compression noise, and camera-local sound.

Do not polish the footage into conventional cinematic coverage. Evaluate recording-device consistency, spatial clarity, practical-light behaviour, intentional imperfection, and suspense timing.
```

## 5.20 Mockumentary Workplace Comedy

**Slug:** `mockumentary-workplace-comedy`

**Format:** short comedy scene  
**Genre:** workplace comedy  
**Style:** mockumentary  
**Audience:** teen / adult  
**Voices:** character dialogue required

**Production focus:** handheld observational coverage, talking-head interviews, reaction shots, awkward pauses, naturalistic performances, documentary-style reframing.

**Showcase example:** **The Emergency Plant Meeting**

An office team holds a serious emergency meeting because the communal plant has gone missing.

**Generation prompt:**

```text
Use video-production with the mockumentary-workplace-comedy extension pack to create a 30-second comedy scene called "The Emergency Plant Meeting".

An office manager calls an urgent team meeting because the communal desk plant has disappeared. Mix handheld observational coverage with short talking-head interviews and reaction shots. Let the humour come from completely serious performances, awkward pauses, small reframes, glances toward camera, and contradictory interview comments.

Preserve character identity, office geography, documentary camera language, and natural dialogue continuity. Evaluate performance naturalism, reaction timing, camera behaviour, interview consistency, and comedic edit rhythm.
```

## 5.21 Continuous-Take Thriller

**Slug:** `continuous-take-thriller`

**Format:** cinematic sequence  
**Genre:** thriller  
**Style:** one-shot / continuous take  
**Audience:** teen / adult  
**Voices:** optional dialogue

**Production focus:** uninterrupted spatial continuity, choreographed blocking, motivated camera movement, evolving staging, hidden transitions only when necessary.

**Showcase example:** **Floor 12**

A courier enters an office lift, realises the package is ticking, and has one floor to decide what to do.

**Generation prompt:**

```text
Use video-production with the continuous-take-thriller extension pack to create a 20-second single-take thriller called "Floor 12".

Follow a courier into an office lift carrying a sealed package. As the doors close, a faint ticking becomes audible. The courier checks the label, realises something is wrong, and looks up just as the floor indicator reaches 12. Present the scene as one continuous camera move with no conventional coverage cuts.

Plan blocking, focus, camera position, reflections, prop continuity, and timing before final generation. Evaluate uninterrupted spatial continuity, motivated camera movement, performance timing, package consistency, and whether any hidden transition remains invisible.
```

## 5.22 Cinema-Verite Documentary

**Slug:** `cinema-verite-documentary`

**Format:** documentary short  
**Genre:** observational documentary  
**Style:** cinema verite  
**Audience:** general / adult  
**Voices:** captured natural speech only where relevant

**Production focus:** observational camera, minimal intervention, available light, natural sound, spontaneous framing, real-time behaviour.

**Showcase example:** **Before Opening**

A baker prepares a neighbourhood bakery in the thirty minutes before the first customers arrive.

**Generation prompt:**

```text
Use video-production with the cinema-verite-documentary extension pack to create a 30-second observational documentary sequence called "Before Opening".

Observe a baker preparing a small neighbourhood bakery before opening: shaping the last loaves, cleaning flour from the counter, switching on the front lights, and unlocking the door as the first customer approaches. Use available-light cinematography, natural room sound, restrained handheld observation, imperfect but readable framing, and no staged interview setup.

The camera should feel present but unobtrusive. Evaluate behavioural naturalism, available-light consistency, observational camera language, natural sound perspective, and whether the edit avoids manufacturing unnecessary drama.
```

# Commercial and Product Production

## 5.23 Premium Product Launch

**Slug:** `premium-product-launch`

**Format:** commercial / product film  
**Genre:** premium advertising  
**Style:** photoreal live action / CGI  
**Audience:** premium consumer  
**Voices:** optional restrained commercial narrator

**Production focus:** product fidelity, premium materials, controlled studio lighting, precise camera motion, brand graphics, sound design, delivery variants.

**Showcase example:** **Aster One**

A fictional precision mechanical camera is introduced through macro engineering details and a restrained hero reveal.

**Generation prompt:**

```text
Use video-production with the premium-product-launch extension pack to create a 20-second launch film for a fictional precision camera called "Aster One".

Show the camera through controlled macro details of the lens mount, engraved controls, textured body material, shutter mechanism, and final three-quarter hero view. Preserve exact product geometry, branding, button layout, material finish, and proportions across every shot. Use precise slow camera movement, sculpted studio lighting, controlled reflections, tactile sound design, minimal typography, and a premium final lock-up.

Create a product manifest before generation and evaluate product fidelity separately from general visual quality. Produce a 16:9 master and a deliberate 9:16 delivery variant.
```

## 6. Catalogue Coverage

The initial catalogue must cover every style family in the Customisation Pack style catalogue with at least one installable reference pack. None of the packs below has been built yet; this is the required coverage, not a description of what ships today.

```text
Traditional and 2D
├── hand-drawn-fantasy-short
├── retro-cartoon-comedy
├── anime-sci-fi-short
└── rotoscoped-urban-drama

Stop Motion and Tactile
├── paper-cutout-satire
├── claymation-family-adventure
├── pixilation-music-video
├── puppet-gothic-fantasy
├── paint-on-glass-poetic-short
└── sand-animation-fable

3D and Computer Graphics
├── photoreal-cgi-creature-short
├── stylised-3d-fantasy-short
├── machinima-sci-fi-action
└── low-poly-retro-promo

Motion Graphics and Digital Design
├── vector-science-explainer
├── kinetic-typography-launch
├── whiteboard-concept-explainer
└── parallax-history-documentary

Live Action
├── found-footage-horror
├── mockumentary-workplace-comedy
├── continuous-take-thriller
└── cinema-verite-documentary

Commercial
└── premium-product-launch
```

The catalogue may expand with new coherent format/genre/style combinations without requiring a new core taxonomy.

## 7. `video-extension-pack-creator` Skill

### 7.1 Purpose

`video-extension-pack-creator` creates, adapts, reviews, validates, and catalogues reusable Video Production extension packs from proven production needs.

It must not assume that every request deserves a new pack.

### 7.2 Authoring Lifecycle

The existing Video command names remain unchanged. The stronger production-need-first standard is implemented through their orchestration:

```text
production need
      ↓
define-pack
  └─ inspect catalogue
  └─ decide reuse / adapt / create
      ↓
derive-production-profile
      ↓
define-evaluation-profile
      ↓
define-voice-profile        # only when relevant
      ↓
create-skill-package
      ↓
create-evals
      ↓
create-showcase
      ↓
validate-pack
      ↓
create-catalogue-entry      # only after validation passes
```

A partial authoring request should execute only the relevant operation and necessary prerequisites.

### 7.3 When a New Pack Is Justified

Create a new pack only when the requested profile materially changes stable reusable production behaviour such as:

```text
visual production grammar
cinematography grammar
motion / performance grammar
editing grammar
audio / voice treatment
delivery requirements
preservation rules
pack-aware evaluation target
cross-project handoff
```

If an existing pack already fits, reuse it.

If an existing pack plus project-specific direction is sufficient, adapt or override locally instead of creating a near-duplicate.

A new pack must include a concise justification describing why the current catalogue does not already cover the production grammar.

### 7.4 Inputs

The creator should accept as much of the following as the user provides:

```text
production need
pack concept
intended format
genre
style
audience
voice requirements
visual language
cinematography
motion language
editing language
audio direction
graphics / typography
delivery requirements
evaluation characteristics
reference works or production traditions
provider constraints
```

Missing fields should be derived only when necessary to make the pack coherent.

### 7.5 Command Model

The creator keeps the existing nine testable internal commands:

```text
define-pack
→ inspect the catalogue, decide reuse / adapt / create, and establish the coherent pack identity

derive-production-profile
→ translate the approved format / genre / style intent into operational visual, cinematographic, motion, editorial, audio, graphics, delivery, preservation, hard-constraint and default behaviour

define-evaluation-profile
→ define pack-aware preserve / do_not_penalise / reject behaviour and genuine failure conditions

define-voice-profile
→ define optional voice/performance roles and permitted configured references when relevant

create-skill-package
→ create the smallest self-contained Agent Skill package that implements the approved profiles

create-evals
→ create behavioural cases that make activation, application, refinement, precedence, non-activation and boundaries falsifiable

create-showcase
→ create the canonical catalogue README with the exact generation prompt, expected traits and evaluation focus

validate-pack
→ verify necessity, packaging, precedence, profile/eval completeness, showcase/eval presence, safety, installability and benchmark readiness

create-catalogue-entry
→ after validation, register the pack in the catalogue manifest and benchmark surfaces
```

These commands are internal to the installable `video-extension-pack-creator` skill directory. They are not separate Agent Skills.

The alignment with Narrative and Music is behavioural. It does not require identical command names or identical command granularity across projects.

### 7.6 Hard Constraints and Defaults

Each pack must distinguish hard requirements from softer defaults.

Hard constraints may include:

```text
required format
approved character or product identity
mandatory text / brand content
required delivery/aspect format
licensed voice dependency
explicit continuity constraints
```

Defaults may include:

```text
lighting preference
camera tendency
motion cadence
editing rhythm
sound treatment
graphics treatment
```

Do not turn every stylistic preference into a hard failure condition.

### 7.7 Required Pack Output

Runtime package:

```text
skills/<pack-slug>/
├── SKILL.md
├── references/
│   └── production-profile.md
└── evals/
    └── evals.json
```

Canonical catalogue showcase:

```text
extension-packs/<pack-slug>/README.md
```

Additional references are created only when useful.

### 7.8 Required `SKILL.md` Content

Every generated extension pack should define where relevant:

```text
pack identity
intended use
format
genre
operational style
audience
optional voice/performance direction
hard constraints
defaults
production behaviour
must-preserve traits
intentional traits evaluation must tolerate
genuine failure conditions
integration with video-production commands
integration with video-evaluate commands
revision behaviour
explicit user/project precedence
approved-artifact precedence
downstream handoffs
external peer/provider requirements
conflicts / incompatibilities
boundaries
```

The pack must remain useful as one installed Agent Skill.

### 7.9 Production Profile Generation

A style label alone is insufficient. Translate the requested style into observable production behaviour.

Example:

```text
claymation
→ tactile clay materials
→ visible handmade variation
→ miniature-set cinematography
→ deliberate stop-motion cadence
→ stable model proportions
→ practical-lighting feel
```

Pack-aware evaluation should distinguish:

```text
preserve
do_not_penalise
reject
```

For example:

```text
deliberate stepped motion
→ do_not_penalise

accidental smooth interpolation
→ reject
```

### 7.10 Showcase Standard

Every pack requires one canonical showcase at:

```text
extension-packs/<pack>/README.md
```

The README must contain:

```text
# Pack name
production identity
production profile
what this pack changes
showcase concept
## Prompt
exact fenced generation prompt
expected production traits
evaluation focus
install command
```

The prompt must be strong enough to expose pack adherence and pack-specific failure modes.

Do not fabricate generated video, model provenance, cost, evaluation outcomes, benchmark scores, or a `What happened` section until real production evidence exists.

### 7.11 Behavioural Evals

Every pack should cover relevant cases for:

```text
activation
normal application
draft/development behaviour where meaningful
refinement
final evaluation
precedence
non-activation
boundary behaviour
no provider/API reimplementation
```

Voice-enabled packs should additionally cover role and performance consistency where relevant.

### 7.12 Catalogue Registration

`create-catalogue-entry` runs only after `validate-pack` succeeds. It should:

```text
add/update extension-packs/manifest.json
verify canonical showcase path
register benchmark coverage
verify skillPath / cataloguePath / benchmarkCase cross-references
```

Do not silently catalogue an invalid or unbenchmarked pack.

## 8. Pack Acceptance Gate

A new extension pack may enter the catalogue only when:

```text
✓ a new reusable pack is justified
✓ no existing pack plus project-specific instruction is sufficient
✓ installs independently as an Agent Skill
✓ conforms to the Customisation Pack contract
✓ has a coherent format / genre / operational style combination
✓ hard constraints and defaults are distinguishable
✓ audience is defined where materially relevant
✓ voice casting is optional unless intrinsic to the format
✓ style is translated into operational production characteristics
✓ intentional traits are represented in evaluation behaviour
✓ video-production can apply the pack across relevant artifacts/commands
✓ video-evaluate can distinguish pack traits from genuine defects
✓ explicit user/project instructions remain higher precedence
✓ approved upstream artifacts remain higher precedence
✓ no provider API is reimplemented unnecessarily
✓ self-contained runtime package exists
✓ canonical extension-packs/<pack>/README.md exists
✓ canonical README includes an exact fenced ## Prompt
✓ behavioural evals pass
✓ benchmark coverage exists
✓ catalogue manifest cross-references validate
✓ creator command-targeted authoring evals pass where applicable
```

## 9. Installation

Install production skills:

```bash
npx skills add <org>/video-production-skills \
  --skill video-production \
  --skill video-evaluate \
  --agent claude-code
```

Install one extension pack:

```bash
npx skills add <org>/video-production-skills \
  --skill anime-sci-fi-short \
  --agent claude-code
```

Install the authoring skill:

```bash
npx skills add <org>/video-production-skills \
  --skill video-extension-pack-creator \
  --agent claude-code
```

Example authoring request:

```text
Use video-extension-pack-creator for a 30-second historical mystery short using paper-cutout animation, aimed at a general audience with an optional narrator.

First inspect the current extension-pack catalogue and decide whether to reuse, adapt, or create. If a new reusable pack is justified, create the installable skill, operational production profile, behavioural evals, canonical extension-pack showcase with its exact generation prompt, benchmark registration, and catalogue manifest entry.
```

## 10. Deferred Extensions

Do not introduce these until real catalogue usage demonstrates the need:

```text
pack inheritance
pack composition engine
automatic pack mixing
central style ontology
marketplace ranking
automatic pack generation from arbitrary films
automatic voice marketplace integration
provider-specific pack forks
```

New packs should initially be complete, coherent, independently installable production recipes.

## 11. Initial Implementation Order

```text
1. implement the production-need-first lifecycle using the existing nine video-extension-pack-creator commands
2. materialise the current approved catalogue under extension-packs/ + skills/
3. create extension-packs/manifest.json
4. ensure every pack has one authoritative showcase prompt
5. integrate pack-aware evaluation
6. create behavioural evals and benchmark registration for every catalogue pack
7. validate independent installation
8. test representative packs with real video generation
9. refine the creator skill from observed authoring failures
```

Recommended first implementation set:

```text
anime-sci-fi-short
claymation-family-adventure
stylised-3d-fantasy-short
kinetic-typography-launch
found-footage-horror
premium-product-launch
video-extension-pack-creator
```

These cover substantially different production grammars before the full catalogue is implemented.

---

**Video Production Extension Pack Catalogue Specification**  
**Version 3.1 — 27 August 2026**
