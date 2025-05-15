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

    // Criar prato
    const create_dish = await prisma.dish.create({
      data: {
        title,
        description,
        category,
        price,
        image: imageFileName,
      },
    });

    // Preparar inserção de ingredientes
    const hasOnlyOneIngredient = typeof (ingredients) === "string";

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
}
