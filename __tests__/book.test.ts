import { describe } from "node:test";
import { mongoConnect } from "../src/databases/mongo-db";
import mongoose from "mongoose";
import { app, server } from "../src/index";
import { Book, type IBook } from "../src/models/mongo/Book";
import request from "supertest";

void describe("Book controller", () => {
  const bookMock: IBook = {
    title: "Jesting Testing",
    pages: 100,
    rating: 8,
    publisher: {
      name: "Jesterbooks",
      category: "Novel",
    },
  };

  let bookId: string;

  beforeAll(async () => {
    await mongoConnect();
    await Book.collection.drop();
    console.log("All books deleted in testing database.");
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  it("Is Jest working?", () => {
    expect(true).toBeTruthy();
  });

  it("POST /book - Should create a book", async () => {
    const response = await request(app).post("/book").send(bookMock).set("Accept", "application/json").expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe(bookMock.title);

    bookId = response.body._id;
  });

  it("GET /book - Returns the list of all books", async () => {
    const response = await request(app).get("/book").expect(200);

    console.log(response.body);

    expect(response.body).toHaveProperty("data");
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].title).toBe(bookMock.title);
    expect(response.body.pagination.totalItems).toBe(1);
    expect(response.body.pagination.totalPages).toBe(1);
    expect(response.body.pagination.currentPage).toBe(1);
  });

  it("PUT /book/id - Modify a book", async () => {
    const updatedData = {
      title: "Jesting Tested",
    };

    const response = await request(app)
      .put(`/book/${bookId}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.title).toBe(updatedData.title);
    expect(response.body.publisher.name).toBe(bookMock.publisher.name);
    console.log("Libro actualizado");
  });

  it("DELETE /book/id - Deletes a book", async () => {
    const response = await request(app)
      .delete(`/book/${bookId}`)
      .expect(200);

    expect(response.body._id).toBe(bookId);
    expect(response.body.publisher.name).toBe(bookMock.publisher.name);
    console.log("Libro borrado");
  });
});
