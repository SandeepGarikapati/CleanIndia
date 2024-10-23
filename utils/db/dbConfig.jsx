import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
const sql = neon("postgresql://neondb_owner:bcufh4BJ3UWy@ep-raspy-waterfall-a17y594s.ap-southeast-1.aws.neon.tech/zero-to-hero?sslmode=require");

export const db = drizzle(sql, {schema});