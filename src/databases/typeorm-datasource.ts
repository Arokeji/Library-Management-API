import { DataSource } from "typeorm";
import "reflect-metadata";
import { Student } from "../models/typeorm/Student";
import { Course } from "../models/typeorm/Course";
import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  host: process.env.SQL_HOST,
  username: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  type: "mysql",
  port: 3306,
  synchronize: true,
  logging: false,
  entities: [Student, Course], // Pendiente
  migrations: [],
  subscribers: [],
});
