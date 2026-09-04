// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TrustLedgerAudit (v2.1 Master)
 * @author Prince Singh Kushwah
 * @notice Immutable blockchain audit log, vendor trust scores, and auditable human override logs for AI financial verdicts.
 */
contract TrustLedgerAudit is AccessControl {
    bytes32 public constant AI_ROLE = keccak256("AI_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    struct AuditEntry {
        uint256 txId;
        string  riskLevel;       // "Low", "Medium", "High"
        bytes32 reasoningHash;   // keccak256 hash of off-chain AI reasoning text
        address flaggedBy;
        bool    approved;
        uint8   approvalCount;
        uint256 timestamp;
    }

    // ---------- Vendor Trust Score Data Model (v2.1) ----------
    mapping(bytes32 => uint8) public vendorScore; // 0..100, default 0 is treated as 100

    // ---------- Auditable Human Override Data Model (v2.1) ----------
    struct OverrideEntry {
        uint256 originalTxId;
        string  newRiskLevel;
        bytes32 reasonHash;
        uint8   approvalCount;
        bool    finalized;
    }

    mapping(uint256 => AuditEntry) public auditLog;
    mapping(uint256 => mapping(address => bool)) public hasApproved;

    mapping(uint256 => OverrideEntry) public overrides; // keyed by overrideId
    mapping(uint256 => mapping(address => bool)) public hasApprovedOverride;

    event TransactionLogged(uint256 indexed txId, string riskLevel, bytes32 reasoningHash);
    event TransactionApproved(uint256 indexed txId, address approver, uint8 approvalCount);
    event VendorScoreUpdated(bytes32 indexed vendorHash, uint8 newScore);
    event OverrideProposed(uint256 indexed overrideId, uint256 indexed originalTxId, string newRiskLevel);
    event OverrideFinalized(uint256 indexed overrideId, uint256 indexed originalTxId);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AI_ROLE, admin);
        _grantRole(APPROVER_ROLE, admin);
    }

    /**
     * @notice Logs an AI risk verdict on-chain and auto-updates vendor trust score.
     */
    function logTransaction(
        uint256 txId,
        string memory riskLevel,
        bytes32 reasoningHash
    ) external onlyRole(AI_ROLE) {
        require(auditLog[txId].timestamp == 0, "Already logged");
        
        bool autoApprove = keccak256(bytes(riskLevel)) == keccak256(bytes("Low"));
        
        auditLog[txId] = AuditEntry({
            txId: txId,
            riskLevel: riskLevel,
            reasoningHash: reasoningHash,
            flaggedBy: msg.sender,
            approved: autoApprove,
            approvalCount: 0,
            timestamp: block.timestamp
        });

        emit TransactionLogged(txId, riskLevel, reasoningHash);
    }

    /**
     * @notice Approves a pending transaction entry.
     */
    function approveTransaction(uint256 txId) external onlyRole(APPROVER_ROLE) {
        require(auditLog[txId].timestamp != 0, "Not logged");
        require(!auditLog[txId].approved, "Already approved");
        require(!hasApproved[txId][msg.sender], "Already approved by you");

        hasApproved[txId][msg.sender] = true;
        auditLog[txId].approvalCount += 1;

        uint8 required = requiredApprovals(auditLog[txId].riskLevel);
        if (auditLog[txId].approvalCount >= required) {
            auditLog[txId].approved = true;
        }

        emit TransactionApproved(txId, msg.sender, auditLog[txId].approvalCount);
    }

    /**
     * @notice Updates vendor trust score on-chain (0-100 scale).
     */
    function updateVendorScore(bytes32 vendorHash, string memory riskLevel) external onlyRole(AI_ROLE) {
        uint8 current = vendorScore[vendorHash] == 0 ? 100 : vendorScore[vendorHash];
        bytes32 riskHash = keccak256(bytes(riskLevel));

        if (riskHash == keccak256(bytes("High"))) {
            current = current > 15 ? current - 15 : 0;
        } else if (riskHash == keccak256(bytes("Medium"))) {
            current = current > 5 ? current - 5 : 0;
        } else if (current < 100) {
            current += 1;
        }

        vendorScore[vendorHash] = current;
        emit VendorScoreUpdated(vendorHash, current);
    }

    function getVendorScore(string memory vendorName) public view returns (uint8) {
        bytes32 vHash = keccak256(bytes(vendorName));
        uint8 score = vendorScore[vHash];
        return score == 0 ? 100 : score;
    }

    /**
     * @notice Proposes a human dispute/override on a transaction verdict (creates additive record).
     */
    function proposeOverride(
        uint256 overrideId,
        uint256 originalTxId,
        string memory newRiskLevel,
        bytes32 reasonHash
    ) external onlyRole(APPROVER_ROLE) {
        require(auditLog[originalTxId].timestamp != 0, "Original entry not found");
        require(overrides[overrideId].originalTxId == 0, "Override ID exists");

        overrides[overrideId] = OverrideEntry({
            originalTxId: originalTxId,
            newRiskLevel: newRiskLevel,
            reasonHash: reasonHash,
            approvalCount: 0,
            finalized: false
        });

        emit OverrideProposed(overrideId, originalTxId, newRiskLevel);
    }

    /**
     * @notice Approves a proposed override.
     */
    function approveOverride(uint256 overrideId) external onlyRole(APPROVER_ROLE) {
        require(overrides[overrideId].originalTxId != 0, "Override not found");
        require(!overrides[overrideId].finalized, "Override already finalized");
        require(!hasApprovedOverride[overrideId][msg.sender], "Already approved by you");

        hasApprovedOverride[overrideId][msg.sender] = true;
        overrides[overrideId].approvalCount += 1;

        uint256 originalTxId = overrides[overrideId].originalTxId;
        uint8 required = requiredApprovals(auditLog[originalTxId].riskLevel);

        if (overrides[overrideId].approvalCount >= required) {
            overrides[overrideId].finalized = true;
            emit OverrideFinalized(overrideId, originalTxId);
        }
    }

    /**
     * @notice Returns required number of approvals based on risk level.
     */
    function requiredApprovals(string memory riskLevel) public pure returns (uint8) {
        bytes32 riskHash = keccak256(bytes(riskLevel));
        if (riskHash == keccak256(bytes("High"))) return 2;
        if (riskHash == keccak256(bytes("Medium"))) return 1;
        return 0;
    }

    /**
     * @notice Returns audit entry details for a transaction.
     */
    function getEntry(uint256 txId) external view returns (AuditEntry memory) {
        return auditLog[txId];
    }
}
