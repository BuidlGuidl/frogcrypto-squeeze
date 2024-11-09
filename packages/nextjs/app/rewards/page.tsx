"use client";

import { useAccount } from "wagmi";
import { ConnectButtonLayout } from "~~/components/ConnectButtonLayout";
import { TokensBalances } from "~~/components/TokensBalances";

const Rewards = () => {
  const { isConnected } = useAccount();

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/priest.jpg')`,
      }}
    >
      {!isConnected && <ConnectButtonLayout />}
      {isConnected && (
        <div
          className="relative flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/priest.jpg')`,
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 card w-full bg-base-200 rounded-none">
            <div className="p-2">
              <TokensBalances />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Rewards;
