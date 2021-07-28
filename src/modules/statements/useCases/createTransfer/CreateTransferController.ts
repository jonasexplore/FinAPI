import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    const createTranferUseCase = container.resolve(CreateTransferUseCase);

    const statement = await createTranferUseCase.execute({
      ...request.body,
      receiver_id: request.user.id,
      sender_id: request.params.user_id,
    });

    return response.json(statement);
  }
}

export { CreateTransferController };
