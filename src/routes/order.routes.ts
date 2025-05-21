import { app } from "../app";
import { OrderController } from "../controller/order/order-controller";
import { VerifyJwt } from "../middlewares/verify-jwt";
import { VerifyUserIsAdmin } from "../middlewares/verify-user-is-admin";

export function orderRoutes() {
  const orderController = new OrderController()

  app.post('/order', {onRequest: [VerifyJwt],
    schema: {
      summary: 'Criar novo pedido',
      description: 'Cria um pedido com base nos pratos enviados no carrinho.',
      tags: ['Pedidos'],
      security: [
        {
          Bearer: [],
        },
      ],
      body: {
        type: 'object',
        required: ['status', 'paymentMethod', 'cart'],
        properties: {
          status: {
            type: 'string',
            example: 'pendente'
          },
          paymentMethod: {
            type: 'string',
            example: 'pix'
          },
          cart: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'title', 'quantity'],
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid'
                },
                title: {
                  type: 'string',
                  example: 'X-Burger'
                },
                quantity: {
                  type: 'number',
                  example: 2
                }
              }
            }
          }
        }
      },
      response: {
        201: {
          description: 'Pedido criado com sucesso',
          type: 'object',
          properties: {
            order: { type: 'string', format: 'uuid' }
          }
        },
        400: {
          description: 'Erro de validação ou item com ID inválido',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, orderController.create)

  app.get('/order', {onRequest: [VerifyJwt],
    schema: {
      summary: 'Listar pedidos do usuário',
      description: 'Retorna todos os pedidos feitos pelo usuário autenticado, ordenados do mais recente para o mais antigo.',
      tags: ['Pedidos'],
      security: [
        {
          Bearer: [],
        },
      ],
      response: {
        200: {
          description: 'Lista de pedidos do usuário',
          type: 'object',
          properties: {
            orders: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'clz78qe9o0001z8l3az2z1lti' },
                  status: { type: 'string', example: 'pendente' },
                  total_price: { type: 'number', example: 59.9 },
                  payment_method: { type: 'string', example: 'pix' },
                  user_id: { type: 'string', example: 'user123' },
                  createdAt: { type: 'string', format: 'date-time', example: '2025-05-21T18:41:33.123Z' },
                  updatedAt: { type: 'string', format: 'date-time', example: '2025-05-21T18:41:33.123Z' },
                  order_items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'item123' },
                        title: { type: 'string', example: 'X-Burger' },
                        quantity: { type: 'number', example: 2 },
                        dish_id: { type: 'string', example: 'dish456' },
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, orderController.index)

  app.patch('/order/:id', {onRequest: [VerifyJwt, VerifyUserIsAdmin],
    schema: {
      summary: 'Atualizar status de um pedido',
      description: 'Permite que um administrador atualize o status de um pedido.',
      tags: ['Pedidos'],
      security: [
        {
          Bearer: [],
        },
      ],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED'],
            example: 'IN_PROGRESS',
          },
        },
        required: ['status'],
      },
      response: {
        200: {
          description: 'Status do pedido atualizado com sucesso',
          type: 'null',
        }
      }
    }
  }, orderController.update)
}