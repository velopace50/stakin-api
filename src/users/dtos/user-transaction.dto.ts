import { ApiProperty } from '@nestjs/swagger';

export class UserTransactionDto {
  @ApiProperty({ description: "the user's request amount" })
  amount: number;
}
