import mysql, { type Connection, type ConnectionOptions } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const config: ConnectionOptions = {
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
};

export const sqlConnect = async (): Promise<Connection> => {
  const connection: Connection = await mysql.createConnection(config); // Devuelve una promesa y por eso ya no necesita el await.
  return connection;
};

export const sqlQuery = async (requestedQuery: string, params?: string): Promise<any> => {
  const connection: Connection = await sqlConnect();
  const [results] = await connection.execute(requestedQuery, params);
  return results;
};
