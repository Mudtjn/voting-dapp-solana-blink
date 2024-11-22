import { BN, Program, web3 } from "@coral-xyz/anchor";
import { Votingdapp } from "@project/anchor";
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { PublicKey, Transaction } from "@solana/web3.js";

const IDL = require('@/../anchor/target/idl/votingdapp.json');

export const OPTIONS = GET; 

export async function GET(request: Request) {
    const actionMetadata: ActionGetResponse = {
        icon: "https://avatars.githubusercontent.com/u/95545310?s=400&u=f91bef2ba687b6a156b846332310fe2cd172c09d&v=4", 
        title: "Vote for your favorite candidate", 
        description: "Vote for mudit or jain", 
        label: "Vote", 
        links: {
            actions: [
                {
                    type: "post",
                    href: "/api/vote?candidate=Mudit", 
                    label: "Vote for Mudit"
                }, 
                {
                    type: "post",
                    href: "/api/vote?candidate=Jain", 
                    label: "Vote for Jain"
                }
            ]
        }
    }; 
    return Response.json(actionMetadata, {headers: ACTIONS_CORS_HEADERS}); 
}

export async function POST(request: Request) {
    const url = new URL(request.url); 
    const candidate = url.searchParams.get('candidate') as string; 
    console.log(candidate); 
    if(candidate != "Mudit" && candidate != "Jain"){
        return new Response("Invalid Candidate", {status: 400, headers: ACTIONS_CORS_HEADERS}); 
    }

    const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
    const program: Program<Votingdapp> = new Program(IDL, {connection}); 

    const body: ActionPostRequest = await request.json(); 
    let voter; 

    try {
        voter = new PublicKey(body.account); 
    } catch(error) {
        return new Response("Invalid Account", {status: 400, headers: ACTIONS_CORS_HEADERS}); 
    }

    const instruction = await program.methods.vote(candidate, new BN(1)).accounts({signer: voter}).instruction(); 
    const blockhash = await connection.getLatestBlockhash(); 

    const tx = new Transaction({
        feePayer: voter, 
        blockhash: blockhash.blockhash, 
        lastValidBlockHeight: blockhash.lastValidBlockHeight
    }).add(instruction); 

    const response = await createPostResponse({
        fields: {
            transaction: tx,
            type: "transaction"
        }
    }); 

    return Response.json(response, {headers: ACTIONS_CORS_HEADERS}); 
}   