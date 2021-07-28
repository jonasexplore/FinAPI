import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { validate } from "uuid";

let createTransfer: CreateTransferUseCase;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;

describe("Create Transfer", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createTransfer = new CreateTransferUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a new transfer", async () => {
    const user1 = await usersRepository.create({
      email: "test@gmail.com",
      name: "test",
      password: "1234",
    });

    const user2 = await usersRepository.create({
      email: "test2@gmail.com",
      name: "test2",
      password: "1234",
    });

    await statementsRepository.create({
      amount: 150,
      description: "deposit test",
      type: OperationType.DEPOSIT,
      user_id: user2.id,
    });

    const statement = await createTransfer.execute({
      amount: 100,
      description: "test",
      receiver_id: user1.id,
      sender_id: user2.id,
    });

    expect(statement).toHaveProperty("id");
    expect(validate(String(statement.sender_id))).toBe(true);
  });
});
