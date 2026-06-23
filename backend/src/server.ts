import app from './app';
import { env } from './config/env';
import { getPrisma } from './config/database';

async function main() {
  const prisma = getPrisma();
  
  // Run migrations in production
  if (env.NODE_ENV === 'production') {
    console.log('Running database migrations...');
    // In production, run: npx prisma migrate deploy
  }
  
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
