import { app } from "../app";
import { DishController} from "../controller/dish/dish-controller";
import { VerifyJwt } from "../middlewares/verify-jwt";

const dishController = new DishController()

export function dishRoutes() {
  app.post('/dish',{onRequest: [VerifyJwt],
    schema: {
      summary: 'Cria um novo prato no cardápio',
      tags: ['Pratos'],
      body: {
        type: 'object',
        required: ['title', 'description', 'category', 'price'],
        properties: {
          title: {type: 'string', description: 'Titulo do prato'},
          description: {type: 'string', description: 'Descrição do prato'},
          category: {type: 'string', description: 'Categoria do prato'},
          price: {type: 'string', description: 'Preço do prato'},
          image: {type: 'string', description: 'Imagem do prato', nullable: true},
          ingredients: {
            type: 'array',
            items: {type: 'string'},
            description: 'Lista dos ingredients do prato',
            nullable: true
          }
        }
      },
      response: {
        201: {
          description: 'Prato criado com sucesso',
          type: 'object',
          properties: {
            message: {type: 'string', description: 'Prato criado com sucesso'}
          }
        },
        400: {
          description: 'Erro de validação ou prato ja existente',
          type: 'object',
          properties: {
            message: {type: 'string', exemplo: 'Este prato já existe no cardápio.'},
            errors: {
              type: 'object',
              properties: {
                issues: {
                  type: 'array',
                  items: {type: 'string'}
                }
              }
            }
          }
        }
      }
    }
  }, dishController.create)

  app.get('/dish', {onRequest: [VerifyJwt],
    schema: {
      summary: 'Lista todos os pratos do usuário autenticado',
      tags: ['Pratos'],
      response: {
        200: {
          description: 'Lista de pratos com ingredientes',
          type: 'object',
          properties: {
            dishe: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  price: { type: 'string' }, // ou "number", dependendo do seu banco
                  image: { type: 'string', nullable: true },
                  user_id: { type: 'string', format: 'uuid' },
                  ingredients: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        dish_id: { type: 'string', format: 'uuid' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Usuário não autenticado',
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Unauthorized' },
          },
        },
      },
    }
  }, dishController.show)

  app.delete('/dish/:id', {onRequest: [VerifyJwt],
    schema: {
      summary: 'Deleta um prato pelo ID',
      tags: ['Pratos'],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID do prato a ser deletado',
          },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Prato deletado com sucesso',
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Prato deletado com sucesso!' },
          },
        },
        404: {
          description: 'Prato não encontrado',
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Prato não encontrado.' },
          },
        },
        401: {
          description: 'Não autorizado',
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Unauthorized' },
          },
        },
      },
    }
  }, dishController.delete)

  app.get('/dishes', {onRequest:[VerifyJwt],
    schema: {
      summary: 'Busca pratos por título ou ingredientes',
      tags: ['Pratos'],
      querystring: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Título do prato para busca parcial',
            example: 'Lasanha'
          },
          ingredients: {
            type: 'string',
            description: 'Ingredientes separados por ponto (.) para busca parcial',
            example: 'queijo.tomate.manjericão'
          },
        },
      },
      response: {
        200: {
          description: 'Lista de pratos filtrados',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              price: { type: 'string' },
              image: { type: 'string', nullable: true },
              user_id: { type: 'string', format: 'uuid' },
              ingredients: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    dish_id: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
        },
      },
    }
  }, dishController.index)

  app.patch('/dish/:id', {onRequest: [VerifyJwt],
    schema: {
      summary: 'Atualizar prato',
      description: 'Atualiza um prato existente, incluindo campos e imagem.',
      tags: ['Pratos'],
      consumes: ['multipart/form-data'],
      security: [
        {
          Bearer: [],
        },
      ],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID do prato' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          price: { type: 'string' },
          ingredients: {
            type: 'string',
            description: 'Array de ingredientes em formato JSON. Ex: ["carne", "batata"]'
          },
          image: {
            type: 'string',
            format: 'binary',
            description: 'Arquivo de imagem do prato'
          }
        }
      },
      response: {
        200: {
          description: 'Prato atualizado com sucesso',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        404: {
          description: 'Prato não encontrado',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, dishController.update)
}