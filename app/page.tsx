import Link from "next/link";
import { currentURL, vercelURL } from "./utils";
import { createDebugUrl } from "./debug";
import type { Metadata } from "next";
import { fetchMetadata } from "frames.js/next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FrameMon",
    description: "Pet monsters, within a frame",
    other: {
      ...(await fetchMetadata(
        new URL("/frames", vercelURL() || "http://localhost:3000")
      )),
    },
  };
}

export default async function Home() {
  const url = currentURL("/");

  return (
    <div>
      FrameMon, debug here
      <Link href={createDebugUrl(url)} className="underline">
        here.
      </Link>
    </div>
  );
}
