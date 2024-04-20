"use client";

// import { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
// import * as React from "react";
import Link from "next/link";
import { abi as abiL, bytecode as bytecodeL } from "./assets/Lottery.json";
import { abi, bytecode } from "./assets/LotteryToken.json";
import * as dotenv from "dotenv";
import type { NextPage } from "next";
import {
  AbiEncodingLengthMismatchError,
  createPublicClient,
  createWalletClient,
  formatEther,
  hexToString,
  http,
  parseEther,
  toHex,
} from "viem";
import {
  // hexToString,
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite, // useWriteContract,
  useNetwork, // useWaitForTransactionReceipt,
  usePrepareContractWrite,
  useSignMessage,
  useWaitForTransaction,
} from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

dotenv.config();

type HexString = `0x${string}`;
// Attempt to retrieve the token contract address from localStorage
// const lotteryContractAddress = localStorage.getItem("lotteryContractAddress");

// Perform a runtime check to ensure the retrieved value matches the HexString format
const isValidHexString = (value: string | null): value is HexString => {
  return typeof value === "string" && /^0x[a-fA-F0-9]+$/.test(value);
};

const LOTTERY_CONTRACT: HexString = process.env.NEXT_PUBLIC_LOTTERY_CONTRACT || "";
const LOTTERY_TOKEN_CONTRACT: HexString = process.env.NEXT_PUBLIC_LOTTERY_TOKEN_CONTRACT || "";
// // If the stored value is a valid HexString, use it; otherwise, default to "0x"
// var tokenContractAddress: HexString = isValidHexString(storedTokenContractAddress) ? storedTokenContractAddress : "0x";

// var tokenizedBallotContractAddress: HexString = isValidHexString(storedTokenenizedBallotContractAddress)
//   ? storedTokenenizedBallotContractAddress
//   : "0x";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to the</span>
            <span className="block text-4xl font-bold">Lottery App</span>
          </h1>
          {/* <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/pages.tsx
            </code>
          </p> */}
          <PageBody></PageBody>
        </div>
      </div>
    </>
  );
};

function PageBody() {
  // const { chain } = useNetwork();
  return (
    <>
      {/* <p className="text-center text-lg">Here we are!</p> */}
      <WalletInfo></WalletInfo>
      {/* <p>Connected to the network {chain?.name}</p> */}
    </>
  );
}

function WalletInfo() {
  const { address, isConnecting, isDisconnected, isConnected } = useAccount();
  const { chain } = useNetwork();

  // console.log("LOTTERY_CONTRACT", LOTTERY_CONTRACT);
  // console.log("LOTTERY_TOKEN_CONTRACT", LOTTERY_TOKEN_CONTRACT);
  if (address)
    return (
      <div>
        <p>Connected to the network {chain?.name}</p>

        <WalletBalance address={address as `0x${string}`}></WalletBalance>
        <TokenInfo address={address as `0x${string}`}></TokenInfo>
        <Lottery address={address as `0x${string}`}></Lottery>
        <WalletAction></WalletAction>
        {/* <ApiData address={address as `0x${string}`}></ApiData> */}
        {/* <SelfDelegate address={address as `0x${string}`}></SelfDelegate> */}
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function WalletAction() {
  const [signatureMessage, setSignatureMessage] = useState("");
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage();
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing signatures</h2>
        <div className="form-control w-full max-w-xs my-4">
          <label className="label">
            <span className="label-text">Enter the message to be signed:</span>
          </label>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            value={signatureMessage}
            onChange={e => setSignatureMessage(e.target.value)}
          />
        </div>
        <button
          className="btn btn-active btn-neutral"
          disabled={isLoading}
          onClick={() =>
            signMessage({
              message: signatureMessage,
            })
          }
        >
          Sign message
        </button>
        {isSuccess && <div>Signature: {data}</div>}
        {isError && <div>Error signing message</div>}
      </div>
    </div>
  );
}

function WalletBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useBalance({
    address: params.address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Your Address</h2>
        <p> {params.address}</p>
        <h2 className="card-title">Your Balance</h2>
        Balance: {data?.formatted} {data?.symbol}
      </div>
    </div>
  );
}

interface TokenBalanceProps {
  address: `0x${string}`;
  token: `0x${string}`;
}

function TokenInfo(params: { address: `0x${string}` }) {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Lottery Token Contract info</h2>
        <TokenName address={LOTTERY_TOKEN_CONTRACT}></TokenName>
        <TokenSymbol address={LOTTERY_TOKEN_CONTRACT}></TokenSymbol>
        <TokenBalance address={params.address} token={LOTTERY_TOKEN_CONTRACT} />
        <PurchaseTokens address={params.address} />
        {/* <TokenBalance address={params.address} token={LOTTERY_TOKEN_CONTRACT}> */}
        {/* <TokenBalance address="0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"></TokenBalance> */}
      </div>
    </div>
  );
}

function Lottery(params: { address: `0x${string}` }) {
  const [betsOpen, setBetsOpen] = useState(false);

  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Lets play Lottery</h2>
        <h3 className="card-title">Lottery Contract Info</h3>
        <p>
          <b>Lottery contract address:</b> {LOTTERY_CONTRACT}
        </p>
        <LotteryPurchaseRatio></LotteryPurchaseRatio>
        <LotteryBetsClosingTime></LotteryBetsClosingTime>
        <LotteryOwnerPool></LotteryOwnerPool>
        <LotteryPrizePool></LotteryPrizePool>
        <LotteryBetFee></LotteryBetFee>
        <LotteryBetPrice></LotteryBetPrice>
        <Prize address={params.address}></Prize>

        <LotterybetsOpen setBetsOpen={setBetsOpen}></LotterybetsOpen>

        {/* Render based on betsOpen status */}
        {
          betsOpen ? (
            <p>
              <b>Bets are open!</b>
            </p>
          ) : (
            <OpenBets address={params.address} />
          ) // Assuming LOTTERY_TOKEN_CONTRACT is the same as params.address
        }
        {/* <Bet></Bet> */}
        <ApproveTokenTransfer></ApproveTokenTransfer>
        <BetMany></BetMany>
        <CloseLottery></CloseLottery>
        <OwnerWithdraw></OwnerWithdraw>
        <PrizeWithdraw></PrizeWithdraw>
        <ReturnTokens></ReturnTokens>

        {/* <OpenBets address={LOTTERY_TOKEN_CONTRACT}></OpenBets> */}
        {/* <TokenSymbol address={LOTTERY_TOKEN_CONTRACT}></TokenSymbol>
        <TokenBalance address={params.address} token={LOTTERY_TOKEN_CONTRACT} />
        <PurchaseTokens address={params.address} /> */}
        {/* <TokenBalance address={params.address} token={LOTTERY_TOKEN_CONTRACT}> */}
        {/* <TokenBalance address="0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"></TokenBalance> */}
      </div>
    </div>
  );
}

// Define an interface for the component props
interface LotterybetsOpenProps {
  setBetsOpen: (open: boolean) => void; // Function that takes a boolean and returns void
}

function LotterybetsOpen({ setBetsOpen }: LotterybetsOpenProps) {
  console.log("trying to get Purchase Ratio");
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "betsOpen",
  });

  useEffect(() => {
    if (typeof data === "boolean") {
      setBetsOpen(data);
    }
  }, [data, setBetsOpen]);

  // console.log("type of data = ", typeof data);
  // const LotterybetsOpen = typeof data === "boolean" ? data : false;

  if (isLoading) return <div>Fetching betsOpen.... </div>;
  if (isError) return <div>Error fetching betsOpen</div>;
  return (
    <div>
      <b>betsOpen:</b> {data.toString()}
    </div>
  );
}

function LotteryPurchaseRatio() {
  console.log("trying to get Purchase Ratio");
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "purchaseRatio",
  });
  console.log("type of data = ", typeof data);
  const purchaseRatio = typeof data === "bigint" ? (data as bigint) : 99n;
  const purchaseRatioString = purchaseRatio.toString();

  if (isLoading) return <div>Fetching purchaseRatio.... </div>;
  if (isError) return <div>Error fetching purchaseRatio</div>;
  return (
    <div>
      <b>purchaseRatio:</b> {purchaseRatio.toString()}
    </div>
  );
}

function LotteryBetPrice() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "betPrice",
  });
  console.log("type of data = ", typeof data);
  const betPrice = typeof data === "bigint" ? (data as bigint) : 99n;

  if (isLoading) return <div>Fetching betPrice.... </div>;
  if (isError) return <div>Error fetching betPrice</div>;
  return (
    <div>
      <b>Formatted betPrice:</b> {formatEther(betPrice)}
    </div>
  );
}

function LotteryBetFee() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "betFee",
  });
  console.log("type of data = ", typeof data);
  const betFee = typeof data === "bigint" ? (data as bigint) : 99n;
  console.log("formatted Bet fee = ", formatEther(betFee)); // betFee.toString()

  if (isLoading) return <div>Fetching betFee.... </div>;
  if (isError) return <div>Error fetching betFee</div>;
  return (
    <div>
      <b>Formatted betFee:</b> {formatEther(betFee)}
    </div>
  );
}

function LotteryPrizePool() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "prizePool",
  });
  console.log("type of data = ", typeof data);
  const prizePool = typeof data === "bigint" ? (data as bigint) : 99n;

  if (isLoading) return <div>Fetching prizePool.... </div>;
  if (isError) return <div>Error fetching prizePool</div>;
  return (
    <div>
      <b>prizePool:</b> {formatEther(prizePool)}
    </div>
  );
}

function LotteryOwnerPool() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "ownerPool",
  });
  console.log("type of data = ", typeof data);
  const ownerPool = typeof data === "bigint" ? (data as bigint) : 99n;

  if (isLoading) return <div>Fetching ownerPool.... </div>;
  if (isError) return <div>Error fetching ownerPool</div>;
  return (
    <div>
      <b>ownerPool:</b> {formatEther(ownerPool)}
    </div>
  );
}

function Prize(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "prize",
    args: [params.address],
  });
  console.log("type of data = ", typeof data);
  const prize = typeof data === "bigint" ? (data as bigint) : 99n;

  if (isLoading) return <div>Fetching Prize.... </div>;
  if (isError) return <div>Error fetching Prize</div>;
  if (prize > 0n) {
    return (
      <div>
        <b>Congrats!! Prize Amount:</b> {formatEther(prize)}
      </div>
    );
  } else {
    return (
      <div>
        <b> Prize Amount:</b> {formatEther(prize)}
      </div>
    );
  }
}

function LotteryBetsClosingTime() {
  console.log("trying to get Purchase Ratio");
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "betsClosingTime",
  });
  console.log("type of data = ", typeof data);
  const betsClosingTime = typeof data === "bigint" ? (data as bigint) : 0n;
  // Convert bigint to number, but check for safety if needed
  const betsClosingTimeNumber = betsClosingTime <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(betsClosingTime) : 0; // Default to 0 or handle error if out of safe range
  console.log("betsClosingTimeNumber = ", betsClosingTimeNumber);
  const betsClosingTime1000 = new Date(betsClosingTimeNumber * 1000); // put back the milliseconds
  console.log("betsClosingTime1000 = ", betsClosingTime1000);
  console.log("type of betsClosingTime1000 = ", typeof betsClosingTime1000);

  const month = betsClosingTime1000.getMonth() + 1; // getMonth() returns 0-11, so add 1 for 1-12
  const day = betsClosingTime1000.getDate(); // getDate() returns 1-31
  const year = betsClosingTime1000.getFullYear(); // getFullYear() returns the full year

  if (isLoading) return <div>Fetching betsClosingTime.... </div>;
  if (isError) return <div>Error fetching betsClosingTime</div>;
  return (
    <div>
      <b>betsClosingTime:</b> {betsClosingTime.toString()}
      <p>
        <b>deadline in date</b> - {betsClosingTime1000.toString()}
      </p>
    </div>
  );
}

function TokenName(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    // address: "0x37dBD10E7994AAcF6132cac7d33bcA899bd2C660",
    // address: "0xA7C36711208b0D6c2dC417fD6fA806746194256D", // MyToken
    // address: "0xD38d61ab91E134D01a6DbB48b0D2a0C181B4B936", // GOT Token
    // address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", // WETH
    // address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI address
    address: params.address,
    abi: abi,
    functionName: "name",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return (
    <div>
      <div>
        <b>Token Address:</b> {params.address}
      </div>
      <p></p>
      <div>
        <b>Token name:</b> {name}
      </div>
    </div>
  );
}

function TokenSymbol(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    // address: "0x37dBD10E7994AAcF6132cac7d33bcA899bd2C660",
    // address: "0xA7C36711208b0D6c2dC417fD6fA806746194256D", // MyToken
    // address: "0xD38d61ab91E134D01a6DbB48b0D2a0C181B4B936", // GOT Token
    // address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", // WETH
    // address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI address
    address: params.address,
    abi: abi,
    functionName: "symbol",
  });

  const symbolName = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return (
    <div>
      <b>Token Symbol:</b> {symbolName}
    </div>
  );
}

// function TokenBalance(params: { address: `0x${string}` }, token: { tokenAddress: `0x${string}` }) {
function TokenBalance({ address, token }: TokenBalanceProps) {
  const { data, isError, isLoading } = useContractRead({
    // address: "0x37dBD10E7994AAcF6132cac7d33bcA899bd2C660",
    // address: "0xA7C36711208b0D6c2dC417fD6fA806746194256D", // Mytoken
    // address: "0xD38d61ab91E134D01a6DbB48b0D2a0C181B4B936", // GOT Token
    // address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", // WETH address
    // address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI address
    address: token,
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [address],
    // args: ["0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"], // WETH
    // args: ["0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"], // UNI
    // args: ["0xA7C36711208b0D6c2dC417fD6fA806746194256D"], // My Token
    // args: ["0xD38d61ab91E134D01a6DbB48b0D2a0C181B4B936"], // GOT Token
    // account: "0xd8F68a7AeB7df4c349274e84B493451D6D3518b6",
    // args: ["0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"],
  });

  // const balance = typeof data === "number" ? data : 0; // did not work
  const balance = typeof data === "bigint" ? data : 0n; // Worked
  // const balance = {data?.formatted};
  const balString = balance.toString();
  const formattedBal = formatEther(balance);

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div>
      <p></p>
      <h3 className="card-title">Your Lottery Token Balance</h3>
      {/* Balance: {balance.toString()} and Data: {typeof data}{" "} */}
      {/* Balance: {balance.toString()} and Data: {typeof data} <br></br> */}
      Balance formatted : {formattedBal}
    </div>
  );
}

function PurchaseTokens(params: { address: `0x${string}` }) {
  const [amount, setAmount] = useState(0n);

  // Validate amount: Check if it's a non-empty, valid decimal number.
  const isValidAmount = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  const { config } = usePrepareContractWrite({
    // Your configuration here
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "purchaseTokens",
    args: [],
    value: amount,
  });
  // value: parseEther(amount || "0"),
  // value: BigInt(parseEther(amount).toString()), // Convert to Wei and ensure it's passed as a string

  // const { data: contractData, write } = useContractWrite(config);
  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  console.log("data = ", data, " write = ", write);
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <h3 className="card-title">Purchase Tokens </h3>
      <input
        type="text"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="input input-bordered w-full max-w-xs"
        placeholder="Enter amount in Wei"
      />
      <button
        className="btn btn-active btn-neutral  w-full max-w-xs"
        disabled={!write || isLoading}
        onClick={() => write()}
      >
        {isLoading ? "Purchasing..." : "Purchase Tokens "}
      </button>
      {isSuccess && (
        <div>
          Successfully Purchased!
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}

function OpenBets(params: { address: `0x${string}` }) {
  // const currentBlockTimeStamp = block.;

  const [timeStamp, setTimeStamp] = useState(0n);
  const dateNow = Date.now();
  const dateNowUTC = BigInt(Math.floor(dateNow / 1000) + 3600 * 8); // UTC 8 hrs ahead to PST.
  console.log("date now = ", Date.now());
  console.log("date now UTC = ", dateNowUTC);
  var deadline = dateNowUTC + 3600n * timeStamp;

  // Validate amount: Check if it's a non-empty, valid decimal number.
  // const isValidAmount = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  // Function to handle input changes and convert string back to BigInt safely
  const handleChange = e => {
    const value = e.target.value;
    try {
      // Convert the input string to a BigInt and store it
      setTimeStamp(BigInt(value));
      deadline = dateNowUTC + 3600n * timeStamp;
      console.log("Deadline is = ", deadline);
    } catch {
      // If conversion fails, reset to an initial safe value like '0'
      setTimeStamp(0n);
    }
  };

  const { config } = usePrepareContractWrite({
    // Your configuration here
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "openBets",
    args: [deadline],
  });
  // value: parseEther(amount || "0"),
  // value: BigInt(parseEther(amount).toString()), // Convert to Wei and ensure it's passed as a string

  // const { data: contractData, write } = useContractWrite(config);
  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  // console.log("data = ", data, write);
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <h3 className="card-title">Open Bet </h3>
      <p> Date now = {dateNow} </p>
      <p> Date now UTC = {dateNowUTC.toString()} </p>
      <p> Deadline = {deadline.toString()} </p>
      <input
        type="text"
        value={timeStamp.toString()} // Convert BigInt state to string for the input
        onChange={handleChange}
        className="input input-bordered w-full max-w-xs"
        placeholder="Enter Hours as deadline"
      />
      <button
        className="btn btn-active btn-neutral  w-full max-w-xs"
        disabled={!write || isLoading}
        onClick={() => write()}
      >
        {isLoading ? "opening bet..." : "Open Bet "}
      </button>
      {isSuccess && (
        <div>
          Successfully Opened Bet!
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}

function OwnerWithdraw() {
  const [bCount, setbCount] = useState(1n);

  // Validate amount: Check if it's a non-empty, valid integer.
  const isValidbCount = bCount && !isNaN(parseFloat(bCount)) && parseFloat(bCount) > 0;
  // const isValidbCount = bCount > 0n;

  const { config } = usePrepareContractWrite({
    // Your configuration here
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "ownerWithdraw",
    args: [bCount],
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  console.log("data = ", data, " write = ", write);
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <h3 className="card-title">ownerWithdraw </h3>
      <input
        type="text"
        value={bCount.toString()}
        onChange={e => {
          // Convert string back to BigInt safely
          try {
            const newCount = parseEther(e.target.value);
            setbCount(newCount);
            console.log("new count = ", newCount);
          } catch {
            // Handle invalid input (e.g., empty string or non-numeric input)
            if (e.target.value === "") {
              setbCount(1n); // Reset or handle as you see fit
            }
            // Optionally handle other errors, such as input that isn't numeric}
          }
        }}
        className="input input-bordered w-full max-w-xs"
        placeholder="Enter amount of ownerPool to withdraw"
      />
      <button
        className="btn btn-active btn-neutral  w-full max-w-xs"
        disabled={!write || isLoading || bCount === 0n}
        onClick={() => write()}
      >
        {isLoading ? "owner withdrawing..." : "OwnerWithdraw "}
      </button>
      {isSuccess && (
        <div>
          Successfully OwnerWithdraw!
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}

function PrizeWithdraw() {
  const [bCount, setbCount] = useState(1n);

  // Validate amount: Check if it's a non-empty, valid integer.
  const isValidbCount = bCount && !isNaN(parseFloat(bCount)) && parseFloat(bCount) > 0;
  // const isValidbCount = bCount > 0n;

  const { config } = usePrepareContractWrite({
    // Your configuration here
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "prizeWithdraw",
    args: [parseEther(bCount.toString())],
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  console.log("data = ", data, " write = ", write);
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <h3 className="card-title">prizeWithdraw </h3>
      <input
        type="text"
        value={bCount.toString()}
        onChange={e => {
          // Convert string back to BigInt safely
          try {
            const newCount = e.target.value;
            setbCount(BigInt(newCount));
            console.log("new count = ", newCount);
          } catch {
            // Handle invalid input (e.g., empty string or non-numeric input)
            if (e.target.value === "") {
              setbCount(1n); // Reset or handle as you see fit
            }
            // Optionally handle other errors, such as input that isn't numeric}
          }
        }}
        className="input input-bordered w-full max-w-xs"
        placeholder="Enter prize amount to Withdraw"
      />
      <button
        className="btn btn-active btn-neutral  w-full max-w-xs"
        disabled={!write || isLoading || bCount === 0n}
        onClick={() => write()}
      >
        {isLoading ? "prize withdrawing..." : "prizeWithdraw "}
      </button>
      {isSuccess && (
        <div>
          Successful prizeWithdraw!
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}

function ReturnTokens() {
  const [bCount, setbCount] = useState(1n);

  // Validate amount: Check if it's a non-empty, valid integer.
  const isValidbCount = bCount && !isNaN(parseFloat(bCount)) && parseFloat(bCount) > 0;
  // const isValidbCount = bCount > 0n;

  const { config } = usePrepareContractWrite({
    // Your configuration here
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "returnTokens",
    args: [parseEther(bCount.toString())],
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  console.log("data = ", data, " write = ", write);
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <h3 className="card-title">returnTokens </h3>
      <input
        type="text"
        value={bCount.toString()}
        onChange={e => {
          // Convert string back to BigInt safely
          try {
            const newCount = e.target.value;
            setbCount(BigInt(newCount));
            console.log("new count = ", newCount);
          } catch {
            // Handle invalid input (e.g., empty string or non-numeric input)
            if (e.target.value === "") {
              setbCount(1n); // Reset or handle as you see fit
            }
            // Optionally handle other errors, such as input that isn't numeric}
          }
        }}
        className="input input-bordered w-full max-w-xs"
        placeholder="Enter token amount to return in ETH"
      />
      <button
        className="btn btn-active btn-neutral  w-full max-w-xs"
        disabled={!write || isLoading || bCount === 0n}
        onClick={() => write()}
      >
        {isLoading ? "returning tokens ..." : "returnTokens "}
      </button>
      {isSuccess && (
        <div>
          Successful returnTokens!
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}

function BetMany() {
  const [bCount, setbCount] = useState(1n);

  // Validate amount: Check if it's a non-empty, valid integer.
  const isValidbCount = bCount && !isNaN(parseFloat(bCount)) && parseFloat(bCount) > 0;
  // const isValidbCount = bCount > 0n;

  const { config } = usePrepareContractWrite({
    // Your configuration here
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "betMany",
    args: [bCount],
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  console.log("data = ", data, " write = ", write);
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <h3 className="card-title">Bet times </h3>
      <input
        type="text"
        value={bCount.toString()}
        onChange={e => {
          // Convert string back to BigInt safely
          try {
            const newCount = BigInt(e.target.value);
            setbCount(newCount);
            console.log("new count = ", newCount);
          } catch {
            // Handle invalid input (e.g., empty string or non-numeric input)
            if (e.target.value === "") {
              setbCount(1n); // Reset or handle as you see fit
            }
            // Optionally handle other errors, such as input that isn't numeric}
          }
        }}
        className="input input-bordered w-full max-w-xs"
        placeholder="Enter Times to Bet"
      />
      <button
        className="btn btn-active btn-neutral  w-full max-w-xs"
        disabled={!write || isLoading || bCount === 0n}
        onClick={() => write()}
      >
        {isLoading ? "Betting..." : "Bet Times "}
      </button>
      {isSuccess && (
        <div>
          Successfully placed your bets!
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}

// This will not execute so commented it out - as its not EXTERNAL function in solidity contract
function CloseLottery() {
  const { config } = usePrepareContractWrite({
    // Your configuration here
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "closeLottery",
    args: [],
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <h3 className="card-title">Close Lottery</h3>
      <button
        className="btn btn-active btn-neutral  w-full max-w-xs"
        disabled={!write || isLoading}
        onClick={() => write()}
      >
        {isLoading ? "closing lottery ..." : "Close Lottery"}
      </button>
      {isSuccess && (
        <div>
          Successfully Closed Lottery!
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}

// This will not execute so commented it out - as its not EXTERNAL function in solidity contract
function Bet() {
  const { config } = usePrepareContractWrite({
    // Your configuration here
    address: LOTTERY_CONTRACT,
    abi: abiL,
    functionName: "bet",
    args: [],
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <h3 className="card-title">Bet Once</h3>
      <button
        className="btn btn-active btn-neutral  w-full max-w-xs"
        disabled={!write || isLoading}
        onClick={() => write()}
      >
        {isLoading ? "betting once ..." : "Bet Once"}
      </button>
      {isSuccess && (
        <div>
          Successfully Bet once!
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}

function ApproveTokenTransfer() {
  const [bCount, setbCount] = useState(1n);

  // Validate amount: Check if it's a non-empty, valid integer.
  const isValidbCount = bCount && !isNaN(parseFloat(bCount)) && parseFloat(bCount) > 0;
  // const isValidbCount = bCount > 0n;

  const { config } = usePrepareContractWrite({
    // Your configuration here
    address: LOTTERY_TOKEN_CONTRACT,
    abi: abi,
    functionName: "approve",
    args: [LOTTERY_CONTRACT, bCount],
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  console.log("data = ", data, " write = ", write);
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <h3 className="card-title">Approve tokens for Lottery betting </h3>
      <input
        type="text"
        value={bCount.toString()}
        onChange={e => {
          // Convert string back to BigInt safely
          try {
            const newCount = BigInt(e.target.value);
            setbCount(newCount);
            console.log("new count = ", newCount);
          } catch {
            // Handle invalid input (e.g., empty string or non-numeric input)
            if (e.target.value === "") {
              setbCount(1n); // Reset or handle as you see fit
            }
            // Optionally handle other errors, such as input that isn't numeric}
          }
        }}
        className="input input-bordered w-full max-w-xs"
        placeholder="Enter # of Tokens to approve"
      />
      <button
        className="btn btn-active btn-neutral  w-full max-w-xs"
        disabled={!write || isLoading || bCount === 0n}
        onClick={() => write()}
      >
        {isLoading ? "approving..." : "Approve Tokens "}
      </button>
      {isSuccess && (
        <div>
          Successfully Approved tokens for Lottery!
          <div>
            <a href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
