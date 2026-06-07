# Cloudflare Pages Deployment

This project is deployed to Cloudflare Pages by Direct Upload.

## Current Deployment Mode

- Cloudflare Pages project: `ai-agent-map`
- Deployment type: Direct Upload
- Git Provider: `No`
- Custom domain: `https://liusq.icu`
- Default domain: `https://ai-agent-map.pages.dev`
- Build command: `npm run build`
- Static output directory: `out`
- Last verified deployment preview: `https://6db87c54.ai-agent-map.pages.dev`

Because the Pages project is not connected to a Git provider, pushing commits to GitHub does not automatically update the live site.

## Why `git push` Does Not Deploy

The current Cloudflare Pages project was created as a Direct Upload project. It is not linked to the GitHub repository in Cloudflare Pages.

This means:

- `git commit` records changes in the repository.
- `git push` updates GitHub.
- Cloudflare Pages does not automatically build or deploy after `git push`.
- A manual Wrangler upload is required to publish the latest `out` directory.

## Correct Deployment Flow

1. Make code changes locally.
2. Run the production build.
3. Verify the generated static output in `out`.
4. Commit and push code if the source should be saved in GitHub.
5. Upload `out` to Cloudflare Pages with Wrangler.
6. Verify both the Pages preview URL and `https://liusq.icu`.

## Local Build Command

```bash
npm run build
```

The project uses Next.js static export:

```ts
output: "export"
```

After a successful build, the static site is generated in:

```txt
out
```

## Cloudflare Direct Upload Command

```bash
npx wrangler pages deploy out --project-name ai-agent-map
```

This command uploads the local `out` directory to the existing Cloudflare Pages project.

Do not deploy `.next` for the current static export setup.

## Online Verification URLs

Check these URLs after deployment:

```txt
https://liusq.icu/
https://liusq.icu/map
https://liusq.icu/ranking
https://liusq.icu/trends
https://liusq.icu/survey
https://liusq.icu/share
```

Also check the deployment preview URL printed by Wrangler, for example:

```txt
https://6db87c54.ai-agent-map.pages.dev
```

If the preview URL is correct but `liusq.icu` is old, check Cloudflare custom domains, DNS records, and cache rules.

## Troubleshooting

### The live site still shows old content

- Confirm `npm run build` was run after the latest code changes.
- Confirm `out` contains the expected generated pages.
- Confirm `npx wrangler pages deploy out --project-name ai-agent-map` completed successfully.
- Compare the latest Wrangler preview URL with `https://liusq.icu`.
- Confirm `liusq.icu` is bound to the `ai-agent-map` Pages project.

### `git push` succeeded but the live site did not change

This is expected for the current setup. The project is Direct Upload and has `Git Provider: No`.

Run the Wrangler deploy command after pushing.

### The Cloudflare Pages output directory is unclear

For this project, the correct output directory is:

```txt
out
```

The current Next.js configuration uses static export, so `.next` is not the directory to deploy.

### The custom domain shows different content than the preview URL

- In Cloudflare Pages, check `ai-agent-map` -> `Custom domains`.
- Confirm `liusq.icu` is active on the `ai-agent-map` project.
- In Cloudflare DNS, check whether old `A` or `CNAME` records point to another service.
- Check whether a Worker route, redirect rule, page rule, or cache rule intercepts `liusq.icu`.

## Secrets And Tokens

Do not commit sensitive environment variables.

Do not write Wrangler tokens, Cloudflare API tokens, GitHub tokens, Supabase keys, or `.env.local` contents into source code or documentation.

Keep deployment credentials in local environment variables or a private secret manager.

Required Cloudflare Pages variables:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SENSENOVA_API_KEY
NEXT_PUBLIC_SITE_URL
```

`SUPABASE_SERVICE_ROLE_KEY` and `SENSENOVA_API_KEY` must be configured as secrets. They must not be exposed in client code.

Required Cloudflare Pages R2 binding:

```txt
Variable name: AGENT_CARD_IMAGES
Bucket: your identity-card image bucket
```

Create the bucket once if it does not exist:

```bash
npx wrangler r2 bucket create ai-agent-card-images
```

Then bind it in Cloudflare Dashboard:

```txt
Pages -> ai-agent-map -> Settings -> Functions -> R2 bucket bindings
```

Use:

```txt
Variable name: AGENT_CARD_IMAGES
R2 bucket: ai-agent-card-images
```

The bucket does not need to be public. The site serves stored card images through:

```txt
/api/cards/:cardId/image
```

## Agent Card Persistence

Identity cards use the existing Supabase `users` table as the first production persistence layer:

- `card_slug` stores the public `cardId`.
- `visitor_hash` stores a hashed browser visitor ID.
- `avatar_seed` stores the site-owned persistent image URL, for example `/api/cards/AGT-CN-123456/image`.
- `usage_frequency` stores the user signature.
- `usage_purpose` stores selected scenarios.

Card creation and regeneration are the only routes that call SenseNova:

```txt
POST /api/cards/create
POST /api/cards/:cardId/regenerate
```

Read-only routes never call the image model:

```txt
GET /api/cards/:cardId
GET /api/cards/by-visitor/:visitorId
GET /api/cards/search?nickname=xxx
GET /card/:cardId
```

Future migration can move card records from `users` to a dedicated `agent_cards` table or object storage. Keep the API response shape stable when migrating.

Generated card images are persisted in Cloudflare R2:

- New card creation uploads the SenseNova result to R2 before writing the Supabase row.
- Regeneration uploads the new image to R2 before updating the Supabase row.
- Read-only share pages display `/api/cards/:cardId/image`, not the temporary model URL.
- Existing legacy rows with temporary model URLs are lazily migrated: the first image request attempts to fetch the old URL, upload it to R2, and update `avatar_seed`.
- If a legacy temporary URL has already expired, the image endpoint returns a lightweight fallback SVG and the user can regenerate the card.

## Future Git Auto Deployment

If the project should deploy automatically after `git push`, recreate or reconfigure the Cloudflare Pages project to connect the GitHub repository:

```txt
liu020800/ai-agent-map
```

The Git-based Pages configuration should use:

```txt
Production branch: main
Build command: npm run build
Build output directory: out
```

After switching to Git deployment, verify that the Cloudflare Pages project shows a Git provider and that production deployments reference the expected Git commit.
