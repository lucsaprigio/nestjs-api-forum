import { INestApplication } from "@nestjs/common";
import { AppModule } from '@/app.module';
import { Test } from "@nestjs/testing";
import request from 'supertest';
import { PrismaService } from "@/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

describe('Create account (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService
    let jwt: JwtService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({ // Forma de rodar nossa aplicação de uma maneira que ele fica de forma programática
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);

        await app.init();
    })

    test('[POST] /questions', async () => {
        const user = await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: '123456'
            }
        })

        const accessToken = jwt.sign({ sub: user.id })

        const response = await request(app.getHttpServer())
            .post('/questions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'New question',
                content: 'Question content'
            })

        expect(response.statusCode).toBe(201)

        const questionOnDatabase = await prisma.question.findFirst({
            where: {
                title: 'New qustion',
            }
        })

        expect(questionOnDatabase).toBeTruthy()
    })
})