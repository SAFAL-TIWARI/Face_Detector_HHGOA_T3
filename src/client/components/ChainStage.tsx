import React from "react";
import { CheckCircle2 } from "lucide-react";
import { BlockchainRecord } from "../../shared/types/evidence";

interface ChainStageProps {
  blockchainRecord: BlockchainRecord | null;
}

export const ChainStage: React.FC<ChainStageProps> = ({ blockchainRecord }) => {
  if (!blockchainRecord) {
    return (
      <div className="bg-goa-green-dark border-2 border-goa-cream/20 p-6 rounded-sm text-center">
        <span className="editorial-tag text-goa-cream/60 border-goa-cream/30">
          STAGE 06 // BLOCKCHAIN ANCHOR
        </span>
        <p className="text-sm font-mono text-goa-cream/60 mt-3">
          Awaiting evidence fingerprint for on-chain transaction...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-goa-cream text-goa-black p-6 rounded-sm border-2 border-goa-black shadow-brutal">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b-2 border-goa-black pb-4 mb-6">
        <div>
          <span className="editorial-tag text-goa-yellow border-goa-yellow bg-goa-yellow/20 font-bold">
            STAGE 06 // HARDHAT EVM
          </span>
          <h2 className="font-editorial text-2xl font-extrabold mt-1 text-goa-black">
            Immutable Blockchain Anchor
          </h2>
          <p className="text-xs font-sans text-goa-black/70">
            Smart contract: <code className="font-bold">EvidenceRegistry.sol</code> on local Hardhat network.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-sm flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            TX CONFIRMED (BLOCK #{blockchainRecord.blockNumber})
          </span>
        </div>
      </div>

      {/* Blockchain Ledger Receipt Card */}
      <div className="bg-goa-cream-light border-2 border-goa-black p-5 rounded-sm space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-sm border border-goa-black/15">
            <span className="text-[10px] text-goa-black/50 uppercase block">TRANSACTION HASH</span>
            <span className="font-bold text-goa-black break-all">
              {blockchainRecord.transactionHash}
            </span>
          </div>

          <div className="bg-white p-3 rounded-sm border border-goa-black/15">
            <span className="text-[10px] text-goa-black/50 uppercase block">CONTRACT ADDRESS</span>
            <span className="font-bold text-goa-black break-all">
              {blockchainRecord.contractAddress}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-goa-black/15">
          <div className="bg-white p-2 rounded-sm border border-goa-black/10">
            <span className="text-[10px] text-goa-black/50 uppercase block">BLOCK</span>
            <span className="font-bold">#{blockchainRecord.blockNumber}</span>
          </div>

          <div className="bg-white p-2 rounded-sm border border-goa-black/10">
            <span className="text-[10px] text-goa-black/50 uppercase block">GAS USED</span>
            <span className="font-bold">{blockchainRecord.gasUsed}</span>
          </div>

          <div className="bg-white p-2 rounded-sm border border-goa-black/10">
            <span className="text-[10px] text-goa-black/50 uppercase block">SOURCE DOMAIN</span>
            <span className="font-bold">{blockchainRecord.sourceDomain}</span>
          </div>

          <div className="bg-white p-2 rounded-sm border border-goa-black/10">
            <span className="text-[10px] text-goa-black/50 uppercase block">CHAIN ID</span>
            <span className="font-bold">{blockchainRecord.chainId} (Local)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
