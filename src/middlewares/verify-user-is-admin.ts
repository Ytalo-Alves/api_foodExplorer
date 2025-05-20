import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma";

export async function VerifyUserIsAdmin(request: FastifyRequest, reply: FastifyReply) {
  const user_id = request.user.sub

  const user = await prisma.user.findUnique({where: {id: user_id}})

  if(!user?.isAdmin) {
    return reply.status(400).send({message: "Apenas usuários admin podem atualizar os pedidos"})
  }
}