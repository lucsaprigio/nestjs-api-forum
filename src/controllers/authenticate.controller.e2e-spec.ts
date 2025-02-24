import { INestApplication } from "@nestjs/common";
import { AppModule } from '@/app.module';
import { Test } from "@nestjs/testing";
import request from 'supertest';
import { PrismaService } from "@/prisma/prisma.service";
import { hash } from "bcryptjs";

describe('Authenticate (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({ // Forma de rodar nossa aplicação de uma maneira que ele fica de forma programática
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication()

        prisma = moduleRef.get(PrismaService);

        await app.init();
    })

    test('[POST] /sessions', async () => {
        // Temos que criar o usuário no banco antes.
        await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: await hash('123456', 8)
            }
        })

        // Faz a requisição para o /sessions
        const response = await request(app.getHttpServer()).post('/sessions').send({
            email: 'johndoe@example.com',
            password: '123456'
        })

        expect(response.statusCode).toBe(201)
        expect(response.body).toEqual({
            access_token: expect.any(String)
        })
    })
})