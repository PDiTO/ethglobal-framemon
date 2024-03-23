/* eslint-disable react/jsx-key */
import { Button, createFrames } from "frames.js/next";
import { getAddressForFid, getTokenUrl } from "frames.js";
import { zora } from "viem/chains";

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

  console.log(fid, address);

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
          Let's Go
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
