import request from "supertest";
import { Connection } from "typeorm";

import { v4 as uuid } from "uuid";

import createConnection from "../../../../database";
import { app } from "../../../../app";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Create transfer", async () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const password = await hash("12345678", 8);

    await connection.query(
      `INSERT INTO users (id, name, email, password, created_at, updated_at)
    VALUES('${uuid()}', 'admin', 'test@email.com', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new transfer", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "test@email.com",
      password: "12345678",
    });

    const { token } = responseToken.body;

    const password = await hash("12345678", 8);
    const sender_id = uuid();

    await connection.query(
      `INSERT INTO users (id, name, email, password, created_at, updated_at)
    VALUES('${sender_id}', 'admin', 'test@email.com', '${password}', 'now()', 'now()')`
    );

    await connection.query(
      `INSERT INTO statements (id, user_id, sender_id, description, amount, type, created_at, updated_at)
    VALUES('${uuid()}', '${sender_id}', 'null', 'deposit', '200', 'deposit', 'now()', 'now()')`
    );

    const response = await request(app)
      .post(`/statements/transfers/${sender_id}`)
      .send({
        amount: 100,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });
});
