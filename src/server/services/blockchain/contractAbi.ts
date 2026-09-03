export const EvidenceRegistryABI = [
  "function recordEvidence(bytes32 evidenceHash, string calldata sourceDomain) external returns (bool)",
  "function verifyEvidence(bytes32 evidenceHash) external view returns (bool exists, uint256 timestamp, string memory sourceDomain, address recorder)",
  "function getRecord(bytes32 evidenceHash) external view returns (tuple(bytes32 evidenceHash, uint256 timestamp, string sourceDomain, address recorder, bool exists))",
  "function isRecorded(bytes32 evidenceHash) external view returns (bool)",
  "function totalRecordsCount() external view returns (uint256)",
  "event EvidenceRecorded(bytes32 indexed evidenceHash, string sourceDomain, uint256 timestamp, address indexed recorder)",
];

export const EvidenceRegistryBytecode = ""; // Loaded from artifacts if deploying dynamically
