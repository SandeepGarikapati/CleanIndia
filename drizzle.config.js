import { Connection } from "@neondatabase/serverless";
import { url } from "inspector";

export default {
    dialect: 'postgresql',
    schema: './utils/db/schema.ts',
    out:'./drizzle',

    dbCredentials: {
        url: process.env.DATABASE_URL,
        ConnectionString: process.env.DATABASE_URL,

    }
}