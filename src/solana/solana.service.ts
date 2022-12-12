import { Injectable } from '@nestjs/common';
import { Authorized, Keypair, Lockup, PublicKey, TransactionSignature } from '@solana/web3.js';
import { bToa } from '../common/utils/repository.util';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class SolanaService {
  solanaWeb3Obj = require('@solana/web3.js');


  createAccount(): Keypair {
    return this.solanaWeb3Obj.Keypair.generate();
  }

  generatePubKeyStr(secretKeyStr: string): string {
    return this.solanaWeb3Obj.Keypair.fromSecretKey(bToa(secretKeyStr)).publicKey.toBase58();
  }

  async airdrop(account: Keypair): Promise<void> {
    const connection = new this.solanaWeb3Obj.Connection(this.solanaWeb3Obj.clusterApiUrl('devnet'), 'confirmed');
    connection.requestAirdrop(
      account.publicKey,
      this.solanaWeb3Obj.LAMPORTS_PER_SOL,
    ).then(async (airdropSignature: TransactionSignature) => {
      await connection.confirmTransaction(airdropSignature);
    }).catch((e: any) => {
      console.log(e);
    });
  }

  async stake(user: UserEntity, stakeAmount: number): Promise<void> {
    let ownerAccount = this.solanaWeb3Obj.Keypair.fromSecretKey(bToa(user.ownerPrivateKey));
    let stakeAccount = this.solanaWeb3Obj.Keypair.fromSecretKey(bToa(user.stakePrivateKey));
    let authorizedAccount = this.solanaWeb3Obj.Keypair.fromSecretKey(bToa(user.authorizedPrivateKey));

    const connection = new this.solanaWeb3Obj.Connection(this.solanaWeb3Obj.clusterApiUrl('devnet'), 'confirmed');
    let createAccountTransaction = this.solanaWeb3Obj.StakeProgram.createAccount({
      fromPubkey: ownerAccount.publicKey,
      authorized: new Authorized(authorizedAccount.publicKey, authorizedAccount.publicKey),
      lamports: stakeAmount,
      lockup: new Lockup(0, 0, ownerAccount.publicKey),
      stakePubkey: stakeAccount.publicKey
    });
    await this.solanaWeb3Obj.sendAndConfirmTransaction(connection, createAccountTransaction, [ownerAccount, stakeAccount]);

    await connection.getStakeActivation(stakeAccount.publicKey);

    let voteAccounts = await connection.getVoteAccounts();
    let voteAccount = voteAccounts.current.concat(
      voteAccounts.delinquent,
    )[0];
    let votePubkey = new PublicKey(voteAccount.votePubkey);

    let delegateTransaction = this.solanaWeb3Obj.StakeProgram.delegate({
      stakePubkey: stakeAccount.publicKey,
      authorizedPubkey: authorizedAccount.publicKey,
      votePubkey: votePubkey,
    });
    await this.solanaWeb3Obj.sendAndConfirmTransaction(connection, delegateTransaction, [ownerAccount, authorizedAccount]);
  }

  async withdraw(user: UserEntity, withdrawAmount: number): Promise<void> {
    let ownerAccount = this.solanaWeb3Obj.Keypair.fromSecretKey(bToa(user.ownerPrivateKey));
    let stakeAccount = this.solanaWeb3Obj.Keypair.fromSecretKey(bToa(user.stakePrivateKey));
    let authorizedAccount = this.solanaWeb3Obj.Keypair.fromSecretKey(bToa(user.authorizedPrivateKey));

    const connection = new this.solanaWeb3Obj.Connection(this.solanaWeb3Obj.clusterApiUrl('devnet'), 'confirmed');
    let deactivateTransaction = this.solanaWeb3Obj.StakeProgram.deactivate({
      stakePubkey: stakeAccount.publicKey,
      authorizedPubkey: authorizedAccount.publicKey,
    });
    await this.solanaWeb3Obj.sendAndConfirmTransaction(connection, deactivateTransaction, [ownerAccount, authorizedAccount]);

    let withdrawTransaction = this.solanaWeb3Obj.StakeProgram.withdraw({
      stakePubkey: stakeAccount.publicKey,
      authorizedPubkey: authorizedAccount.publicKey,
      toPubkey: ownerAccount.publicKey,
      lamports: withdrawAmount,
    });
    await this.solanaWeb3Obj.sendAndConfirmTransaction(connection, withdrawTransaction, [ownerAccount, authorizedAccount]);
  }
}
