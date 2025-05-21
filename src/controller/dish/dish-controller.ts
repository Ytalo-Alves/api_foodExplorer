import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { promisify } from "util";
import { pipeline } from "stream";
import path from "path";
import fs from "fs";

const pump = promisify(pipeline);

export class DishController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const parts = request.parts();

    let title = "";
    let description = "";
    let category = "";
    let price = "";
    let imageFileName = "";
    let ingredients: string | string[] = [];

    for await (const part of parts) {
      if (part.type === "file" && part.fieldname === "image") {
        const fileName = `${Date.now()}-${part.filename}`;

        const uploadDir = path.join(__dirname, "../../../", "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uploadPath = path.join(uploadDir, fileName);

        await pump(part.file, fs.createWriteStream(uploadPath));
        imageFileName = fileName;
      } else if (part.type === "field") {
        if (part.fieldname === "title") title = String(part.value);
        else if (part.fieldname === "description")
          description = String(part.value);
        else if (part.fieldname === "category") category = String(part.value);
        else if (part.fieldname === "price") price = String(part.value);
        else if (part.fieldname === "ingredients") {
          try {
            ingredients = JSON.parse(String(part.value)); // tenta interpretar como array
          } catch {
            ingredients = String(part.value); // se falhar, trata como string única
          }
        }
      }
    }

    // Validação com Zod
    const dishControllerBodySchema = z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      price: z.coerce.string(),
      image: z.string().optional(),
    });

    const parsedData = dishControllerBodySchema.safeParse({
      title,
      description,
      category,
      price,
      image: imageFileName,
    });

    if (!parsedData.success) {
      return reply.status(400).send({ errors: parsedData.error.flatten() });
    }

    // Verificar se já existe prato com esse título
    const verifyDishExists = await prisma.dish.findFirst({
      where: { title },
    });

    if (verifyDishExists) {
      return reply
        .status(400)
        .send({ message: "Este prato já existe no cardápio." });
    }

    const userId = request.user.sub

    // Criar prato
    const create_dish = await prisma.dish.create({
      data: {
        title,
        description,
        category,
        price,
        image: imageFileName,
        user_id: userId
      },
    });

    let ingredientsInsert;

if (typeof ingredients === "string") {
  ingredientsInsert = [{
    name: ingredients,
    dish_id: create_dish.id, // <-- aqui é só o ID
  }];
} else if (Array.isArray(ingredients) && ingredients.length > 0) {
  ingredientsInsert = ingredients
    .filter((name): name is string => typeof name === "string")
    .map((name) => ({
      name,
      dish_id: create_dish.id, // <-- aqui também
    }));
}

if (ingredientsInsert && ingredientsInsert.length > 0) {
  await prisma.ingredient.createMany({
    data: ingredientsInsert,
  });
}

    return reply.status(201).send({ message: "Prato criado com sucesso!" });
  }

  async show(request: FastifyRequest, reply: FastifyReply){
    const userId = request.user.sub

    const dishe = await prisma.dish.findMany({
      where: {user_id: userId},
      include: {
        ingredients: true,
      }
    })  

    return reply.status(200).send({dishe})
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
  const indexBodySchema = z.object({
    title: z.string(),
    ingredients: z.string()

  })

  const {title, ingredients } = indexBodySchema.parse(request.query)

  let dishes;

  if (ingredients) {
    const filterIngredients = ingredients
      .split('.')
      .map((ingredient) => ingredient.trim());

    // Busca todos os pratos que contenham qualquer um dos ingredientes informados
    const dishesWithIngredients = await prisma.ingredient.findMany({
      where: {
        OR: filterIngredients.map((ingredient) => ({
          name: {
            contains: ingredient,
            mode: "insensitive"
          }
        }))
      },
      select: {
        dish_id: true,
      },
    });

    const dishIds = dishesWithIngredients.map((item) => item.dish_id);

    dishes = await prisma.dish.findMany({
      where: {
        id: {
          in: dishIds,
        },
      },
      include: {
        ingredients: true,
      },
    });
  } else if (title) {
    dishes = await prisma.dish.findMany({
      where: {
        title: {
          contains: title,
          mode: 'insensitive',
        },
      },
      include: {
        ingredients: true,
      },
    });
  } else {
    // Se não houver filtros, retorna todos os pratos
    dishes = await prisma.dish.findMany({
      include: {
        ingredients: true,
      },
    });
  }

  return reply.status(200).send(dishes);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const id = request.params as {id:string}

    const dishExists = await prisma.dish.delete({where: id})

    if(!dishExists) {
      return reply.status(404).send({message: 'Prato não encontrado'})
    }

    reply.status(200).send({message: 'Prato deletado com sucesso!'})
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const parts = request.parts();

    let title = "";
    let description = "";
    let category = "";
    let price = "";
    let imageFileName = "";
    let ingredients: string[] = [];

    // Parse multipart/form
    for await (const part of parts) {
      if (part.type === "file" && part.fieldname === "image") {
        const fileName = `${Date.now()}-${part.filename}`;
        const uploadDir = path.join(__dirname, "../../../", "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uploadPath = path.join(uploadDir, fileName);
        await pump(part.file, fs.createWriteStream(uploadPath));
        imageFileName = fileName;
      } else if (part.type === "field") {
        if (part.fieldname === "title") title = String(part.value);
        else if (part.fieldname === "description") description = String(part.value);
        else if (part.fieldname === "category") category = String(part.value);
        else if (part.fieldname === "price") price = String(part.value);
        else if (part.fieldname === "ingredients") {
          try {
            ingredients = JSON.parse(String(part.value));
          } catch {
            ingredients = [String(part.value)];
          }
        }
      }
    }

    const dish = await prisma.dish.findUnique({ where: { id } });

    if (!dish) {
      return reply.status(404).send({ message: "Prato não encontrado." });
    }

    // Se imagem nova foi enviada, deleta antiga
    if (imageFileName && dish.image) {
      const oldImagePath = path.join(__dirname, "../../../", "uploads", dish.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Atualiza o prato
    const updatedDish = await prisma.dish.update({
      where: { id },
      data: {
        title: title || dish.title,
        description: description || dish.description,
        category: category || dish.category,
        price: price || dish.price,
        image: imageFileName || dish.image,
      },
    });

    // Atualiza os ingredientes (remove e adiciona)
    if (ingredients.length > 0) {
      await prisma.ingredient.deleteMany({ where: { dish_id: id } });

      const newIngredients = ingredients.map((name) => ({
        name,
        dish_id: id,
      }));

      await prisma.ingredient.createMany({ data: newIngredients });
    }

    return reply.status(200).send({ message: "Prato atualizado com sucesso!" });
  }
}
