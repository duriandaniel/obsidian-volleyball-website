<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment workflow

**Always deploy to staging first.** Dan reviews staging in the browser before anything goes to production.

## URLs
- **Production:** `https://obsidianvolleyball.com` (apex + www, A records → 76.76.21.21 at Porkbun)
- **Staging:** `https://obsidian-volleyball-staging.vercel.app` (Vercel auth-protected; Dan views when logged in)
- **Repo:** `github.com/duriandaniel/obsidian-volleyball-website`
- **Vercel project:** `obsidian-volleyball-website` under team `duriandaniels-projects`

## Branches
- `main` → production
- `staging` → for all in-progress changes; preview deployments alias to the staging URL

## How to deploy a change

**IMPORTANT: Vercel git auto-deploy is NOT wired up for this project.** Pushing to GitHub does not trigger a Vercel build. Every deploy must be done manually with `vercel deploy`.

### Staging deploy
1. Checkout `staging`, make changes, commit, push to `origin/staging`
2. Run a preview deploy and re-alias the staging URL:
   ```sh
   export PATH="/home/lidq/.nvm/versions/node/v24.14.1/bin:$PATH"
   cd /home/lidq/git/obsidian-volleyball-website
   DEPLOY_URL=$(vercel deploy --scope duriandaniels-projects --yes 2>&1 | grep -oE 'https://[^ ]+\.vercel\.app' | tail -1)
   vercel alias set "$DEPLOY_URL" obsidian-volleyball-staging.vercel.app --scope duriandaniels-projects
   ```
3. Tell Dan staging is ready; wait for approval

### Production deploy (after Dan approves staging)
1. `git checkout main && git merge staging --no-ff -m "..." && git push origin main`
2. **Then** trigger the prod deploy explicitly — pushing alone won't deploy:
   ```sh
   export PATH="/home/lidq/.nvm/versions/node/v24.14.1/bin:$PATH"
   cd /home/lidq/git/obsidian-volleyball-website
   vercel deploy --prod --scope duriandaniels-projects --yes
   ```
3. Verify: `vercel ls --scope duriandaniels-projects --prod | head -5` should show a Ready deploy under a minute old.

## Notes
- Vercel CLI requires Linux node (`/home/lidq/.nvm/versions/node/v24.14.1/bin`); the Windows shim throws "Permission denied"
- Vercel auth token already at `~/.local/share/com.vercel.cli/auth.json`
- Never push directly to `main` for content/code changes — staging first, always
- If git auto-deploy is ever wired up via Vercel dashboard (Settings → Git), step 2 of prod deploy can be dropped — but until then, always run `vercel deploy --prod` after pushing main
