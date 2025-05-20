import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { emailInAlreadyUse } from "../../errors/email-in-already-use";
import { compare, hash } from "bcryptjs";
import path from "path";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";
import fs from 'fs'

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

    return reply.status(201).send({...user, password: false})


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

  async avatar(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub;

    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: "Nenhuma imagem enviada." });
    }

    const extension = path.extname(data.filename);
    const fileName = `${randomUUID()}${extension}`;
    const filePath = path.resolve(__dirname, "../../../", "uploads", fileName);

    await pipeline(data.file, fs.createWriteStream(filePath));

    // Aqui atualiza o avatar no banco
    await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: fileName,
      },
    });

    return reply.status(200).send({ message: "Avatar atualizado com sucesso!" });
  }
} 