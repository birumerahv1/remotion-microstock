# Remotion Microstock

Kumpulan template video [Remotion](https://www.remotion.dev) untuk kebutuhan **microstock** (Shutterstock, Adobe Stock, Pond5, dll), dengan **fitur image referensi** terintegrasi — pakai gambar Anda sendiri sebagai dasar setiap komposisi.

Output default: **1920x1080**, **30fps**, **10 detik**, **MP4 H.264 yuv420p** (memenuhi spek mayoritas microstock agency).

## Daftar Komposisi

| ID                | Cocok untuk                                   | Fitur kunci                                       |
| ----------------- | --------------------------------------------- | ------------------------------------------------- |
| `KenBurns`        | Travel, lifestyle, nature, food, real-estate  | Zoom + pan halus dari satu image                  |
| `Parallax`        | Cinematic intro, hero shots, abstract         | Background + foreground parallax (horizontal / vertical / zoom) |
| `ImageReveal`     | Promo, product launch, branding               | Wipe / circle / split reveal + headline           |
| `Slideshow`       | Travel reel, portfolio, product gallery       | Multi-image crossfade + zoom + caption per image  |
| `ProductShowcase` | Tech product, gadget, e-commerce              | Spotlight gradient + animated headline + CTA      |

## Fitur Image Referensi

Setiap komposisi menerima satu atau lebih **image reference** yang memakai schema bersama:

```ts
{
  src: "my-photo.jpg",        // path di public/, URL https://, atau data:
  focusX: 0.5,                // 0..1 — titik fokus horizontal (subjek)
  focusY: 0.5,                // 0..1 — titik fokus vertikal
  fit: "cover" | "contain",   // default: cover
  caption?: "Caption tampil di slideshow"
}
```

Cara supply image reference:

1. **File lokal** — taruh di `public/` (mis. `public/my-photo.jpg`) → cukup tulis `"my-photo.jpg"` sebagai `src`.
2. **URL publik** — `"https://images.unsplash.com/..."` langsung dipakai.
3. **Data URI** — `"data:image/png;base64,..."` untuk gambar inline / generated.

Resolver di [`src/utils/imageReference.ts`](src/utils/imageReference.ts) otomatis mendeteksi dan memilih `staticFile()` atau URL apa adanya, dan komponen [`<ReferenceImage>`](src/components/ReferenceImage.tsx) memakai `<Img>` Remotion sehingga renderer menunggu image selesai dimuat sebelum capture frame.

## Quick Start

```bash
npm install
npm start              # buka Remotion Studio
```

Studio akan terbuka di http://localhost:3000 — pilih composition di sidebar, edit props di panel kanan (termasuk image reference: ganti `src`, geser `focusX/focusY`, ubah `fit`).

## Render

```bash
# render satu komposisi ke MP4
npm run render:kenburns
npm run render:parallax
npm run render:reveal
npm run render:slideshow
npm run render:showcase

# atau render manual dengan props custom (JSON)
npx remotion render KenBurns out/my-clip.mp4 --props='{
  "reference": {"src":"my-photo.jpg","focusX":0.4,"focusY":0.3,"fit":"cover"},
  "endScale": 1.35,
  "endX": -80,
  "title": "Golden Hour"
}'
```

Output H.264 + `yuv420p` + CRF 18 sudah dikonfigurasi di `remotion.config.ts` agar siap upload ke microstock tanpa transcoding ulang.

## Pakai Image Anda Sendiri

1. Copy file (JPG/PNG/WebP) ke `public/`.
2. Buka Studio, pilih komposisi, set `reference.src` ke nama filenya (mis. `"mountain.jpg"`).
3. Geser `focusX` / `focusY` agar subjek tetap di frame saat zoom/pan.
4. Render dengan `npm run render:<nama>` atau via CLI dengan `--props`.

## Tips Microstock

- Hindari logo, wajah, dan tulisan brand di gambar referensi (alasan release).
- Gunakan gambar minimal 1920x1080 — atau lebih besar — agar Ken Burns / parallax tetap tajam ketika di-zoom.
- Default 10 detik cocok untuk loopable B-roll. Untuk klip lebih panjang, ubah `VIDEO_DURATION_SECONDS` di `src/constants.ts`.
- Setelah render, cek histogram audio/video dan keyword sebelum upload.

## Struktur Project

```
src/
  Root.tsx                       # registrasi semua Composition
  index.ts                       # entry Remotion
  constants.ts                   # resolusi, fps, durasi, sample image paths
  utils/imageReference.ts        # schema + resolver image reference
  components/ReferenceImage.tsx  # <Img> wrapper yang honour focusX/focusY/fit
  compositions/
    KenBurns.tsx
    Parallax.tsx
    ImageReveal.tsx
    Slideshow.tsx
    ProductShowcase.tsx
public/
  sample-images/                 # sample SVG bawaan
```
