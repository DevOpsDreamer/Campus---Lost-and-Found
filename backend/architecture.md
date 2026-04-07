# CampusTrace Backend Architecture: Vision-Language Verification (VLV)

## Overview
To comply with the **DPDP Act 2023** and maintain strict intellectual property retention, the CampusTrace verification pipeline operates entirely on-premises/edge. No external proprietary APIs (e.g., OpenAI, Gemini) are used. 

The architecture consists of two primary components:
1. **Python VLV Microservice (FastAPI)**: Hosts small-parameter, edge-optimized open-source models (Moondream2 / Florence-2) and GLiNER for semantic matching.
2. **Node.js Controller (TypeScript)**: Orchestrates the business logic, handles the 3-Tier routing based on confidence scores, and manages database state and user trust scores.

## Zero-Trust Data Flow
1. **Client Request**: User submits a claim with a "Secret Key" description.
2. **Node.js Controller**: Receives the request, validates the user's session, and retrieves the secure, unblurred image path from the local encrypted volume.
3. **VLV Microservice**: Node.js sends a secure internal POST request to the Python microservice (running in the same VPC/Docker network) containing the image path and the secret key.
4. **Local AI Inference**: The Python service loads the image from the local volume, runs the VLM inference, and calculates a semantic match confidence score (0.0 to 1.0).
5. **3-Tier Routing**: Node.js receives the score and routes the claim:
   - **> 0.85 (Auto-Approve)**: Generates a UUID pickup ticket.
   - **< 0.40 (Auto-Reject)**: Denies claim, penalizes Trust Score.
   - **0.40 - 0.85 (Provisional)**: Flags for manual verification at the security desk.

## Directory Structure
- `/backend/python-vlv-service/`: The FastAPI Python microservice.
- `/backend/node-controller/`: The strictly typed Node.js/TypeScript routing logic.
