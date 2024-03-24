import { TransactionTargetResponse } from "frames.js";
import { getFrameMessage } from "frames.js/next/server";
import { NextRequest, NextResponse } from "next/server";
import { Abi, encodeFunctionData } from "viem";
import contractAbi from "../../config/abi.json";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const json = await req.json();

  const frameMessage = await getFrameMessage(json);

  if (!frameMessage) {
    throw new Error("No frame message");
  }

  const calldata = encodeFunctionData({
    abi: contractAbi.abi,
    functionName: "cheer",
    args: [],
  });

  return NextResponse.json({
    chainId: "eip155:84532",
    method: "eth_sendTransaction",
    params: {
      abi: contractAbi.abi as Abi,
      to: process.env.CONTRACT_ADDRESS as "0x",
      data: calldata,
      value: "0",
    },
  });
}
