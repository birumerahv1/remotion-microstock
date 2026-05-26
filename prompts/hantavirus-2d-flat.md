# Hantavirus — 2D Flat Microstock Prompt Pack

Prompt pack untuk menghasilkan asset microstock bertema **hantavirus** dalam gaya **2D flat vector illustration**. Pipeline:

1. **Text-to-Image** — generate gambar diam (still) via model T2I (GPT‑Image / GPT‑4o image gen, dll). Catatan: "GPT‑2" hanya text model, jadi prompt di bawah ditulis netral agar kompatibel dengan model T2I modern apa pun.
2. **Image-to-Video** — animasikan gambar via **Seedance 2.0** (ByteDance) menggunakan prompt motion di bawah.

---

## Pedoman Gaya Global (gunakan / paste pada setiap prompt T2I)

```
Style: modern 2D flat vector illustration, minimalist, infographic style,
clean geometric shapes, soft rounded edges, subtle grain texture optional,
flat colors with minimal gradient, limited harmonious color palette
(teal #2A9D8F, coral #E76F51, sand #F4A261, cream #FAF3E0, charcoal #264653),
generous negative space, balanced composition, isometric or front-facing
perspective, no photorealism, no text, no watermark, no logos,
microstock-ready, suitable for medical infographic, 4K, square or 16:9.
```

## Pedoman Negative Prompt (untuk model yang mendukung)

```
photorealistic, realistic skin, blood gore, horror, scary,
3d render, low quality, blurry, jpeg artifacts, text, letters,
watermark, signature, frame, border, brand logo, copyrighted character,
disfigured anatomy, extra limbs, cluttered background.
```

## Pedoman Gerak Global (gunakan / paste pada setiap prompt Seedance 2.0)

```
Motion style: gentle, looping-friendly, infographic animation,
slow parallax, subtle pulse and float, smooth easing, 24 fps,
camera mostly static with very slow push-in or pan,
preserve original flat 2D look, do not introduce 3D depth,
do not change colors or character design, no flicker, no morphing.
Duration: 5 seconds, loopable.
```

---

## SCENE 01 — Microscopic Hantavirus Virion

**Tujuan**: hero image untuk artikel/edukasi tentang struktur virus.

**Text-to-Image**
```
A single hantavirus virion seen through a microscope, 2D flat vector
illustration, spherical envelope with glycoprotein spikes rendered as
small rounded knobs, internal RNA segments shown as coiled lines,
soft teal and coral palette, cell background with abstract circular
particles and bokeh dots, scientific infographic style, centered
composition, plenty of negative space, no text, microstock-ready.
[paste Pedoman Gaya Global]
```

**Image-to-Video (Seedance 2.0)**
```
The virion slowly rotates around its vertical axis, glycoprotein spikes
gently pulse outward and inward in a soft breathing rhythm, background
particles drift slowly from left to right with parallax, very slow
camera push-in toward the virion. Loopable 5s clip.
[paste Pedoman Gerak Global]
```

---

## SCENE 02 — Deer Mouse, Vektor Utama

**Text-to-Image**
```
A friendly stylized deer mouse standing on a wooden plank in a barn,
2D flat vector illustration, cute but scientifically accurate proportions,
big round eyes, soft beige and brown fur, small straw pieces around,
warm cream background with subtle wood-grain pattern, educational
illustration tone (not horror), centered, no text.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
The mouse's nose and whiskers twitch subtly, tail sways gently side to
side, ears flick once every 2 seconds, straw pieces in the foreground
drift softly with imaginary air current, very slow camera dolly to the
right. Character must keep flat 2D vector look.
[paste Pedoman Gerak Global]
```

---

## SCENE 03 — Diagram Transmisi (Rodent → Human)

**Text-to-Image**
```
Infographic diagram showing hantavirus transmission path, 2D flat
vector style, left side: a deer mouse next to droppings and nesting
material; middle: airborne virus particles drawn as small dotted
clusters rising in the air; right side: a human silhouette inhaling,
connecting arrows in a soft curve, labeled-style icons (icons only,
no readable text), clean horizontal layout, plenty of negative space,
infographic background grid very subtle.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Animated arrows draw themselves from mouse to human in a slow flowing
loop, airborne virus dots float upward with gentle randomness, the
human silhouette's chest rises and falls in a breathing rhythm,
background grid remains static, camera holds steady.
[paste Pedoman Gerak Global]
```

---

## SCENE 04 — Gejala HPS (Hantavirus Pulmonary Syndrome)

**Text-to-Image**
```
A 2D flat vector character showing early HPS symptoms: fatigue, fever,
muscle aches. Character sits on a couch holding head with one hand,
thermometer floating beside as an icon, sweat drop icon, achy muscle
glow icons on shoulders and thighs, soft coral and teal palette,
clean home interior background simplified to geometric shapes,
educational infographic tone, no text.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Character's shoulders rise and fall slowly with breathing, sweat drop
icon gently pulses and slides down once per loop, thermometer icon
floats with a soft up-down hover, muscle ache glow icons pulse softly
in opacity. Camera holds steady.
[paste Pedoman Gerak Global]
```

---

## SCENE 05 — Cross-section Paru-paru Terinfeksi

**Text-to-Image**
```
A 2D flat vector medical cross-section of human lungs affected by
Hantavirus Pulmonary Syndrome, alveoli depicted as small clustered
circles with fluid build-up shown in coral-tinted areas, healthy
regions in soft teal, bronchi as branching lines, anatomical but
stylized, clean white background, infographic legend dots in corner
(no text), microstock medical illustration.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
The lungs expand and contract in a slow breathing animation,
coral-tinted fluid areas pulse subtly to emphasize affected zones,
bronchi lines shimmer with a very faint highlight pass from top to
bottom. Camera very slow zoom in toward the affected region.
[paste Pedoman Gerak Global]
```

---

## SCENE 06 — HFRS (Hemorrhagic Fever with Renal Syndrome)

**Text-to-Image**
```
2D flat vector medical illustration of human kidneys showing HFRS
involvement, stylized kidney shapes in soft pink-coral, highlighted
inflamed glomeruli as small accented dots, ureters and bladder
simplified, neutral cream background with subtle dotted grid,
educational infographic, no text, microstock-ready.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Kidneys gently pulse in a slow heartbeat rhythm, highlighted glomeruli
dots glow softly in and out of opacity, faint particle flow animates
through ureters downward to bladder. Camera holds steady.
[paste Pedoman Gerak Global]
```

---

## SCENE 07 — Pencegahan: Bersihkan Area Sarang Tikus dengan APD

**Text-to-Image**
```
2D flat vector illustration of a person wearing full PPE (N95 mask,
gloves, goggles, apron) cleaning a dusty storage shed corner with a
spray bottle of disinfectant and a damp cloth, rodent droppings
implied as small dotted clusters being safely wiped, do NOT sweep or
vacuum (no broom, no vacuum). Calm educational tone, soft palette,
warm wooden interior simplified, no text.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Person's arm slowly moves in a wiping arc across the surface,
disinfectant mist sprays out from the bottle in a soft particle burst
that fades, dust particles in the air drift gently downward (settling,
not rising). Camera holds steady or very slow pan right.
[paste Pedoman Gerak Global]
```

---

## SCENE 08 — Segel Rumah dari Tikus (Prevention)

**Text-to-Image**
```
2D flat vector cutaway of a house wall showing a small hole near the
floor being sealed with steel wool and caulk, magnifying glass icon
hovering nearby highlighting the entry point, exterior shows a tidy
yard with trimmed grass and trash bin with sealed lid, soft
educational tone, isometric or side perspective, no text.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Magnifying glass icon hovers and slowly orbits around the entry hole,
steel wool fibers gently shimmer, a subtle highlight sweeps left to
right across the wall, grass blades in the yard sway softly. Camera
holds steady.
[paste Pedoman Gerak Global]
```

---

## SCENE 09 — Penyimpanan Makanan Kedap

**Text-to-Image**
```
2D flat vector illustration of a kitchen pantry with food stored in
sealed glass and plastic containers on neat shelves, rice, pasta, and
cereal in airtight jars, a small icon of a deer mouse with a red
prohibition symbol over it floating in the corner, clean modern
kitchen background simplified to geometric shapes, soft palette,
no text.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Jars on shelves gently bob with a very soft float, prohibition icon
on the mouse pulses softly to emphasize the rule, subtle highlight
sweeps across glass jars. Camera very slow pan from left to right
across the pantry.
[paste Pedoman Gerak Global]
```

---

## SCENE 10 — Konsultasi Dokter & Diagnosis

**Text-to-Image**
```
2D flat vector scene of a doctor in scrubs talking with a patient in
a clinic, doctor holding a tablet showing a stylized lung icon and
virus dots, patient seated wearing a mask, calm reassuring atmosphere,
clinic background simplified with abstract medical icons (cross,
stethoscope) floating subtly, soft palette, no text.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Doctor's tablet screen subtly pulses with the lung icon, patient's
chest rises and falls slowly with breathing, floating background
medical icons drift gently. Camera very slow push-in toward the
tablet screen.
[paste Pedoman Gerak Global]
```

---

## SCENE 11 — Tes Laboratorium Hantavirus

**Text-to-Image**
```
2D flat vector illustration of a lab technician in lab coat and
gloves holding a test tube with a blood sample, microscope and PCR
machine simplified as icons in background, virus particle icons
hovering near the test tube, soft teal and cream lab interior, no
text, microstock-ready scientific infographic.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Test tube liquid gently swirls inside the tube, virus particle icons
slowly drift in a small orbit around the tube, microscope eyepiece
light pulses softly, PCR machine indicator dot blinks once per second.
Camera very slow push-in toward the test tube.
[paste Pedoman Gerak Global]
```

---

## SCENE 12 — Peta Distribusi Geografis

**Text-to-Image**
```
2D flat vector simplified world map highlighting hantavirus hotspot
regions (Americas for Sin Nombre type, East Asia and Europe for
Hantaan and Puumala types) marked with soft coral dots and small
mouse icons, ocean in soft teal, continents in cream, latitude and
longitude lines very faint, infographic legend dots in corner (no
readable text), microstock infographic.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Coral hotspot dots pulse in a staggered rhythm, faint connecting arcs
draw themselves between regions and fade, latitude lines shimmer
subtly. Camera very slow zoom out from a hotspot region to the whole
map.
[paste Pedoman Gerak Global]
```

---

## SCENE 13 — Cuci Tangan & Higiene

**Text-to-Image**
```
2D flat vector close-up of hands being washed under a faucet, soap
bubbles drawn as clustered circles, water flowing as smooth simplified
shapes, small virus icons being washed away down the drain with a
fade effect, soft teal and cream palette, sink simplified to clean
geometric shapes, no text.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Water flows continuously in a smooth loop from the faucet, soap
bubbles gently rise and pop, virus icons drift toward the drain and
fade out, hands rub together with a subtle micro-motion. Camera holds
steady on the sink.
[paste Pedoman Gerak Global]
```

---

## SCENE 14 — Kabin Pedesaan (Konteks Eksposur)

**Text-to-Image**
```
2D flat vector illustration of a wooden cabin in a forest clearing
at dusk, warm light glowing from the windows, tall pine trees
simplified, a tiny silhouette of a deer mouse near the porch (small
detail, not menacing), soft coral and teal sky gradient, microstock
landscape, peaceful educational tone, no text.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Window lights flicker very subtly with a warm pulse, smoke from the
chimney rises in a slow continuous loop, pine trees sway gently in
imaginary wind, mouse silhouette twitches once per loop. Camera very
slow push-in toward the cabin.
[paste Pedoman Gerak Global]
```

---

## SCENE 15 — Edukasi Komunitas / Poster

**Text-to-Image**
```
2D flat vector composition of a community health worker presenting a
poster board to a small group of villagers, poster shows simplified
icons of mouse, virus, mask, gloves, cleaning bottle (icons only, no
readable text), warm outdoor village background simplified to
geometric shapes, soft palette, inclusive diverse character designs,
microstock-ready.
[paste Pedoman Gaya Global]
```

**Image-to-Video**
```
Health worker's pointing hand moves slowly across the poster, icons
on the poster pulse softly one by one in sequence, listeners' heads
nod subtly, background trees sway gently. Camera very slow push-in
toward the poster.
[paste Pedoman Gerak Global]
```

---

## Tips Tambahan untuk Microstock

- **Aspect ratio**: generate dalam **1:1** (square), **16:9** (landscape), dan **9:16** (vertical/reels) untuk maksimum coverage.
- **Variasi warna**: regenerate scene yang sama dengan palette alternatif (mis. mono-teal, mono-coral) untuk memperbanyak portfolio.
- **Tanpa teks**: pastikan output bersih dari teks/huruf — text overlay sebaiknya ditambahkan terpisah agar buyer bisa melokalisasi.
- **Looping**: untuk Seedance 2.0, akhir frame harus mirip frame awal agar bisa di-loop seamless untuk stock video.
- **Durasi**: 5 detik adalah sweet spot — cukup panjang untuk dirasakan, cukup pendek untuk efisien.
- **Tone**: hindari nuansa horror/gore — gaya edukasi netral lebih laku di marketplace medis.
- **Compliance**: hindari logo brand, karakter berhak cipta, dan wajah orang nyata (gunakan karakter ilustrasi).

---

## Cara Menggabungkan ke Remotion

Setelah video pendek (5s) dihasilkan oleh Seedance 2.0, gunakan Remotion untuk:

1. Compose multi-scene sequence dengan crossfade halus antar scene.
2. Tambahkan text overlay terlokalisasi (ID/EN) di atas video.
3. Tambahkan music bed dan voice-over opsional.
4. Render variasi aspect ratio (16:9, 1:1, 9:16) dari satu sumber composition.
5. Batch render banyak topik medis lain dengan template yang sama.
