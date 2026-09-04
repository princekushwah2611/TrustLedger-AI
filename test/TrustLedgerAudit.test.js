const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrustLedgerAudit Contract v2.1", function () {
  let contract;
  let admin, aiAccount, approver1, approver2, approver3, unauthorized;
  let AI_ROLE, APPROVER_ROLE;

  beforeEach(async function () {
    [admin, aiAccount, approver1, approver2, approver3, unauthorized] = await ethers.getSigners();

    const TrustLedgerAudit = await ethers.getContractFactory("TrustLedgerAudit");
    contract = await TrustLedgerAudit.deploy(admin.address);
    await contract.waitForDeployment();

    AI_ROLE = await contract.AI_ROLE();
    APPROVER_ROLE = await contract.APPROVER_ROLE();

    // Grant roles
    await contract.grantRole(AI_ROLE, aiAccount.address);
    await contract.grantRole(APPROVER_ROLE, approver1.address);
    await contract.grantRole(APPROVER_ROLE, approver2.address);
    await contract.grantRole(APPROVER_ROLE, approver3.address);
  });

  it("1. Deploys correctly and grants DEFAULT_ADMIN_ROLE to admin", async function () {
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.equal(true);
  });

  it("2. AI_ROLE account can log a new entry; non-AI account cannot", async function () {
    const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes("Test reasoning string"));
    
    await expect(contract.connect(aiAccount).logTransaction(101, "Medium", reasoningHash))
      .to.emit(contract, "TransactionLogged")
      .withArgs(101, "Medium", reasoningHash);

    await expect(
      contract.connect(unauthorized).logTransaction(102, "Medium", reasoningHash)
    ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
  });

  it("3. Duplicate txId logging reverts with 'Already logged'", async function () {
    const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes("Test reasoning string"));
    await contract.connect(aiAccount).logTransaction(101, "Medium", reasoningHash);

    await expect(
      contract.connect(aiAccount).logTransaction(101, "Medium", reasoningHash)
    ).to.be.revertedWith("Already logged");
  });

  it("4. Low risk auto-approves on logging", async function () {
    const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes("Low risk description"));
    await contract.connect(aiAccount).logTransaction(101, "Low", reasoningHash);

    const entry = await contract.getEntry(101);
    expect(entry.approved).to.equal(true);
    expect(entry.riskLevel).to.equal("Low");
  });

  it("5. Medium risk requires exactly 1 approval to flip approved = true", async function () {
    const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes("Medium risk description"));
    await contract.connect(aiAccount).logTransaction(101, "Medium", reasoningHash);

    let entry = await contract.getEntry(101);
    expect(entry.approved).to.equal(false);

    await expect(contract.connect(approver1).approveTransaction(101))
      .to.emit(contract, "TransactionApproved")
      .withArgs(101, approver1.address, 1);

    entry = await contract.getEntry(101);
    expect(entry.approved).to.equal(true);
  });

  it("6. High risk requires 2 distinct approver addresses; duplicate vote reverts", async function () {
    const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes("High risk description"));
    await contract.connect(aiAccount).logTransaction(101, "High", reasoningHash);

    await contract.connect(approver1).approveTransaction(101);
    
    await expect(
      contract.connect(approver1).approveTransaction(101)
    ).to.be.revertedWith("Already approved by you");

    await contract.connect(approver2).approveTransaction(101);
    const entry = await contract.getEntry(101);
    expect(entry.approved).to.equal(true);
  });

  it("7. Vendor trust score initializes at 100 and updates on High/Medium risk", async function () {
    const vendorHash = ethers.keccak256(ethers.toUtf8Bytes("Nova Traders"));
    expect(await contract.getVendorScore("Nova Traders")).to.equal(100);

    // AI deducts points for High risk (-15)
    await contract.connect(aiAccount).updateVendorScore(vendorHash, "High");
    expect(await contract.getVendorScore("Nova Traders")).to.equal(85);

    // AI deducts points for Medium risk (-5)
    await contract.connect(aiAccount).updateVendorScore(vendorHash, "Medium");
    expect(await contract.getVendorScore("Nova Traders")).to.equal(80);
  });

  it("8. Human Dispute & Override logs an additive record on-chain without modifying original entry", async function () {
    const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes("Initial High Risk"));
    await contract.connect(aiAccount).logTransaction(112, "High", reasoningHash);

    const overrideReasonHash = ethers.keccak256(ethers.toUtf8Bytes("Verified emergency executive override"));
    
    // Approver 1 proposes override
    await contract.connect(approver1).proposeOverride(901, 112, "Low", overrideReasonHash);
    
    // Approver 1 approves override (1/2)
    await contract.connect(approver1).approveOverride(901);
    let overrideObj = await contract.overrides(901);
    expect(overrideObj.finalized).to.equal(false);

    // Approver 2 approves override (2/2) -> finalized = true
    await contract.connect(approver2).approveOverride(901);
    overrideObj = await contract.overrides(901);
    expect(overrideObj.finalized).to.equal(true);

    // Original AuditEntry is preserved unchanged (immutability check)
    const originalEntry = await contract.getEntry(112);
    expect(originalEntry.riskLevel).to.equal("High");
  });
});
