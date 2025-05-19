import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { emailInAlreadyUse } from "../../errors/email-in-already-use";
import { compare, hash } from "bcryptjs";

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
    const userControllerBodySchema = z.object({
      name: z.string().min(3, 'O nome deve conter 3 caracteres!'),
      email: z.string().email("Digite um email valido!"),
      password: z.string().min(6, 'A senha deve conter 6 caracteres!'),
      old_password: z.string().min(6, 'Deve conter 6 caracteres')
    })

    const {name, email, password, old_password} = userControllerBodySchema.parse(request.body)

    const userId = request.user.sub

    if(!userId) {
      throw new Error('Usuario nao encontrado')
    }

    const user = await prisma.user.findUnique({where: {id:userId}})

    if (!user) {
      return reply.status(404).send({ message: 'Usuário não encontrado.' })
    }

    const theEmailProviderExists = await prisma.user.findUnique({where: {email}})

    if(theEmailProviderExists && theEmailProviderExists.id !== userId){
      throw new Error('E-mail ja em uso por outro usuario')
    }

    const passwordMatch = await compare(old_password, user.password)

    if (!passwordMatch) {
      return reply.status(401).send({ message: 'Senha antiga incorreta.' })
    }

    const passwordHashed = await hash(password, 6)

    await prisma.user.update({
      where: {id: userId},
      data: {
        name,
        email,
        password: passwordHashed
      }
    })

    return reply.status(200).send({ message: 'Usuário atualizado com sucesso.' })
  }
} 