import { UnauthorizedException, UsePipes } from '@nestjs/common'
import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { z } from 'zod'

const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

// 1 Controller por rota
@Controller('/sessions')
export class AuthenticateController {
    // Contructors são injetados automaticamente
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService
    ) { }

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(authenticateBodySchema)) // No pipe a usamos a variável do z.object
    async handle(@Body() body: AuthenticateBodySchema) { // no Body usamos o tipo que ele usa o typeof para pegar os tipos ja criado do z.object
        const { email, password } = body;

        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new UnauthorizedException('User credentials does not match.');
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('User credentials does not match.');
        }

        const accessToken = this.jwt.sign({ sub: user.id })

        return {
            access_token: accessToken
        }
    }
}
