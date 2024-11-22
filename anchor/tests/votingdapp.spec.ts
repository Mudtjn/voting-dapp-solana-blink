import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import {Votingdapp} from '../target/types/votingdapp'
import { BankrunProvider, startAnchor } from 'anchor-bankrun';
import { ProgramTestContext } from 'solana-bankrun';
const IDL = require('../target/idl/votingdapp.json');

const votingAddress = new PublicKey("41x3WMcKLGvQFBCKCrYLFgyiXuHKt7D195wK6T1BbWAu"); 

describe('votingdapp', () => {
  // Configure the client to use the local cluster.
  let context: ProgramTestContext; 
  let provider;
  anchor.setProvider(anchor.AnchorProvider.env());  
  let votingProgram: Program<Votingdapp> = anchor.workspace.Votingdapp as Program<Votingdapp>; 

  beforeAll(async() => {
    // context = await startAnchor("", [{
    //   name: "votingdapp",
    //   programId: votingAddress 
    // }], []); 
    // provider = new BankrunProvider(context); 
    // votingProgram = new Program<Votingdapp> (IDL, provider); 
  })

  it('Initialize Poll', async() => {
    await votingProgram.methods.initializePoll(
      new anchor.BN(1), 
      "are you Mudit??", 
      new anchor.BN(0), 
      new anchor.BN(1821246480)
    ).rpc(); 

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)], 
      votingAddress
    ); 

    const poll = await votingProgram.account.poll.fetch(pollAddress); 
    console.log(poll);
    
    expect(poll.pollId.toNumber()).toEqual(1); 
    expect(poll.description).toEqual("are you Mudit??"); 
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber()); 
  })

  it('Initializes Candidate', async() => {
    await votingProgram.methods.initializeCandidate(
      "Mudit", 
      new anchor.BN(1)
    ).rpc(); 
    await votingProgram.methods.initializeCandidate(
      "Jain", 
      new anchor.BN(1)
    ).rpc(); 

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)], 
      votingAddress
    ); 

    const [muditAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Mudit")], 
      votingAddress
    ); 

    const [jainAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Jain")], 
      votingAddress
    ); 

    const poll = await votingProgram.account.poll.fetch(pollAddress); 
    const muditCandidate = await votingProgram.account.candidate.fetch(muditAddress); 
    const jainCandidate = await votingProgram.account.candidate.fetch(jainAddress); 
    console.log(muditCandidate);
    console.log(jainCandidate); 

    expect(poll.candidateAmount.toNumber()).toEqual(2); 
    expect(muditCandidate.candidateVotes.toNumber()).toEqual(0); 
    expect(jainCandidate.candidateVotes.toNumber()).toEqual(0); 
  }); 

  it('Vote', async() => {
    await votingProgram.methods.vote(
      "Mudit", 
      new anchor.BN(1), 
    ).rpc(); 
    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)], 
      votingAddress
    ); 

    const [muditAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Mudit")], 
      votingAddress
    ); 

    const [jainAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Jain")], 
      votingAddress
    ); 

    const poll = await votingProgram.account.poll.fetch(pollAddress); 
    const muditCandidate = await votingProgram.account.candidate.fetch(muditAddress); 
    const jainCandidate = await votingProgram.account.candidate.fetch(jainAddress); 
    // console.log(muditCandidate);
    // console.log(jainCandidate); 

    expect(poll.candidateAmount.toNumber()).toEqual(2); 
    expect(muditCandidate.candidateVotes.toNumber()).toEqual(1); 
    expect(jainCandidate.candidateVotes.toNumber()).toEqual(0); 
  })
})
