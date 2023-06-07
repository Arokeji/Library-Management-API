/**
 * @swagger
 * tags:
 *   name: Author
 *   description: Author management
 */

import express, { type NextFunction, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token";
import { isAuth } from "../middleware/auth.middleware";

// Modelos
import { Author } from "../models/mongo/Author";

// Export de rutas
export const authorRoutes = express.Router();

// Rutas con Swagger

authorRoutes.get("/", (req: Request, res: Response, next: NextFunction) => {
  console.log("Estamos en el middleware /author que comprueba parámetros");

  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      req.query.page = page as any;
      req.query.limit = limit as any;
      next();
    } else {
      console.log("Parámetros no válidos:");
      console.log(JSON.stringify(req.query));
      res.status(400).json({ error: "Params page or limit are not valid" });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /author:
 *   get:
 *     summary: List all authors
 *     tags: [Author]
 *     responses:
 *       200:
 *         description: List with all the authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Author'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
authorRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lectura de query parameters
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const authors = await Author.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // Conteo del total de elementos
    const totalElements = await Author.countDocuments();

    // response se divide en pagination y data para tener dos objetos diferentes en swagger
    const response = {
      pagination: {
        totalItems: totalElements,
        totalPages: Math.ceil(totalElements / limit),
        currentPage: page,
      },
      data: authors,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /author:
 *   post:
 *     summary: Create a new author
 *     tags: [Author]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *     responses:
 *       200:
 *         description: The created author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
authorRoutes.post("/", async (req: Request, res: Response, next: NextFunction) => {
  console.log("Creando autor");
  try {
    const author = new Author({
      user: req.body.user,
      password: req.body.password,
      name: req.body.name,
      country: req.body.country,
    });

    const createdAuthor = await author.save();
    return res.status(201).json(createdAuthor);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /author/{id}:
 *   get:
 *     summary: Gets an specific author by ID
 *     tags: [Author]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Lists an specific author by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 */
authorRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  try {
    const author = await Author.findById(id);

    if (author) {
      res.json(author);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /author/name/{name}:
 *   get:
 *     summary: Get authors by name
 *     tags: [Author]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Author name
 *     responses:
 *       200:
 *         description: Authors matching the name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Author'
 *       404:
 *         description: No authors found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
authorRoutes.get("/name/:name", async (req: Request, res: Response, next: NextFunction) => {
  const name = req.params.name;

  try {
    const author = await Author.find({ name: new RegExp("^" + name.toLowerCase(), "i") });
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /author/{id}:
 *   delete:
 *     summary: Delete an author by ID
 *     tags: [Author]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Author ID
 *     responses:
 *       200:
 *         description: The deleted author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       401:
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
authorRoutes.delete("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log(req.author.user);
    if (req.author.id !== id && req.author.user !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes permisos para realizar esta operacion." });
    }

    const authorDeleted = await Author.findByIdAndDelete(id);
    if (authorDeleted) {
      res.json(authorDeleted);
    } else {
      // Solo ocurrira con usuario admin
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /author/{id}:
 *   put:
 *     summary: Update an author by ID
 *     tags: [Author]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Author ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *     responses:
 *       200:
 *         description: The updated author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
authorRoutes.put("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    if (req.author.id !== id && req.author.user !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes permisos para realizar esta operacion." });
    }
    const authorToUpdate = await Author.findById(id);
    if (authorToUpdate) {
      Object.assign(authorToUpdate, req.body); // Le asigna todo del body a la const
      await authorToUpdate.save();
      // Eliminamos el password del objeto que devuelve
      const authorPasswordFiltered = authorToUpdate.toObject();
      delete authorPasswordFiltered.password;
      res.status(200).json(authorToUpdate);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /author/login:
 *   post:
 *     summary: Login an author
 *     tags: [Author]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Missing user or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Invalid user or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
authorRoutes.post("/login", async (req: any, res: Response, next: NextFunction) => {
  try {
    // Declaracion de dos const con el mismo nombre que los campos que queremos del body
    const { user, password } = req.body;

    // Comprueba si hay usuario y contraseña
    if (!user || !password) {
      res.status(400).send("Falta el usuario o la contraseña.");
      return;
    }

    // Busca el usuario, seleccionando tambien el campo password
    const authorFound = await Author.findOne({ user }).select("+password");
    if (!authorFound) {
      return res.status(401).json({ error: "Combinacion de usuario y password incorrecta" });
    }

    // Compara el password recibido con el guardado previamente encriptado
    const passwordMatches = await bcrypt.compare(password, authorFound.password as string);
    if (passwordMatches) {
      // Eliminamos el password del objeto que devuelve
      const authorPasswordFiltered = authorFound.toObject();
      delete authorPasswordFiltered.password;

      // Generamos token JWT
      const jwtToken = generateToken(authorFound._id.toString(), authorFound.user);

      console.log("Login correcto");

      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Combinacion de usuario y password incorrecta" });
    }
  } catch (err) {
    next(err);
  }
});
