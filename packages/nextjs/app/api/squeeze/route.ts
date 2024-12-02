// app/api/mint/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createPublicClient, createWalletClient, fallback, http, parseEventLogs, verifyMessage } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";
import { SqueezeReward } from "~~/types/frog";
import { getAlchemyHttpUrl, getParsedError } from "~~/utils/scaffold-eth";

const wallet_private_key = (process.env.WALLET_PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") as `0x${string}`;

const { targetNetworks } = scaffoldConfig;

const mainNetwork = targetNetworks[0];
const alchemyHttpUrl = getAlchemyHttpUrl(mainNetwork.id);
const rpcFallbacks = alchemyHttpUrl ? [http(alchemyHttpUrl), http()] : [http()];

const walletClient = createWalletClient({
  chain: mainNetwork,
  transport: fallback(rpcFallbacks),
  account: privateKeyToAccount(wallet_private_key),
});

const publicClient = createPublicClient({
  chain: mainNetwork,
  transport: http(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateFrogStory(frogStats: FrogStats): Promise<string> {
  const prompt = `
Create a short, mystical story (max 2 sentences and leave it open and vague) about a high priestess juicing this frog in a magical ritual. Great juices are extracted!!! Use these attributes in creative ways:

Name: ${frogStats.name}
Beauty: ${frogStats.beauty}/15
Intelligence: ${frogStats.intelligence}/15
Jump: ${frogStats.jump}/15
Speed: ${frogStats.speed}/15
Rarity: ${frogStats.rarity}/6
Biome: ${frogStats.biome}

Description: ${frogStats.description}
`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0].message.content || "Failed to generate story";
  } catch (error) {
    console.error("Error generating story:", error);
    return "In a mystical ceremony, a priest encountered this remarkable frog.";
  }
}

type ProofData = {
  pi_a: string[];
  pi_b: string[][]; // Array of arrays for pi_b
  pi_c: string[];
  pubSignals: string[];
};

type FrogStats = {
  beauty: string;
  biome: string;
  intelligence: string;
  jump: string;
  speed: string;
  rarity: string;
  owner: string;
  name: string;
  description: string;
  temperament: string;
  frogId: string;
};

type SqueezeRequestBody = {
  proof: ProofData;
  frogStats: FrogStats;
  signature: string;
  address: string;
  timestamp: number;
};

// Utility function to convert string arrays to BigInt arrays
const convertToBigIntArray = (arr: string[]): bigint[] => {
  return arr.map(str => BigInt(str));
};

// Utility function to convert nested string arrays to nested BigInt arrays
const convertToBigIntNestedArray = (arr: string[][]): bigint[][] => {
  return arr.map(subArr => subArr.map(str => BigInt(str)));
};

// Utility function to convert frog stats to BigInt
const convertFrogStatsToBigInt = (stats: Omit<FrogStats, "description">) => {
  return {
    beauty: BigInt(stats.beauty),
    biome: BigInt(stats.biome),
    frogId: BigInt(stats.frogId),
    intelligence: BigInt(stats.intelligence),
    jump: BigInt(stats.jump),
    speed: BigInt(stats.speed),
    temperament: BigInt(stats.temperament),
    rarity: BigInt(stats.rarity),
    owner: BigInt(stats.owner),
    name: stats.name, // Keep as string
  };
};

// Utility function to convert proof data to BigInt
const convertProofToBigInt = (proof: ProofData) => {
  return {
    pi_a: convertToBigIntArray(proof.pi_a),
    pi_b: convertToBigIntNestedArray(proof.pi_b), // Using nested array conversion for pi_b
    pi_c: convertToBigIntArray(proof.pi_c),
    pubSignals: convertToBigIntArray(proof.pubSignals),
  };
};

export async function POST(req: Request) {
  try {
    const body: SqueezeRequestBody = await req.json();

    // Convert string values to BigInt
    const convertedProof = convertProofToBigInt(body.proof);
    const { description, ...actualStats } = body.frogStats;
    console.log("The acutal values are:", actualStats);
    const convertedFrogStats = convertFrogStatsToBigInt(actualStats);

    const message = `You are signing that you own ${body.frogStats.name} at timestamp ${body.timestamp} on https://frogcrypto-squeeze.com`;

    // Verify signature
    const isValidSignature = await verifyMessage({
      message,
      signature: body.signature as `0x${string}`,
      address: body.address as `0x${string}`,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("The description values are: ", description);

    const story = await generateFrogStory({
      ...body.frogStats,
      description,
    });

    const { address: contractAddress, abi: contractAbi } = deployedContracts[mainNetwork.id].FrogCryptoSqueezeV2;
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "squeezeFrog",
      args: [
        {
          _pA: convertedProof.pi_a as any,
          _pB: convertedProof.pi_b as any,
          _pC: convertedProof.pi_c as any,
          _pubSignals: convertedProof.pubSignals as any,
        },
        {
          beauty: convertedFrogStats.beauty,
          biome: convertedFrogStats.biome,
          intelligence: convertedFrogStats.intelligence,
          jump: convertedFrogStats.jump,
          speed: convertedFrogStats.speed,
          rarity: convertedFrogStats.rarity,
          owner: convertedFrogStats.owner,
          temperament: convertedFrogStats.temperament,
          frogId: convertedFrogStats.frogId,
        },
        body.address,
        `${actualStats.name}|${story}`,
      ],
    });

    const transaction = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction: ", transaction);

    const logs = parseEventLogs({
      abi: contractAbi,
      logs: transaction.logs,
    });

    console.log("The logs are: ", logs);

    const rewards: SqueezeReward = {
      beauty: logs[0].args.beautyReward.toString(),
      intelligence: logs[0].args.intelligenceReward.toString(),
      jump: logs[0].args.jumpReward.toString(),
      speed: logs[0].args.speedReward.toString(),
      rarity: logs[0].args.rarityReward.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Frog squeezed successfully",
        txHash: hash,
        story,
        rewards,
      },
      { status: 200 },
    );
  } catch (error) {
    const parsedErrorMessage = getParsedError(error);
    const finalErrorMessage = parsedErrorMessage.toLowerCase().includes("invalid signer")
      ? `${parsedErrorMessage}, please use another frog`
      : parsedErrorMessage;
    console.error(error);
    return NextResponse.json({ error: finalErrorMessage }, { status: 500 });
  }
}
