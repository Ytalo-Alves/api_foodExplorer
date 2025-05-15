import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { emailInAlreadyUse } from "../../errors/email-in-already-use";
import { hash } from "bcryptjs";

export class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {

    const userControllerBodySchema = z.object({
      name: z.string().min(3, 'O nome deve conter 3 caracteres!'),
      email: z.string().email("Digite um email valido!"),
      password: z.string().min(6, 'A senha deve conter 6 caracteres!'),
    })

    const {name, email, password} = userControllerBodySchema.parse(request.body)

    const userExists = await prisma.user.findUnique({where: {email}})

    if(userExists) {
      throw new emailInAlreadyUse()
    }

    const hashed_password = await hash(password, 6)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed_password,
        
      }
    })

    return reply.status(201).send({message: 'Usuario criando com sucesso'})


  }

  async update(request: FastifyRequest, reply: FastifyReply) {

  }
}