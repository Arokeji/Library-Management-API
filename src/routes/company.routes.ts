import express, { type NextFunction, type Request, type Response } from "express";
import { sqlQuery } from "../databases/sql-db";
import { type TechCompany } from "../models/sql/TechCompany";

// Export de rutas
export const companyRoutes = express.Router();

// Rutas
// CRUD: Read
// Ejemplo de request con parametros http://localhost:3000/book/?page=2&limit=10
companyRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  console.log("Estamos en el middleware /company");

  try {
    const rows = await sqlQuery(
      `SELECT * 
      FROM techs`
    );

    if (rows?.[0]) {
      const response = { data: rows };
      res.json(response);
    } else {
      res.status(404).json("La consulta no obtuvo resultados");
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Create
companyRoutes.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, employeesNumber, foundedYear, headquarters, ceo } = req.body as TechCompany;

    const query: string = `
      INSERT INTO techs (name, employeesNumber, foundedYear, headquarters, ceo)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params: any = [name, employeesNumber, foundedYear, headquarters, ceo];

    const result = await sqlQuery(query, params);

    if (result) {
      return res.status(201).json({});
    } else {
      return res.status(500).json({ error: "Tech company not created" });
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Read
companyRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  console.log("Estamos en el middleware /company buscando por id");

  try {
    const id = req.params.id;

    const rows = await sqlQuery(
      `SELECT * 
      FROM techs
      WHERE id = ${id}`
    );

    if (rows?.[0]) {
      const response = { data: rows };
      res.json(response);
    } else {
      res.status(404).json("La consulta no obtuvo resultados");
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Delete
companyRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    await sqlQuery(`
      DELETE 
      FROM techs
      WHERE id = ${id}`);

    const rows = await sqlQuery(`
      SELECT * 
      FROM techs
      WHERE id = ${id}
    `);

    if (rows?.[0]) {
      const response = { data: rows };
      res.json(response);
    } else {
      res.status(404).json("Tech company didn't exist or has just been deleted.");
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Put/Update
companyRoutes.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { name, employeesNumber, foundedYear, headquarters, ceo } = req.body as TechCompany;

    const query: string = `
      UPDATE techs
      SET name = ?, employeesNumber = ?, foundedYear = ?, headquarters = ?, ceo = ?
      WHERE id = ?
    `;

    const params: any = [name, employeesNumber, foundedYear, headquarters, ceo, id];

    await sqlQuery(query, params);

    const rows = await sqlQuery(`
      SELECT * 
      FROM techs
      WHERE id = ${id}
    `);

    if (rows?.[0]) {
      const response = { data: rows };
      res.json(response);
    } else {
      res.status(404).json("Tech company not found in de database.");
    }
  } catch (error) {
    next(error);
  }
});
