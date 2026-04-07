import { randomUUID } from 'crypto';
import fetch from 'node-fetch'; // or built-in fetch in Node 18+

// -------------------------------------------------------------------
// Strict Types for Zero-Trust Data Flow
// -------------------------------------------------------------------
export interface VerificationRequest {
  claimId: string;
  userId: string;
  imagePath: string; // Secure path on the local encrypted volume
  secretKey: string;
}

export interface VerificationResult {
  status: 'APPROVED' | 'REJECTED' | 'PROVISIONAL';
  pickupTicketId?: string;
  message: string;
  confidenceScore: number;
}

export interface PythonVLVResponse {
  confidence_score: number;
  reasoning: string;
  is_error: boolean;
}

// -------------------------------------------------------------------
// Mock Database Services (Replace with actual Prisma/TypeORM calls)
// -------------------------------------------------------------------
const db = {
  updateClaimStatus: async (claimId: string, status: string, score: number) => {
    console.log(`[DB] Claim ${claimId} updated to ${status} with score ${score}`);
  },
  penalizeUserTrustScore: async (userId: string, penalty: number) => {
    console.log(`[DB] User ${userId} penalized by ${penalty} points`);
  },
  generatePickupTicket: async (claimId: string, userId: string): Promise<string> => {
    const ticketId = `AUTH-${randomUUID().slice(0, 4).toUpperCase()}`;
    console.log(`[DB] Generated Pickup Ticket ${ticketId} for Claim ${claimId}`);
    return ticketId;
  }
};

// -------------------------------------------------------------------
// 3-Tier Routing Logic
// -------------------------------------------------------------------
export class VerificationController {
  private readonly vlvServiceUrl: string;

  constructor() {
    // URL of the internal Python FastAPI microservice (e.g., http://vlv-service:8000)
    this.vlvServiceUrl = process.env.VLV_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Orchestrates the verification process by calling the local VLM
   * and routing the result based on strict confidence thresholds.
   */
  public async processClaimVerification(req: VerificationRequest): Promise<VerificationResult> {
    try {
      console.log(`[Controller] Initiating verification for Claim: ${req.claimId}`);

      // 1. Call the Local Python VLV Microservice
      const vlvResponse = await fetch(`${this.vlvServiceUrl}/api/v1/verify-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_path: req.imagePath,
          secret_key_challenge: req.secretKey
        })
      });

      if (!vlvResponse.ok) {
        throw new Error(`VLV Service returned status ${vlvResponse.status}`);
      }

      const vlvData = (await vlvResponse.json()) as PythonVLVResponse;
      const score = vlvData.confidence_score;

      console.log(`[Controller] VLV Score received: ${score}`);

      // 2. The 3-Tier Routing Logic
      if (score > 0.85) {
        // TIER 1: Auto-Approve
        await db.updateClaimStatus(req.claimId, 'VERIFIED', score);
        const ticketId = await db.generatePickupTicket(req.claimId, req.userId);
        
        return {
          status: 'APPROVED',
          pickupTicketId: ticketId,
          message: 'Ownership verified automatically. Proceed to pickup.',
          confidenceScore: score
        };

      } else if (score < 0.40) {
        // TIER 2: Auto-Reject
        await db.updateClaimStatus(req.claimId, 'REJECTED', score);
        await db.penalizeUserTrustScore(req.userId, 10); // Deduct 10 points for false claim
        
        return {
          status: 'REJECTED',
          message: 'Claim denied. The provided secret key does not match the item. Your Trust Score has been penalized.',
          confidenceScore: score
        };

      } else {
        // TIER 3: Provisional Match (0.40 - 0.85)
        await db.updateClaimStatus(req.claimId, 'PROVISIONAL', score);
        
        return {
          status: 'PROVISIONAL',
          message: 'Manual Verification Required at Handover. Please bring additional proof of ownership to the security desk.',
          confidenceScore: score
        };
      }

    } catch (error) {
      console.error(`[Controller] Error during verification routing:`, error);
      throw new Error('Internal Verification Pipeline Error');
    }
  }
}
