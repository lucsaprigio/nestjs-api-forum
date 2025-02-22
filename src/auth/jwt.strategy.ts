import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Env } from "src/env";
import { z } from "zod";

// Este arquivo precisamos colocar ele dentro do nosso AuthModule, como provider, para o next entender que ele existe
const tokenPayloadSchema = z.object({
    sub: z.string().uuid()
})

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable() // Tudo que for provider, colocamos o Injectable
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService<Env, true>) {
        const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true })

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: Buffer.from(publicKey, 'base64'),
            algorithms: ['RS256']
        })
    }

    // Validar que o token possui as informações dentro do payload, necessárias para que a aplicação funcione
    async validate(payload: UserPayload) {
        return tokenPayloadSchema.parse(payload);
    }
}