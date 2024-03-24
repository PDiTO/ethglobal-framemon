/* eslint-disable react/jsx-key */
import { Button, createFrames } from "frames.js/next";
import { getAddressForFid, getTokenUrl } from "frames.js";
import { createWalletClient, http, createPublicClient } from "viem";
import { baseSepolia } from "viem/chains";

import contractAbi from "../config/abi.json";
import { MonDataResponse } from "../types/framemon";

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
  const page = ctx.searchParams?.page ?? "initial";

  const fid = ctx.message?.requesterFid;

  const address = await getAddressForFid({
    fid: fid ?? 0,
    options: { fallbackToCustodyAddress: true },
  });

  const mon = await monData(address);

  console.log(mon);

  if (page === "initial") {
    return {
      image: (
        <div
          tw="flex flex-col text-red-500 justify-center items-center bg-violet-900"
          style={{ width: "100%", height: "100%" }}
        >
          <div tw="text-[64px] font-black text-white">FrameMon</div>
          <div tw="text-white font-bold">A little monster, in a Frame</div>
          {/* <img src="/cat01_idle_8fps.gif" /> */}
        </div>
      ),
      buttons: [
        <Button action="post" target={{ query: { page: "start" } }}>
          Lets Go
        </Button>,
      ],
    };
  }

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
          Loaded mon {mon.frameMon.name}.
        </div>
      ),
    };
  }

  return {
    image:
      "https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeidc6e5t3qmyckqh4fr2ewrov5asmeuv4djycopvo3ro366nd3bfpu&w=1920&q=75",
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
      <Button
        action="post"
        target={{
          query: {
            pageIndex: String(1),
          },
        }}
      >
        ←
      </Button>,
      <Button
        action="post"
        target={{
          query: {
            pageIndex: String(2),
          },
        }}
      >
        →
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
