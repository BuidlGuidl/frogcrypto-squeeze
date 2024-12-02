import { useTokenContractInfo } from "~~/hooks/useTokenContractInfo";
import { JuiceImage } from "./JuiceImage";
import { TTokenInfo } from "~~/types/frog";
import { ContractName } from "~~/utils/scaffold-eth/contract";

export const JuiceSlot = ({ balance = "0", token }: { balance?: string; token: TTokenInfo }) => {
  const { data } = useTokenContractInfo(`FrogCrypto${token.attribute}TokenV2` as ContractName);

  return (
    <a href={`https://abi.ninja/${data?.address}/8453?methods=balanceOf`} target="_blank">
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <JuiceImage className="w-20 h-20" name={token.name} symbol={token.symbol} />
          <span className="absolute top-1 right-1 text-xs text-white font-semibold [text-shadow:_1px_1px_0_rgb(0_0_0_/_40%)]">
            {balance}
          </span>
        </div>
        <p className="m-0 font-lindenHill tracking-wide text-lg text-gray-50">{token.name}</p>
      </div>
    </a>
  );
};
