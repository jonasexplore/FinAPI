import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Create statement", () => {
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

  it("should be able to create a new deposit", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "test@email.com",
      password: "12345678",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/statements/deposit")
      .send({
        amount: 100,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should be able to create a new withdraw", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "test@email.com",
      password: "12345678",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/statements/deposit")
      .send({
        amount: 100,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/statements/withdraw")
      .send({
        amount: 50,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new withdraw without balance", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "test@email.com",
      password: "12345678",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/statements/withdraw")
      .send({
        amount: 50,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
