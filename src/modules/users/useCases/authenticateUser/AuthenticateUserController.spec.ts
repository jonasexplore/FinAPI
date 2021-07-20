import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import request from "supertest";

import createConnection from "../../../../database";
import { app } from "../../../../app";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Authenticate user", () => {
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

  it("should be able to authenticate user", async () => {
    const response = await request(app).post("/sessions").send({
      email: "test@email.com",
      password: "12345678",
    });

    expect(response.status).toBe(200);
  });
});
