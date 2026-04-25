<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment workflow

**Always deploy to staging first.** Dan reviews staging in the browser before anything goes to production.

## URLs
- **Production:** `https://obsidian-volleyball-website.vercel.app` (target real domain: `obsidianvolleyball.com`, DNS not yet pointed)
- **Staging:** `https://obsidian-volleyball-staging.vercel.app` (Vercel auth-protected; Dan can view when logged in)
- **Repo:** `github.com/duriandaniel/obsidian-volleyball-website`
- **Vercel project:** `obsidian-volleyball-website` under team `duriandaniels-projects`

## Branches
- `main` → auto-deploys to production via Vercel git integration
- `staging` → use for all in-progress changes; preview deployments alias to the staging URL

## How to deploy a change

1. Checkout `staging`, make changes, commit, push to `origin/staging`
2. Activate Linux node and deploy + re-alias staging:
   ```sh
   export PATH="/home/lidq/.nvm/versions/node/v24.14.1/bin:$PATH"
   cd /home/lidq/git/obsidian-volleyball-website
   DEPLOY_URL=$(vercel deploy --scope duriandaniels-projects --yes 2>&1 | grep -oE 'https://[^ ]+\.vercel\.app' | tail -1)
   vercel alias set "$DEPLOY_URL" obsidian-volleyball-staging.vercel.app --scope duriandaniels-projects
   ```
3. Tell Dan staging is ready; wait for approval
4. Once approved: `git checkout main && git merge staging && git push` — Vercel auto-deploys prod

## Notes
- Vercel CLI requires Linux node (`/home/lidq/.nvm/versions/node/v24.14.1/bin`) — the Windows shim throws "Permission denied"
- Vercel auth token already at `~/.local/share/com.vercel.cli/auth.json`
- Never push directly to `main` for content/code changes — staging first, always
