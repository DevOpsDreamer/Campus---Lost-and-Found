import { Router, Request, Response } from 'express';
import { AssetEvent } from '../db/schema';
import { MatcherUtils } from '../utils/matcher';
import { RedactionPipeline } from '../utils/redaction';
import { upload } from '../utils/upload'; // Multer upload middleware
import fs from 'fs';
import path from 'path';

const router = Router();

// Temporary mock of the Verification Controller that was calling Python FastAPI
import { VerificationController } from '../verificationController';
const verificationCtrl = new VerificationController();

// Create "Found" item report
router.post('/found', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { lat, lng, secretKey } = req.body;
    let imagePath = req.file?.path;

    if (!imagePath) {
      return res.status(400).json({ error: 'Image is required for chain of custody.' });
    }

    console.log(`[Claims API] Received Found item submission.`);

    // 1. Run DPDP Image Redaction Pipeline to Gaussian blur Aadhaar/PAN
    const redactedPath = imagePath + '-redacted.jpg';
    const wasRedacted = await RedactionPipeline.processAndRedact(imagePath, redactedPath);

    // Save DPDP compliant event
    const event = new AssetEvent({
      eventType: 'FOUND',
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      extractedTags: ['MANUAL_ENTRY'], // normally populated by python GLiNER
      eventTimestamp: new Date(),
      piiRedacted: wasRedacted,
      secretKey: secretKey,
      imageUrl: wasRedacted ? redactedPath : imagePath
    });

    await event.save();

    return res.status(201).json({ status: 'SUCCESS', assetId: event._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during submission' });
  }
});

// Calculate Probability Score & Process "Lost" Claim
router.post('/claim', async (req: Request, res: Response) => {
  try {
    const { mySecretKeyDescription, lostLat, lostLng, lostTimestamp } = req.body;

    const allFoundEvents = await AssetEvent.find({ eventType: 'FOUND' });
    if (!allFoundEvents || allFoundEvents.length === 0) {
      return res.status(404).json({ error: 'No assets currently in database.' });
    }

    let bestMatch = null;
    let highestScore = -1;

    for (const foundEvent of allFoundEvents) {
      // 1. Calculate Haversine Spatial Score
      const haversineDist = MatcherUtils.calculateHaversineDistance(
        parseFloat(lostLat), parseFloat(lostLng), 
        foundEvent.location.coordinates[1], foundEvent.location.coordinates[0]
      );
      const spatialScore = MatcherUtils.calculateSpatialScore(haversineDist);

      // 2. Calculate Temporal Decay
      const temporalScore = MatcherUtils.calculateTemporalDecay(new Date(lostTimestamp), foundEvent.eventTimestamp);

      // 3. Request VLV AI NLP Evaluation
      let nlpScore = 0.5; // default fallback
      try {
        if (foundEvent.imageUrl && fs.existsSync(foundEvent.imageUrl)) {
          const vlvResult = await verificationCtrl.processClaimVerification({
            claimId: foundEvent._id.toString(),
            userId: 'REQ-USER-1', // Mock user token
            imagePath: foundEvent.imageUrl,
            secretKey: mySecretKeyDescription
          });
          nlpScore = vlvResult.confidenceScore;
        }
      } catch(aiError) {
        console.warn("AI Microservice unavailable or errored, falling back to lower confidence weighting.");
      }

      // 4. Unified Spatiotemporal Mathematical Math
      const unifiedSPS = MatcherUtils.calculateUnifiedScore(spatialScore, temporalScore, nlpScore);
      console.log(`[Claims API] Eval Item ${foundEvent._id} | Dist: ${Math.round(haversineDist)}m | UNIFIED: ${unifiedSPS.toFixed(2)}`);

      if (unifiedSPS > highestScore) {
        highestScore = unifiedSPS;
        bestMatch = foundEvent;
      }
    }

    if (highestScore > 0.75) {
      return res.json({ status: 'APPROVED', message: 'Match confidence high. Proceed to pickup.', score: highestScore, matchId: bestMatch?._id });
    } else if (highestScore < 0.3) {
      return res.json({ status: 'REJECTED', message: 'Match failed against all items. Trust penalty applied.', score: highestScore });
    } else {
      return res.json({ status: 'PROVISIONAL', message: 'Manual security review flagged.', score: highestScore, matchId: bestMatch?._id });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Evaluation pipeline failed.' });
  }
});

// Fetch active database states
router.get('/inventory', async (req, res) => {
  const items = await AssetEvent.find({ eventType: 'FOUND' }).sort({ eventTimestamp: -1 }).limit(20);
  res.json(items);
});

export default router;
