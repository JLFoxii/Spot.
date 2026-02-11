# @spot-monorepo/db-prisma

Librairie partagée contenant le client Prisma et les types générés.

## Utilisation

```typescript
import { prisma, UserRole } from '@spot-monorepo/db-prisma';

// Utiliser le client Prisma
const users = await prisma.user.findMany();
```

## Commandes Prisma

### Générer le client
```bash
npx prisma generate --schema=libs/db-prisma/prisma/schema.prisma
```

### Créer une migration
```bash
npx prisma migrate dev --name ma_migration --schema=libs/db-prisma/prisma/schema.prisma
```

### Lancer le seed
```bash
npx ts-node --project libs/db-prisma/tsconfig.json libs/db-prisma/prisma/seed.ts
```

### Ouvrir Prisma Studio
```bash
npx prisma studio --schema=libs/db-prisma/prisma/schema.prisma
```
