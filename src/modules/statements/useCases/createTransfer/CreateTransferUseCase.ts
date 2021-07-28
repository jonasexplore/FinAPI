import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private readonly usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private readonly statmentsRepository: IStatementsRepository
  ) {}

  async execute({
    amount,
    description,
    receiver_id,
    sender_id,
  }: ICreateTransferDTO): Promise<Statement> {
    if (receiver_id === sender_id) {
      throw new CreateTransferError.SameUser();
    }

    const sender_user = await this.usersRepository.findById(sender_id);

    if (!sender_user) {
      throw new CreateTransferError.UserNotFound();
    }

    const receiver_user = await this.usersRepository.findById(receiver_id);

    if (!receiver_user) {
      throw new CreateTransferError.UserNotFound();
    }

    const { balance } = await this.statmentsRepository.getUserBalance({
      user_id: sender_id,
      with_statement: false,
    });

    if (balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const statement = await this.statmentsRepository.create({
      amount,
      description,
      user_id: receiver_id,
      type: OperationType.TRANSFER,
      sender_id,
    });

    return statement;
  }
}

export { CreateTransferUseCase };
