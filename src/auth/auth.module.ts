import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Env } from "src/env";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService], // Lista de serviços que vão ser injetados na configuração deste modulo
            global: true,
            useFactory(config: ConfigService<Env, true>) {
                const privateKey = config.get('JWT_PRIVATE_KEY', { infer: true })
                const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true })

                return {
                    signOptions: { algorithm: 'RS256' },
                    privateKey: Buffer.from(privateKey, 'base64'),
                    publicKey: Buffer.from(privateKey, 'base64')
                }
            }
        })
    ],
    providers: [JwtStrategy] // Tudo que for provider, colocamos o Injectable
})
export class AuthModule { }