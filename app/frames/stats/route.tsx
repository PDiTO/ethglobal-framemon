/* eslint-disable react/jsx-key */
import { Button, createFrames } from "frames.js/next";
import { getAddressForFid } from "frames.js";
import { http, createPublicClient } from "viem";
import { baseSepolia } from "viem/chains";

import contractAbi from "../../config/abi.json";
import { MonDataResponse } from "../../types/framemon";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_URL),
});

async function monData(address: string): Promise<MonDataResponse | Error> {
  try {
    const response: any = await publicClient.readContract({
      address: process.env.CONTRACT_ADDRESS as "0x",
      abi: contractAbi.abi,
      functionName: "getMon",
      args: [address],
    });

    // Assuming the response structure is as you've provided
    const formattedResponse: MonDataResponse = {
      frameMon: {
        tokenId: response[0].tokenId,
        owner: response[0].owner,
        name: response[0].name,
        birthDate: response[0].birthDate,
        moodUpdate: response[0].moodUpdate,
        energyUpdate: response[0].energyUpdate,
        socialUpdate: response[0].socialUpdate,
        mood: response[0].mood,
        energy: response[0].energy,
        social: response[0].social,
      },
      mood: response[1],
      energy: response[2],
      social: response[3],
    };

    return formattedResponse;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

const frames = createFrames({
  basePath: "/frames",
});

const handleRequest = frames(async (ctx) => {
  const fid = ctx.message?.requesterFid;

  const address = await getAddressForFid({
    fid: fid ?? 0,
    options: { fallbackToCustodyAddress: true },
  });

  const mon = await monData(address);

  if (fid === 0) {
    return {
      image: (
        <span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            There was an error. Please refresh.
          </div>
        </span>
      ),
      buttons: [
        <Button action="post" target="/">
          Refresh
        </Button>,
      ],
    };
  }

  if (mon instanceof Error) {
    return {
      image: (
        <span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            There was an error. Please refresh.
          </div>
        </span>
      ),
      buttons: [
        <Button action="post" target="/">
          Refresh
        </Button>,
      ],
    };
  }

  if (mon && mon.frameMon.tokenId === BigInt(0)) {
    // Sign up
    return {
      image: (
        <div style={{ display: "flex", flexDirection: "column" }}>
          Loaded but no mon.
        </div>
      ),
      buttons: [
        <Button action="tx" target="/tx-mint" post_url="/">
          Mint Monsters
        </Button>,
      ],
    };
  }

  if (mon && mon.frameMon.tokenId !== BigInt(0)) {
    return {
      image: (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>Hey it's {mon.frameMon.name}.</div>
          <div>Mood: {mon.mood}</div>
          <div>Energy: {mon.energy}</div>
          <div>Social: {mon.social}</div>
        </div>
      ),
      buttons: [
        <Button action="post" target="/">
          Back
        </Button>,
      ],
    };
  }

  return {
    image: (
      <span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          There was an error. Please refresh.
        </div>
      </span>
    ),
    buttons: [
      <Button action="post" target="/">
        Refresh
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
