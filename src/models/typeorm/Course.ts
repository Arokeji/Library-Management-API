import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Student } from "./Student";

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    name: string;

  @Column()
    department: string;

  @OneToMany(type => Student, student => student.course, { cascade: true })
    students: Student[];
}
