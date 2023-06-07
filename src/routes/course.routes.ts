import { Router, type NextFunction, type Request, type Response } from "express";

// Typeorm
import { Course } from "../models/typeorm/Course";
import { AppDataSource } from "../databases/typeorm-datasource";
import { type Repository } from "typeorm";
// import { Student } from "../models/typeorm/Student";

const courseRepository: Repository<Course> = AppDataSource.getRepository(Course);
// const studentRepository: Repository<Student> = AppDataSource.getRepository(Student);

// Router
export const courseRoutes = Router();

// CRUD: Read
courseRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses: Course[] = await courseRepository.find({ relations: ["students"] });
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// CRUD: Read with ID
courseRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Recoge los parametros
    const idParam = parseInt(req.params.id);
    // Busca por ID
    const course = await courseRepository.findOne({
      where: {
        id: idParam,
      },
      relations: ["students"]
    });

    if (!course) {
      res.status(404).json({ error: "course not found" });
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
});

// CRUD: Create
courseRoutes.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Creacion de objecto
    const newcourse = new Course();

    // Asignacion de valores
    Object.assign(newcourse, req.body);

    // Insercion del estudiante
    const courseSaved = await courseRepository.save(newcourse);

    res.status(201).json(courseSaved);
  } catch (error) {
    next(error);
  }
});

// CRUD: Delete with ID
courseRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Recoge los parametros
    const idParam = parseInt(req.params.id);
    // Busca el estudiante por ID
    const courseToDelete = await courseRepository.findOne({
      where: {
        id: idParam,
      },
      relations: ["student"]
    });

    if (!courseToDelete) {
      res.status(404).json({ error: "course not found" });
    } else {
      for (const student of courseToDelete.students as any) {
        student.course = null as any;
        await AppDataSource.manager.save(student)
      }

      await courseRepository.remove(courseToDelete);
      res.json(courseToDelete);
    }

    res.json(courseToDelete);
  } catch (error) {
    next(error);
  }
});

// CRUD: Update/Put
courseRoutes.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = parseInt(req.params.id);
    // Busca el estudiante por ID
    const courseToUpdate = await courseRepository.findOneBy({
      id: idParam,
    });

    if (!courseToUpdate) {
      res.status(404).json({ error: "course not found" });
    } else {
      // Asignacion de valores
      Object.assign(courseToUpdate, {
        firsName: req.body.firstName,
        lastName: req.body.lastName,
      });

      const updatedcourse = await courseRepository.save(courseToUpdate);

      res.status(201).json(updatedcourse);
    }
  } catch (error) {
    next(error);
  }
});
