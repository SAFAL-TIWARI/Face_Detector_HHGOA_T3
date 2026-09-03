// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title EvidenceRegistry
 * @notice Stores and verifies cryptographic fingerprints (SHA-256) of public web/social evidence
 *         discovered during visual reverse-search verification pipelines.
 * @dev Designed for TRACE // GOA (Hacker House Goa 2026 Shortlisting Task 3).
 *      NEVER stores raw biometric vectors, face descriptors, or personal identities.
 *      Only immutable cryptographic evidence hashes and verification metadata are stored on-chain.
 */
contract EvidenceRegistry {
    struct VerificationRecord {
        bytes32 evidenceHash;
        uint256 timestamp;
        string sourceDomain;
        address recorder;
        bool exists;
    }

    // Mapping from canonical evidence SHA-256 hash to verification record
    mapping(bytes32 => VerificationRecord) private _records;

    // Total counter of recorded evidence items
    uint256 public totalRecordsCount;

    // Emitted when a new evidence fingerprint is anchored to the blockchain
    event EvidenceRecorded(
        bytes32 indexed evidenceHash,
        string sourceDomain,
        uint256 timestamp,
        address indexed recorder
    );

    // Custom errors
    error InvalidEvidenceHash();
    error EvidenceAlreadyRecorded(bytes32 evidenceHash, uint256 existingTimestamp);

    /**
     * @notice Records an evidence hash on-chain with its source domain
     * @param evidenceHash The 32-byte SHA-256 fingerprint of the normalized evidence payload
     * @param sourceDomain The public domain from which evidence was discovered (e.g., "x.com", "github.com")
     * @return success True if record was stored or already exists
     */
    function recordEvidence(
        bytes32 evidenceHash,
        string calldata sourceDomain
    ) external returns (bool success) {
        if (evidenceHash == bytes32(0)) {
            revert InvalidEvidenceHash();
        }

        if (!_records[evidenceHash].exists) {
            _records[evidenceHash] = VerificationRecord({
                evidenceHash: evidenceHash,
                timestamp: block.timestamp,
                sourceDomain: sourceDomain,
                recorder: msg.sender,
                exists: true
            });
            totalRecordsCount += 1;

            emit EvidenceRecorded(
                evidenceHash,
                sourceDomain,
                block.timestamp,
                msg.sender
            );
        }

        return true;
    }

    /**
     * @notice Verifies whether a given evidence hash has an uncompromised on-chain record
     * @param evidenceHash The 32-byte SHA-256 fingerprint to verify
     * @return exists True if the evidence hash is recorded on-chain
     * @return timestamp Block timestamp when the record was anchored
     * @return sourceDomain Domain of the recorded evidence
     * @return recorder Address that submitted the record
     */
    function verifyEvidence(
        bytes32 evidenceHash
    ) external view returns (
        bool exists,
        uint256 timestamp,
        string memory sourceDomain,
        address recorder
    ) {
        VerificationRecord storage rec = _records[evidenceHash];
        if (rec.exists) {
            return (true, rec.timestamp, rec.sourceDomain, rec.recorder);
        }
        return (false, 0, "", address(0));
    }

    /**
     * @notice Returns the full struct record for an evidence hash
     * @param evidenceHash The 32-byte SHA-256 fingerprint
     */
    function getRecord(
        bytes32 evidenceHash
    ) external view returns (VerificationRecord memory) {
        return _records[evidenceHash];
    }

    /**
     * @notice Quick helper to check if a hash exists on-chain
     */
    function isRecorded(bytes32 evidenceHash) external view returns (bool) {
        return _records[evidenceHash].exists;
    }
}
