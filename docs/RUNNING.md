# Running the platform

Several ways to render videos with this repo — pick the one that matches your
environment.

| Option                                            | Local install needed?           | Best for                                              |
| ------------------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| [1. Local Node.js](#1-local-nodejs)               | Node 20+                        | Active development, fast iteration                    |
| [2. GitHub Actions (no install)](#2-github-actions-no-install) | Just a browser     | Occasional renders, no Docker, no Node               |
| [3. GitHub Codespaces](#3-github-codespaces)      | Just a browser                  | Studio preview in browser, full IDE in cloud          |
| [4. Docker / Compose](#4-docker--compose)         | Docker                          | Reproducible local renders, CI runners                |
| [5. Remotion Lambda](#5-remotion-lambda-serverless) | AWS account                   | Production, high-throughput batch rendering          |

---

## 1. Local Node.js

Cleanest path for development. Requires Node 20 or newer.

### Install Node 20

**Windows:**

- [nvm-windows](https://github.com/coreybutler/nvm-windows/releases): download `nvm-setup.exe`, then:
  ```powershell
  nvm install 20
  nvm use 20
  ```
- Or [fnm](https://github.com/Schniz/fnm) (PowerShell):
  ```powershell
  winget install Schniz.fnm
  fnm install 20
  fnm use 20
  ```
- Or [Volta](https://volta.sh/): `winget install Volta.Volta`, then `volta install node@20`.

**macOS / Linux:**

```bash
# nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20 && nvm use 20

# or fnm
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 20 && fnm use 20

# or volta
curl https://get.volta.sh | bash
volta install node@20
```

### Run

```bash
npm install
npm run studio        # Remotion Studio → http://localhost:3000
npm run render -- AbstractGradient
npm run batch -- variants/example.json
```

On Linux, additional system libraries are needed for headless Chromium. The
list of packages is in [Dockerfile](../Dockerfile) and
[.github/workflows/ci.yml](../.github/workflows/ci.yml) — install them once
with `apt-get`. On Windows and macOS, no extra system deps are needed.

---

## 2. GitHub Actions (no install)

Zero local install. Trigger a render from the GitHub web UI; download the MP4 as
an artifact.

1. Go to the **Actions** tab of the repo.
2. Pick the **Render** workflow on the left.
3. Click **Run workflow**.
4. Fill in:
   - **Composition**: one of the 5 ids
   - **Props**: inline JSON, e.g. `{"palette":"cyber","seed":11}` (or leave as `{}`)
   - **Quality**: `high`, `medium`, or `low`
   - **Batch**: tick to run all variants from `variants/example.json` instead
5. Click **Run workflow**.
6. When the job finishes, scroll down to **Artifacts** → download
   `remotion-render-<n>.zip`. The MP4 is inside.

Each render takes ~2–6 minutes on the free GitHub-hosted runners.

The CI workflow (`ci.yml`) also runs lint + typecheck + a smoke render on every
PR and push to `main`.

---

## 3. GitHub Codespaces

Open the repo in a cloud VS Code with all deps pre-installed.

1. On the GitHub repo page, click **Code → Codespaces → Create codespace on main**.
2. Wait for the container to build (~2 min the first time — the
   `.devcontainer/devcontainer.json` config installs Node 20, system deps for
   Chromium/ffmpeg, and runs `npm install`).
3. In the Codespaces terminal:
   ```bash
   npm run studio
   ```
4. Codespaces will auto-forward port 3000 and pop the Studio open in your
   browser. Render commands work exactly the same as locally:
   ```bash
   npm run render -- ProductShowcase --props='{"productName":"My Thing","price":"$99"}'
   ```
5. Free GitHub accounts get 60 core-hours/month of Codespaces; this repo only
   needs a 2-core machine.

Output MP4s land in `out/` inside the Codespace — right-click in the file
explorer to download.

---

## 4. Docker / Compose

See the [main README](../README.md#docker) for the full Docker section. Short
version:

```bash
docker compose build
docker compose run --rm render
docker compose up studio   # http://localhost:3000
```

---

## 5. Remotion Lambda (serverless)

For production-scale rendering (parallel frame rendering across hundreds of
Lambda workers), use Remotion Lambda. It's not wired up in this repo, but the
official docs cover the integration:

- <https://www.remotion.dev/docs/lambda>
- Required: an AWS account, an IAM user with the policies Remotion's CLI prints,
  and the `@remotion/lambda` package. The compositions in `src/` work as-is —
  Remotion Lambda renders the same bundle.

Typical command after setup:

```bash
npx remotion lambda render <serve-url> AbstractGradient out.mp4 --props='{"seed":42}'
```

Lambda costs scale per render (typically a few cents per minute of 1080p
output). Use this for production batches, not for iterating on compositions.
