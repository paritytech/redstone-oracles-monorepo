import { Web3FunctionResultCallData } from "@gelatonetwork/web3-functions-sdk";
import { Web3FunctionHardhat } from "@gelatonetwork/web3-functions-sdk/hardhat-plugin";
import { expect } from "chai";
import hre from "hardhat";
import args from "./userArgs.json";
import fs from "fs";
import path from "path";

const { w3f } = hre;

describe("RedStone Gelato w3f: On-chain Relayer & remote manifest e2e Tests", function () {
  this.timeout(0);

  let redstoneW3f: Web3FunctionHardhat;

  beforeEach(function () {
    redstoneW3f = w3f.get("redstone-mock"); // Use mock runner for local tests
  });

  it.skip("Return 'canExec: true' when update is needed", async () => {
    await performTest(args, "0x11B714817cBC92D402383cFd3f1037B122dcf69A");
  });

  it("Return 'canExec: true' when update is needed for MultiFeed", async () => {
    const userArgs = {
      ...args,
      shouldUpdatePrices: true,
      message: "Update needed",
      localManifestData: Buffer.from(
        fs.readFileSync(path.join(__dirname, "./manifestMultiFeed.json"))
      ).toString("base64"),
      manifestUrls: [
        "https://remote-config-ruby.vercel.app/gelato-sepolia-for-tests-multi-feed-manifest.json",
      ],
    };
    await performTest(userArgs, "0xfcd454d19f9B8806F8908e99d85b8eA17b3c7346");
  });

  async function performTest(
    userArgs: any,
    destinationContractAddress: string
  ) {
    const { result } = await redstoneW3f.run("onRun", { userArgs });
    expect(result.canExec).to.equal(true);

    const callData = (
      result as {
        canExec: true;
        callData: Web3FunctionResultCallData[];
      }
    ).callData;

    expect(callData.length).to.equal(1);
    expect(callData[0].to).to.equal(destinationContractAddress);

    // Check that callData is generated (similar to index.test.ts)
    const data = callData[0].data;
    expect(data).to.match(/0x[a-f0-9]+/); // Should be hex data
  }
});
