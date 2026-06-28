import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl=process.env.DATABASE_URL;
if(!databaseUrl){
    throw new Error("Database isn't defined in the environment variable");
}
export default defineConfig({
  out: './drizzle/migrations',
  schema: './drizzle/schema.ts',
  dialect: 'postgresql',
  strict:true,
  verbose:true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
