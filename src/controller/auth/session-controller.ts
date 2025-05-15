import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { IncorrectUsernameOrPassword } from "../../errors/Incorrect-username-or-password";
import { compare } from "bcryptjs";
import { VerifyJwt } from "../../middlewares/verify-jwt";
import { InvalidCredentialsError } from "../../errors/InvalidCredentialsError";

export class SessionController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const sessionControllerBodySchema = z.object({
      email: z.string().email(),
      password: z
        .string()
        .min(6, "A senha deve conter no mínimo 6 caracteres!"),
    });

    const { email, password } = sessionControllerBodySchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw (new IncorrectUsernameOrPassword(), 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw (new IncorrectUsernameOrPassword(), 401);
    }
    try {
      const token = await reply.jwtSign(
        {},
        {
          sign: {
            sub: user.id,
          },
        }
      );
      return reply.status(200).send({ token });
    } catch (error) {
      if(error instanceof InvalidCredentialsError){
        return reply.status(400).send({message: error.message})
      }

      throw error
    }
  }
}
