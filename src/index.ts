// Librerias generales
import cors from "cors";
import express from "express";
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
// Conexiones
import { mongoConnect } from "./databases/mongo-db";
// import { sqlConnect } from "./databases/sql-db";
// import { AppDataSource } from "./databases/typeorm-datasource";
// Rutas
import { bookRoutes } from "./routes/book.routes";
import { authorRoutes } from "./routes/author.routes";
import { companyRoutes } from "./routes/company.routes";
import { studentRoutes } from "./routes/student.routes";
import { courseRoutes } from "./routes/course.routes";
import { swaggerOptions } from "./swagger-options";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

// const { fileUploadRouter } = require("./routes/file-upload.routes.js");

const corsWhiteList = ["http://localhost:3000", "http://localhost:3001", "https://s7validationcors.vercel.app"];

// const corsWhiteList = "*";

// Conexion a la BBDD (la pasamos a un middleware para despliegue en Render, que no es compatible con la funcion Main que habia que era async)
// const mongoDatabase = await mongoConnect();
// const sqlDatabase = await sqlConnect();
// const dataSource = await AppDataSource.initialize();

// Configuracion del servidor
const PORT = 3000;
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: corsWhiteList }));

// Swagger con una ruta para la UI
const specs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Rutas
const router = express.Router();
router.get("/", (req: Request, res: Response) => {
  // res.send(`<h1>Library API Typescript</h1>
  //             <p>Conectado con DDBB Mongo en ${mongoDatabase?.connection?.name as string}</p>
  //             <p>Conectado con DDBB SQL en ${sqlDatabase?.config?.database as string} en el host ${sqlDatabase?.config?.host as string}</p>
  //             <p>Conectado con DDBB SQL ${dataSource?.options?.database as string} con TypeORM</p>
  //           `);
  res.send("<h3>Library API for Render</h3>");
});
router.get("*", (req: Request, res: Response) => {
  res.status(404).send("La pagina solicitada no existe");
});

// Middleware de aplicación
app.use((req: Request, res: Response, next: NextFunction) => {
  const date = new Date();
  console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date.toString()}`);
  next();
});

// Middleware de aplicacion
app.use(async (req: Request, res: Response, next: NextFunction) => {
  console.log("Middleware de conexion");
  try {
    await mongoConnect();
    // await sqlConnect();
    // await AppDataSource.initialize();
    next();
  } catch (error) {
    next(error);
  }
});

// Uso del router
app.use("/book", bookRoutes);
app.use("/author", authorRoutes);
app.use("/company", companyRoutes);
app.use("/student", studentRoutes);
app.use("/course", courseRoutes);
app.use("/public", express.static("public"));
app.use("/", router);

// Middleware para la gestion de errores
app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  console.log("*** ERROR ***");
  console.log(`Peticion fallida: ${req.method} a la url ${req.originalUrl}`);
  console.log(err);

  // Es un apaño para que el error pueda acceder a sus propiedades
  const errorAsAny: any = err as unknown as any;

  if (err?.name === "ValidationError") {
    res.status(400).json(err);
  } else if (errorAsAny?.code === 11000) {
    console.log("Usuario duplicado");
    res.status(400).json({ error: errorAsAny.errmsg });
  } else if (errorAsAny?.code === "ER_NO_DEFAULT_FOR_FIELD") {
    res.status(400).json({ error: errorAsAny.sqlMessage });
  } else {
    res.status(500).json(err);
  }

  console.log("*** FIN DE ERROR ***");

  console.error(err);
  res.status(500).send(errorAsAny.stack);
});

// Ejecución del servidor
export const server = app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});
