# Visual Direction — "Midnight Espresso"

**Artifact:** visual-direction
**Lifecycle:** final
**Decision:** approved
**Production policy:** balanced
**Deliverable:** single shot, 6.0s, 16:9, no dialogue

---

## Intent

A high-end coffee commercial beauty shot. One unbroken macro take of espresso
falling into a warm ceramic cup. The shot should read as *tactile* before it
reads as *pretty*: the viewer should want to reach into frame.

Premium here means restraint — one hero action, one light source family, no
props competing with the pour.

## Subject

- **Machine:** brushed / polished stainless commercial espresso group head,
  chrome portafilter with a dual spout. Only the lower group head and spout are
  in frame — the machine body is implied, never shown whole.
- **Espresso:** two thin, glossy, dark-amber streams converging into one, then
  breaking into the crema surface.
- **Cup:** small matte off-white / warm-cream ceramic demitasse, thick walled,
  slightly irregular hand-thrown lip. Sits on a dark walnut or stone tabletop.
- **Crema:** hazelnut-brown, dense, fine-bubbled, with slow marbled tiger-mottle
  swirl as the stream lands.
- **Steam:** thin, low-volume, backlit wisps rising from the cup and the spout.
  Steam must be *visible*, not smoky — this is the single most fragile element.

## Camera

- Macro / true close-up. Cup occupies roughly the lower-left third; the spout
  enters from upper frame.
- **Move:** one continuous slow lateral track left-to-right with a very slight
  push-in. No cuts, no rack focus stunt, no orbit.
- Shallow depth of field. Focus plane sits on the crema surface and the spout
  tip; background falls to soft bokeh.
- Locked-off feel — smooth dolly, no handheld shake.

## Lighting

- Warm, moody, low-key. Key temperature ~3000K.
- **Hard backlight / rim from behind and slightly above** — this is the
  functional light: it separates the steam from the background and puts a
  specular rim on the chrome and the cup lip.
- Soft warm bounce fill from camera left at low intensity, just enough to keep
  the crema from going muddy.
- Background: deep brown-to-black falloff, no visible walls, no windows.
- Amber-gold highlights, rich shadow, no cool cast anywhere.

## Environment

Clean tabletop. Dark wood or dark stone surface. Nothing else in frame — no
beans, no spoons, no saucer clutter, no text, no logos, no hands.

## Motion contract (what must actually happen in 6s)

| Time | Beat |
|------|------|
| 0.0–1.0s | Stream already running; crema surface settling. Camera begins lateral track. |
| 1.0–4.0s | Steady smooth pour, crema swirling and thickening, steam rising continuously through the backlight. |
| 4.0–6.0s | Camera still tracking with slight push-in; liquid level visibly higher; surface settles into a marbled crema. |

The pour does **not** start or stop on camera. Continuous flow start-to-end
avoids the two most common generative failures: a stream that materialises from
nothing, and a cup that fills impossibly fast.

## Optimisation targets (ranked)

1. Appetising crema texture — dense, glossy, marbled, not flat brown paint.
2. Believable liquid flow — continuous stream, consistent gauge, correct fall
   speed, real surface interaction.
3. Visible steam — legible against the backlight for most of the shot.
4. Warm commercial lighting — amber key, deep falloff, specular chrome.
5. Premium material detail — brushed metal grain, matte ceramic tooth.

## Negative constraints

No hands. No people. No text, logos, or branding. No saucer clutter, beans, or
latte art. No cool/blue grade. No smoke-machine haze. No morphing spout, no
extra spouts appearing. No cup that overflows. No cuts or transitions. No
subtitles. No camera shake.

## Audio

Silent master. Video models are prompted with `generate_audio: false` where
supported; audio is stripped at master regardless. A music bed is out of scope
for this deliverable.

## Downstream contract

Anything produced downstream inherits: 16:9, 6.0s, warm low-key backlit grade,
single continuous macro take, subject list above, negative constraints above.
