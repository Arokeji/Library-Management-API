import { describe } from "node:test";
import { mongoConnect } from "../src/databases/mongo-db";
import mongoose from "mongoose";
import { app, server } from "../src/index";
import { Author, type IAuthor } from "../src/models/mongo/Author";
import request from "supertest";

void describe("Author controller", () => {
  const authorMock: IAuthor = {
    user: "JestTest@gmail.com",
    password: "12345678",
    name: "Jester",
    country: "Japan",
  };

  let token: string;
  let authorId: string;

  beforeAll(async () => {
    await mongoConnect();
    await Author.collection.drop();
    console.log("All authors deleted in testing database.");
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  it("Is Jest working?", () => {
    expect(true).toBeTruthy();
  });

  it("POST /author - Should create an author", async () => {
    const response = await request(app).post("/author").send(authorMock).set("Accept", "application/json").expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.user).toBe(authorMock.user);

    authorId = response.body._id;
  });

  it("POST /author/login - Should log as an author", async () => {
    const credentials = {
      user: authorMock.user,
      password: authorMock.password,
    };

    const response = await request(app).post("/author/login").send(credentials).expect(200);

    expect(response.body).toHaveProperty("token");
    token = response.body.token;
    console.log(token);
  });

  it("POST /author/login - Shouldn't log as an author due to wrong credentials", async () => {
    const credentials = {
      user: authorMock.user,
      password: "notvalidpassword",
    };

    const response = await request(app).post("/author/login").send(credentials).expect(401);

    expect(response.body.token).toBeUndefined();
  });

  it("GET /author - Returns the list of all authors", async () => {
    const response = await request(app).get("/author").expect(200);

    console.log(response.body);

    expect(response.body).toHaveProperty("data");
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].user).toBe(authorMock.user);
    expect(response.body.pagination.totalItems).toBe(1);
    expect(response.body.pagination.totalPages).toBe(1);
    expect(response.body.pagination.currentPage).toBe(1);
  });

  it("PUT /author/id - Modify logged author with token", async () => {
    const updatedData = {
      name: "Jest Updated",
    };

    const response = await request(app)
      .put(`/author/${authorId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.name).toBe(updatedData.name);
    expect(response.body.user).toBe(authorMock.user);
    console.log("Autor actualizado");
  });

  it("PUT /author/id - Should not modify author cause no token", async () => {
    const updatedData = {
      name: "Jest Updated",
    };

    const response = await request(app)
      .put(`/author/${authorId}`)
      .send(updatedData)
      .expect(401);

    expect(response.body.error).toBe("Token is missing.");
    console.log("Autor no actualizado");
  });

  it("DELETE /author/id - Trying to delete an author without using the token", async () => {
    const response = await request(app)
      .delete(`/author/${authorId}`)
      .expect(401);

    expect(response.body.error).toBe("Token is missing.");
    console.log("No puede borrar sin el token");
  });

  it("DELETE /author/id - Delete logged author using the token", async () => {
    const response = await request(app)
      .delete(`/author/${authorId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body._id).toBe(authorId);
    expect(response.body.user).toBe(authorMock.user);
    console.log("Autor borrado");
  });
});
