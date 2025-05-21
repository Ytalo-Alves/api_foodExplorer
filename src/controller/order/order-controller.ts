import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

export class OrderController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const orderControllerBodySchema = z.object({
      status: z.string(),
      paymentMethod: z.string(),
      cart: z.array(
        z.object({
          id: z.string(), // ID do prato
          title: z.string(),
          quantity: z.number()
        })
      )
    });

    const { status, paymentMethod, cart } = orderControllerBodySchema.parse(request.body);
    const userId = request.user.sub;

    // Busca os preços dos pratos no banco
    const dishes = await prisma.dish.findMany({
      where: {
        id: {
          in: cart.map(item => item.id),
        },
      },
      select: {
        id: true,
        price: true,
      },
    });

    // Mapeia os preços para lookup
    const priceMap = new Map(dishes.map(dish => [dish.id, dish.price]));

    // Calcula o totalPrice real
    const totalPrice = cart.reduce((acc, item) => {
      const price = priceMap.get(item.id);
      if (!price) {
        throw new Error(`Preço do prato com ID ${item.id} não encontrado.`);
      }
      return acc + Number(price) * item.quantity;
    }, 0);

    // Cria o pedido
    const order = await prisma.order.create({
      data: {
        status,
        total_price: totalPrice,
        payment_method: paymentMethod,
        user_id: userId,
      },
    });

    // Cria os itens do pedido
    const itemsToInsert = cart.map(item => ({
      title: item.title,
      quantity: item.quantity,
      dish_id: item.id,
      order_id: order.id,
    }));

    await prisma.order_Items.createMany({
      data: itemsToInsert,
    });

    return reply.status(201).send({ order: order.id });
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub

    const orders = await prisma.order.findMany({
      where: {
        user_id: userId
      },
      include: {
        order_items: {
          select: {
            id: true,
            title: true,
            quantity: true,
            dish_id: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return reply.status(200).send({orders})
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const bodySchema = z.object({
      status: z.enum(["PENDING", "IN_PROGRESS", "DELIVERED", "CANCELLED"]),
    });

    const { id } = paramsSchema.parse(request.params);
    const { status } = bodySchema.parse(request.body);

    await prisma.order.update({
      where: { id },
      data: { status },
    });

    return reply.status(200).send()
  }
}
