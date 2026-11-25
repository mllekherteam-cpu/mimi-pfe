# Mimi · Assistant PFE: put it online (about 10 minutes)

The whole `Nov 2026` folder is one git repo: Mimi's files + the website (`mimi-chat/`).
GitHub keeps it private, Vercel hosts the site from it, and the site's "📁 Projet" panel reads and writes the same repo.

## 1. GitHub (private repo)
1. Go to https://github.com/new, name it `mimi-pfe`, select **Private**, and add no README. Then click Create.
2. In PowerShell:
   ```
   cd "C:\Users\user\Documents\Mimi\Nov 2026"
   git remote add origin https://github.com/mllekherteam-cpu/mimi-pfe.git
   git push -u origin main
   ```

## 2. Token so the site can read and write the project folder
https://github.com/settings/personal-access-tokens/new: choose a **Fine-grained** token, set Repository access to **Only `mimi-pfe`**, and set Permissions → **Contents: Read and write**. Copy the token.

## 3. Vercel
1. https://vercel.com/new: import `mimi-pfe`.
2. **Root Directory: `mimi-chat`**. Framework: Other.
3. Environment Variables:
   | Name | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | the API key (best: a new key in a Console workspace with a **$5 spend limit**, a hard cap) |
   | `ACCESS_CODE` | a code you give Mimi (e.g. a word she likes) |
   | `BUDGET_USD` | `5` |
   | `GITHUB_TOKEN` | the token from step 2 |
   | `GITHUB_REPO` | `mllekherteam-cpu/mimi-pfe` |
4. Deploy.
5. Project → **Storage** → add **Upstash for Redis** (free) and connect it to the project, then **Redeploy**.
   This keeps her conversation history on all her devices and makes the $5 counter persistent.

## Every day
- `SYNC.ps1` (right-click → Run with PowerShell) gets what Mimi added on the site and sends what you changed here.
- Every `git push` also redeploys the site automatically.

## Run locally
`cd mimi-chat; npm install; $env:ANTHROPIC_API_KEY="..."; npm run dev` then http://localhost:3456
