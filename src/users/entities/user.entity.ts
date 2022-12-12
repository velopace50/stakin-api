import { BeforeInsert, Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';
import { hash } from 'bcrypt';

import { SoftDelete } from '../../common/core/soft-delete';
import { UserDto } from '../dtos/user.dto';

@Entity('user')
export class UserEntity extends SoftDelete {
  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: '' })
  @Exclude()
  ownerPrivateKey: string;

  @Column({ default: '' })
  @Exclude()
  stakePrivateKey: string;

  @Column({ default: '' })
  @Exclude()
  authorizedPrivateKey: string;

  @BeforeInsert()
  preProcess() {
    return hash(this.password, 10).then(
      (encrypted) => (this.password = encrypted),
    );
  }

  toDto(): UserDto {
    return {
      ...super.toDto(),
      email: this.email,
      fullName: this.fullName,
      ownerPubKey: this.ownerPrivateKey,
      stakePubKey: this.stakePrivateKey,
      authorizedPubKey: this.authorizedPrivateKey,
    };
  }
}
