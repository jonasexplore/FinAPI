import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Get statement operation", () => {
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

  it("should not be able to get statement operation if nonexist", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "test@email.com",
      password: "12345678",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/statements/1506295f-64f4-4e00-8382-c43ad2115209")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
