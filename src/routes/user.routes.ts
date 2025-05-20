import { app } from "../app";
import { SessionController } from "../controller/auth/session-controller";
import { UserController } from "../controller/user/user-controller";
import { VerifyJwt } from "../middlewares/verify-jwt";

const userController = new UserController()
const sessionController = new SessionController()

export function userRoutes() {
  
  app.post('/users',{
    schema: {
      summary: 'Criar um usuario',
      tags: ['Usuário'],
      body: {
        type: 'object',
        properties: {
          name: {type: 'string'},
          email: {type: 'string', format:'email'},
          password: {type: 'string', minLength: 6}
        },
        required: ['name', 'email', 'password'],
      },
      response: {
        201: {
          description: 'Usuario criando com sucesso',
          type: 'object',
          properties: {
            id: {type: 'string'},
            name: {type: 'string'},
            email: {type: 'string'}
          }
        },
        400: {
          description: 'Erro de validação',
          type: 'object',
          properties: {
            message: {type: 'string'}
          }
        }
      }
    }
  }, userController.create)
    
  app.post('/session',{
    schema: {
      summary: 'Autentica o usuario',
      tags: ['Usuário'],
      body: {
        type: 'object',
        properties: {
          email: {type: 'string', format:'email'},
          password: {type: 'string', minLength: 6}
        },
        required: ['email', 'password'],
      },
      response: {
        201: {
          description: 'Usuario autenticado com sucesso',
          type: 'object',
          properties: {
            token: {type: 'string'}
          }
        },
        400: {
          description: 'Erro de validação',
          type: 'object',
          properties: {
            message: {type: 'string'}
          }
        }
      }
    }
  }, sessionController.create)
  

  app.put('/users', {onRequest: [VerifyJwt], 
    schema: {
      summary: 'Atualiza os dados do usuario',
      tags: ['Usuário'],
      body: {
        type: 'object',
        properties: {
          name: {type: 'string'},
          email: {type: 'string', format:'email'},
          password: {type: 'string', minLength: 6},
          old_password: {type: 'string'}
        },
        required: ['name', 'email', 'password', 'old_password'],
      },
      response: {
        201: {
          description: 'Usuario atualizado com sucesso',
          type: 'object',
          properties: {
            massage: {type: 'string'}
          }
        },
        400: {
          description: 'Erro de validação',
          type: 'object',
          properties: {
            message: {type: 'string'}
          }
        }
      }
    }
  }, userController.update)


  app.patch('/user/avatar', {onRequest: [VerifyJwt],
    schema: {
      summary: 'Atualizar o avatar do usuário',
      tags: ['Usuário'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          avatar: {
            type: 'string',
            format: 'binary',
            description: 'Arquivo de imagem para o novo avatar',
          },
        },
        required: ['avatar'],
      },
      response: {
        200: {
          description: 'Avatar atualizado com sucesso',
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        400: {
          description: 'Nenhuma imagem enviada',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, userController.avatar)
}