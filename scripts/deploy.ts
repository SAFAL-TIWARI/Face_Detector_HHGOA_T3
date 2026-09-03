import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=================================================");
  console.log("TRACE // GOA — Smart Contract Deployment");
  console.log("=================================================");

  const [deployer] = await (hre as any).ethers.getSigners();
  console.log(`Deploying EvidenceRegistry with account: ${deployer.address}`);

  const balance = await (hre as any).ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${(hre as any).ethers.formatEther(balance)} ETH`);

  const EvidenceRegistry = await (hre as any).ethers.getContractFactory("EvidenceRegistry");
  const registry = await EvidenceRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log(`✓ EvidenceRegistry deployed successfully to: ${contractAddress}`);

  const deploymentInfo = {
    contractAddress,
    network: hre.network.name,
    chainId: (await (hre as any).ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const outputDir = path.resolve("./src/shared/config");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`✓ Deployment details written to src/shared/config/deployment.json`);
  console.log("=================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
