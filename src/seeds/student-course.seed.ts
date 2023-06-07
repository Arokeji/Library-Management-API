import { AppDataSource } from "../databases/typeorm-datasource";
import { Course } from "../models/typeorm/Course";
import { Student } from "../models/typeorm/Student";

export const studentSeed = async (): Promise<void> => {
  // Conexion a BBDD
  const dataSource = await AppDataSource.initialize();
  console.log(`Conexion realizada a ${dataSource?.options?.database as string}`);

  // Borrado de datos existentes
  await AppDataSource.manager.delete(Student, {});
  console.log("Borrado de datos de la tabla student");
  await AppDataSource.manager.delete(Course, {});
  console.log("Borrado de datos de la tabla course");

  // Creacion de dos estudiantes y un curso
  const student1 = {
    firstName: "Juan",
    lastName: "Perez",
  };

  const student2 = {
    firstName: "Ana",
    lastName: "Lopez",
  };

  // Creamos entidad de jugadores
  const student1Entity = AppDataSource.manager.create(Student, student1);
  const student2Entity = AppDataSource.manager.create(Student, student2);

  const course1 = {
    name: "Matemáticas",
    department: "Números",
    students: [student1Entity, student2Entity],
  };
  // Creamos entidad del equipo
  const course1Entity = AppDataSource.manager.create(Course, course1);

  // Guardamos en la BBDD (al estar en cascada arrastra a los estudiantes tambien)
  await AppDataSource.manager.save(course1Entity);

  // Cerramos conexion con BBDD
  await AppDataSource.destroy();
  console.log("Desconectado de la BBDD");
};

void studentSeed();
