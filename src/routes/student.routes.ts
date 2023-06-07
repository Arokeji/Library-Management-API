import { Router, type NextFunction, type Request, type Response } from "express";

// Typeorm
import { Student } from "../models/typeorm/Student";
import { AppDataSource } from "../databases/typeorm-datasource";
import { type Repository } from "typeorm";
import { Course } from "../models/typeorm/Course";

const studentRepository: Repository<Student> = AppDataSource.getRepository(Student);
const courseRepository: Repository<Course> = AppDataSource.getRepository(Course);

// Router
export const studentRoutes = Router();

// CRUD: Read
studentRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const students: Student[] = await studentRepository.find({ relations: ["course"] });
    res.json(students);
  } catch (error) {
    next(error);
  }
});

// CRUD: Read with ID
studentRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Recoge los parametros
    const idParam = parseInt(req.params.id);
    // Busca por ID
    const student = await studentRepository.findOne({
      where: {
        id: idParam,
      },
      relations: ["course"],
    });

    if (!student) {
      res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
});

// CRUD: Create
studentRoutes.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Creacion de objecto
    const newStudent = new Student();

    let courseRelated;

    if (req.body.courseId) {
      courseRelated = await courseRepository.findOne({
        where: {
          id: req.body.courseId,
        },
      });

      if (!courseRelated) {
        res.status(404).json({ error: "Course not found" });
        return;
      }
    }

    // Asignacion de valores
    Object.assign(newStudent, {
      ...req.body,
      course: courseRelated,
    });

    // Insercion del estudiante
    const studentSaved = await studentRepository.save(newStudent);

    res.status(201).json(studentSaved);
  } catch (error) {
    next(error);
  }
});

// CRUD: Delete with ID
studentRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Recoge los parametros
    const idParam = parseInt(req.params.id);
    // Busca el estudiante por ID
    const studentToDelete = await studentRepository.findOneBy({
      id: idParam,
    });

    if (!studentToDelete) {
      res.status(404).json({ error: "Student not found" });
    } else {
      await studentRepository.remove(studentToDelete);
      res.json(studentToDelete);
    }

    res.json(studentToDelete);
  } catch (error) {
    next(error);
  }
});

// CRUD: Update/Put
studentRoutes.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = parseInt(req.params.id);
    // Busca el estudiante por ID
    const studentToUpdate = await studentRepository.findOneBy({
      id: idParam,
    });

    if (!studentToUpdate) {
      res.status(404).json({ error: "Student not found" });
    } else {
      let courseRelated = null;

      if (req.body.teamId) {
        courseRelated = await courseRepository.findOne({
          where: {
            id: req.body.courseId,
          },
        });

        if (!courseRelated) {
          res.status(404).json({ error: "Course not found" });
          return;
        }
      }

      if (courseRelated) {
        // Asignacion de valores
        Object.assign(studentToUpdate, {
          ...req.body,
          course: courseRelated,
        });

        // Insercion del estudiante
        const studentSaved = await studentRepository.save(studentToUpdate);
        res.status(201).json(studentSaved);
      } else {
        res.status(404).json({ error: "No existe el curso a relacionar." });
      }
    }
  } catch (error) {
    next(error);
  }
});
