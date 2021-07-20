import { Connection, createConnection, getConnectionOptions } from "typeorm";

export default async (host = "localhost"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  const connection = Object.assign(defaultOptions, {
    host: process.env.NODE_ENV === "test" ? "localhost" : host,
    database:
      process.env.NODE_ENV === "test"
        ? "fin_api_test"
        : defaultOptions.database,
  });

  return createConnection(connection);
};
