const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TrustLedgerAudit contract with deployer:", deployer.address);

  const TrustLedgerAudit = await ethers.getContractFactory("TrustLedgerAudit");
  const contract = await TrustLedgerAudit.deploy(deployer.address);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("TrustLedgerAudit deployed to:", contractAddress);

  // Grant AI_ROLE and APPROVER_ROLE to deployer so single local node / demo account works out-of-the-box
  const AI_ROLE = await contract.AI_ROLE();
  const APPROVER_ROLE = await contract.APPROVER_ROLE();
  
  await contract.grantRole(AI_ROLE, deployer.address);
  await contract.grantRole(APPROVER_ROLE, deployer.address);

  // Read Contract Artifact ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/TrustLedgerAudit.sol/TrustLedgerAudit.json");
  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifactJson = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    abi = artifactJson.abi;
  }

  const configData = {
    contractAddress: contractAddress,
    network: "polygonAmoy",
    chainId: 80002,
    deployerAddress: deployer.address,
    abi: abi
  };

  // Save to backend/config
  const backendConfigDir = path.join(__dirname, "../backend/config");
  if (!fs.existsSync(backendConfigDir)) {
    fs.mkdirSync(backendConfigDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(backendConfigDir, "contractAddress.json"),
    JSON.stringify(configData, null, 2)
  );

  // Save to frontend/src/config
  const frontendConfigDir = path.join(__dirname, "../frontend/src/config");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(frontendConfigDir, "contractAddress.json"),
    JSON.stringify(configData, null, 2)
  );

  console.log("Contract configuration saved to backend and frontend config directories.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
