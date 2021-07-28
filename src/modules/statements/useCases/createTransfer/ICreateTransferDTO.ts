interface ICreateTransferDTO {
  amount: number;
  description: string;
  sender_id: string;
  receiver_id: string;
}

export { ICreateTransferDTO };
