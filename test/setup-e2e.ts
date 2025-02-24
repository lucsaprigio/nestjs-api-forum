import 'dotenv/config'

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';

const prisma = new PrismaClient();

function generateUniqueDatabaseURL(schemaId: string) {
    if (!process.env.DATABASE_URL) {
        throw new Error('Please provider a DATABASE_URL environment variable')
    }

    const url = new URL(process.env.DATABASE_URL) // Instanciando como tipo de URL

    url.searchParams.set('schema', schemaId) // na nossa variável ambiente, temos o ?schema="", ele vai jogar como um hash para criar um banco desta forma.

    return url.toString()
}

const schemaId = randomUUID();

beforeAll(async () => {
    const databaseURL = generateUniqueDatabaseURL(schemaId);

    process.env.DATABASE_URL = databaseURL;

    execSync('npx prisma migrate deploy');
})

afterAll(async () => {
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
    await prisma.$disconnect();
})