# TRACE // GOA — Demonstration Images & Consent Documentation

## Safety, Consent & Privacy Boundary

In compliance with the **Hacker House Goa 2026** challenge specifications:
- The images included in this directory (`demo/consented-photo.jpg` and `demo/consented-multi-portrait.jpg`) are dedicated demonstration portraits created specifically for prototype verification and testing.
- The pipeline processes visual evidence to confirm public matching content and cryptographic integrity; it **does NOT** infer or reveal the identity or private personal data of an unknown individual.

## Available Demo Fixtures

| File | Type | Purpose | Consent & License |
| :--- | :--- | :--- | :--- |
| `demo/consented-photo.jpg` | Single Portrait | Standard 7-stage pipeline demonstration | Dedicated test subject / Team permitted |
| `demo/consented-multi-portrait.jpg` | Multi-person Portrait | Multi-face detection and selection demonstration | Dedicated test subject / Team permitted |

## Local Processing Guarantee

1. Face detection, landmark extraction, and 128D descriptor computation occur locally.
2. Temporary files generated during reverse-image search are stored in the OS temporary directory and purged immediately after execution.
3. No biometric vectors or facial embeddings are written to the blockchain.
