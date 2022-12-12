import { ApiProperty } from '@nestjs/swagger';

import { CommonDto } from '../../common/dtos/common.dto';

export class UserDto extends CommonDto {
  @ApiProperty({ description: "the user's full name" })
  fullName: string;

  @ApiProperty({ description: "the user's email address" })
  email: string;

  @ApiProperty({ description: "the user's Owner Account Public Key" })
  ownerPubKey: string;

  @ApiProperty({ description: "the user's Stake Account Public Key" })
  stakePubKey: string;

  @ApiProperty({ description: "the user's Authorize Account Public Key" })
  authorizedPubKey: string;
}
