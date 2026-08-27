# Sprout

**Financial confidence that grows with you.**

GROW is a mobile-first financial-literacy application for ages 15–18. It teaches teenagers by letting them experience a financial decision before introducing the terminology.

## Learning model

`Learn → Practise → Apply → Reflect`

- Monday: an interactive Weekly Lab.
- Tuesday–Thursday: one short Daily Post decision.
- Friday: a safe application activity, which may include the Practice Portfolio when the topic is risk or uncertainty.
- Progress: concepts and financial-skill activity, never a financial-health score.

The curriculum covers saving, budgeting, earning, borrowing, staying safe, planning and investing basics. Sprout is the original GROW learning companion and provides short, contextual, non-advisory explanations.

Spark Coins are virtual, non-redeemable and awarded only for learning. Identity, completion, rewards, concept unlocks and historical outcomes remain server-authoritative.

## Local development

Requirements: Node.js 22.13 or newer and the development environment variables documented in `.env.example`.

```bash
npm install
npm run db:generate
npm run db:seed
npm run dev
```

Validation:

```bash
npm run lint
npm test
npm run build
```

The primary local database is Prisma with SQLite. `.openai/hosting.json` and the Vinext build remain available for Sites-compatible builds; hosted persistence requires a configured platform database rather than the local SQLite file.
