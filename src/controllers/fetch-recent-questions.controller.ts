import { Get, UseGuards, Controller, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe';
import { PrismaService } from '@/prisma/prisma.service';
import { z } from 'zod';

// A página é uma string, opcional, começa pelo padrão 1, como transformamos em número, colocanos um pipe nele, pois a url recebe string.
const pageQueryParamSchema = z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number(z.number().min(1))
)

// Validação dos nossos dados utilizando o zod, ele precisa receber um schema
const queryValidationPipe = new ZodValidationPipe(
    pageQueryParamSchema
)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

// 1 Controller por rota
@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
    constructor(
        private prisma: PrismaService
    ) { }

    @Get()
    async handle(
        @Query('page', queryValidationPipe) page: PageQueryParamSchema // usamos o @Query para a validação
    ) {
        const perPage = 1;

        const questions = await this.prisma.question.findMany({
            take: perPage,
            skip: (page - 1) * perPage,
            orderBy: {
                createdAt: 'desc'
            }
        })

        return { questions }
    }


}
