"use client";

import { useState } from "react";
import { FrogSpec } from "@frogcrypto/shared";
import { ParcnetAPI, Zapp, connect } from "@parcnet-js/app-connector";
import { gpcPreVerify } from "@pcd/gpc";
import { ProtoPODGPC } from "@pcd/gpcircuits";
import { POD, PODEntries } from "@pcd/pod";
import clsx from "clsx";
import { PartialDeep } from "type-fest";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectButtonLayout } from "~~/components/ConnectButtonLayout";
import { TokensRewards } from "~~/components/TokensRewards";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { SqueezeReward } from "~~/types/frog";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";

export interface PODData {
  entries: PODEntries;
  signature: string;
  signerPublicKey: string;
}

export function podToPODData(pod: POD): PODData {
  return {
    entries: pod.content.asEntries(),
    signature: pod.signature,
    signerPublicKey: pod.signerPublicKey,
  };
}

type ForgCryptToType = PartialDeep<typeof FrogSpec.schema>;

const entriesToProve: ForgCryptToType = {
  beauty: {
    type: "int",
  },
  jump: {
    type: "int",
  },
  speed: {
    type: "int",
  },
  frogId: {
    type: "int",
  },
  name: {
    type: "string",
  },
  biome: {
    type: "int",
  },
  owner: {
    type: "cryptographic",
  },
  intelligence: {
    type: "int",
  },
  rarity: {
    type: "int",
  },
  description: {
    type: "string",
  },
  temperament: {
    type: "int",
  },
};

// TODO: Remove console logs
const myZapp: Zapp = {
  name: "Frog Bank",
  permissions: {
    READ_POD: { collections: ["FrogCrypto"] },
    REQUEST_PROOF: { collections: ["FrogCrypto"] },
  },
};

const Home = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [z, setZ] = useState<ParcnetAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const [squeezedFrogName, setSqueezedFrogName] = useState<string | null>(null);
  const [squeezeReward, setSqueezeReward] = useState<SqueezeReward | null>(null);

  const { signMessageAsync } = useSignMessage();

  const handleAuth = async () => {
    try {
      if (!connectedAddress) return notification.error("Please connect your address");

      const element = document.getElementById("zpass-app-connector") as HTMLElement;

      if (!element) {
        console.log("Unable to find app connector element");
        notification.error("Oops! Something went wrong");
        return;
      }

      console.log("The element was found", element);
      const clientUrl = "https://zupass.org";

      setIsLoading(true);
      const zCon = await connect(myZapp, element, clientUrl);
      setZ(zCon);
      setIsLoading(false);

      notification.success("Authentication successful!");
    } catch (e) {
      console.log("error", e);
      setIsLoading(false);
      notification.error("Authentication failed");
    }
  };

  const handleSqueeze = async () => {
    try {
      if (!z) return notification.error("Please authenticate first");
      setIsLoading(true);
      setStory(null); // Reset story when starting new squeeze

      const result = await z.gpc.prove({
        request: {
          pods: {
            FROGCRYPTO: {
              pod: {
                entries: entriesToProve,
                meta: {
                  labelEntry: "name",
                },
              },
              revealed: {
                beauty: true,
                jump: true,
                speed: true,
                frogId: true,
                name: true,
                biome: true,
                owner: true,
                intelligence: true,
                rarity: true,
                description: true,
                temperament: true,
              },
            },
          },
        },
      });

      if (result.success) {
        const boundConfig = result.boundConfig;
        const revealedClaims = result.revealedClaims;
        const circuit = gpcPreVerify(boundConfig, revealedClaims);
        const pubSignals = ProtoPODGPC.makePublicSignals(circuit.circuitPublicInputs, circuit.circuitOutputs);

        const frogStats = revealedClaims.pods.FROGCRYPTO?.entries;
        const frogName = frogStats?.name.value;

        const beauty = frogStats?.beauty.value as any as bigint;
        const biome = frogStats?.biome.value as any as bigint;
        const intelligence = frogStats?.intelligence.value as any as bigint;
        const jump = frogStats?.jump.value as any as bigint;
        const speed = frogStats?.speed.value as any as bigint;
        const rarity = frogStats?.rarity.value as any as bigint;
        const owner = frogStats?.owner.value as any as bigint;
        const description = frogStats?.description.value as any as string;
        const temperament = frogStats?.temperament.value as any as bigint;
        const frogId = frogStats?.frogId.value as any as bigint;

        notification.info("Squeezing your Frog...");
        const timestamp = Date.now();
        const signature = await signMessageAsync({
          message: `You are signing that you own ${frogName} at timestamp ${timestamp} on https://frogcrypto-squeeze.com`,
        });

        const reversedPiB: [any[], any[]] = [
          result.proof.pi_b[0]?.slice().reverse() || [],
          result.proof.pi_b[1]?.slice().reverse() || [],
        ];

        // Send data to backend
        const response = await fetch("/api/squeeze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              proof: {
                pi_a: result.proof.pi_a.slice(0, -1),
                pi_b: reversedPiB,
                pi_c: result.proof.pi_c.slice(0, -1),
                pubSignals: pubSignals,
              },
              frogStats: {
                beauty: beauty.toString(),
                biome: biome.toString(),
                intelligence: intelligence.toString(),
                jump: jump.toString(),
                speed: speed.toString(),
                rarity: rarity.toString(),
                owner: owner.toString(),
                name: frogName,
                description,
                temperament: temperament.toString(),
                frogId: frogId.toString(),
              },
              signature,
              address: connectedAddress,
              timestamp,
            },
            replacer,
          ),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        console.log("The data is", data);
        setStory(data.story);
        setSqueezedFrogName(frogName as string);
        setSqueezeReward(data.rewards);
        notification.success(`Successfully squeezed Frog: ${frogName}`);
      }
    } catch (e) {
      const errorMessage = getParsedError(e);
      notification.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  let backgroundImageUrl = "/priest.jpg";

  if (isConnected && !z) {
    backgroundImageUrl = "/priest-open.jpg";
  }

  if (isConnected && z) {
    backgroundImageUrl = "/priest-open-frog-open.jpg";
  }

  if (isConnected && z && isLoading) {
    backgroundImageUrl = "/priest-squeeze.jpg";
  }

  if (isConnected && story && squeezedFrogName && squeezeReward) {
    backgroundImageUrl = "/priest-squeeze.jpg";
  }

  const hasSqueezed = story && squeezedFrogName && squeezeReward;

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/priest.jpg')`,
      }}
    >
      {!isConnected && !hasSqueezed && <ConnectButtonLayout />}
      {isConnected && !hasSqueezed && (
        <div
          className="relative flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImageUrl}')`,
          }}
        >
          <div
            className={clsx("flex flex-col", {
              "gap-4 mt-[23rem]": !z,
            })}
          >
            {!z && (
              <>
                <button onClick={handleAuth} className="btn btn-neutral" disabled={isLoading}>
                  {!isLoading && "Connect Zupass"}
                  {isLoading && (
                    <>
                      <span className="loading loading-spinner"></span> Connecting...
                    </>
                  )}
                </button>
                <RainbowKitCustomConnectButton />
              </>
            )}
            {z && (
              <button
                onClick={handleSqueeze}
                className={clsx("btn btn-neutral", {
                  "mt-[23rem]": !isLoading,
                  "mt-[7rem]": isLoading,
                })}
                disabled={isLoading}
              >
                {isLoading && (
                  <>
                    <span className="loading loading-spinner"></span> Squeezing...
                  </>
                )}
                {!isLoading && "Squeeze Frog"}
              </button>
            )}
          </div>
        </div>
      )}
      {isConnected && hasSqueezed && (
        <div>
          <div className="flex flex-col justify-between items-center min-h-screen">
            <div className="card w-full bg-base-200/50 rounded-none">
              <div className="card-body py-4 px-5">
                <h2 className="card-title m-0 text-xl font-lindenHill tracking-wide text-gray-800">
                  The Tale of {squeezedFrogName}
                </h2>
                <p className="m-0 text-sm italic leading-relaxed">&quot;{story}&quot;</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 pb-6">
              <div>
                <button onClick={handleSqueeze} className="btn btn-neutral w-full" disabled={isLoading}>
                  {isLoading && (
                    <>
                      <span className="loading loading-spinner"></span> Squeezing...
                    </>
                  )}
                  {!isLoading && "Squeeze Another Frog"}
                </button>
                <p className="mb-0 mt-1 text-white text-xs text-center bg-black/60 p-1 rounded-md">
                  You may only squeeze a frog once per day
                </p>
              </div>
              <TokensRewards rewards={squeezeReward} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
