# LearnAI Academy (Starter Scaffold)

This is a Next.js (App Router) + Prisma + Postgres + Redis skeleton based on your requested structure.
All API routes, services, and components are stubbed and ready to be filled in.

## Quick start
1) Copy `.env.example` to `.env.local` and fill values.
2) `npm install`
3) `docker compose up -d`
4) `npx prisma migrate dev --name init && node prisma/seed.js`
5) `npm run dev`

## Notes
- Files under `src/services/ai/agents/*` include simple placeholder classes.
- API routes return basic JSON so you can verify wiring.
- Add your own UI library or Tailwind as needed.
