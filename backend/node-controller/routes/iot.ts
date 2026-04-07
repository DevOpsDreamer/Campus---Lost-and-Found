import { Router, Request, Response } from 'express';
import { AssetEvent } from '../db/schema';
import mongoose from 'mongoose';

const router = Router();

// Define MQTT JSON Payload interface
interface IoTDropPayload {
  deviceId: string;
  timestamp: string; // ISO 8601 from onboard RTC
  telemetry: {
    weight_grams: number;
    rfid_epc_tags: string[];
  };
  hardware: {
    rssi_dbm: number;
    door_locked: boolean;
  };
}

// Fixed drop-box locations mapped by deviceId
const IOT_DEVICE_LOCATIONS: Record<string, number[]> = {
  'BOX_MAIN_GATE': [73.8567, 18.5204], 
  'BOX_LIBRARY': [73.8570, 18.5210]
};

router.post('/ingest', async (req: Request, res: Response) => {
  try {
    const payload = req.body as IoTDropPayload;

    if (!payload.deviceId || !payload.telemetry) {
      return res.status(400).json({ error: 'Invalid IoT Telemetry payload' });
    }

    // Verify weight isn't empty drop
    if (payload.telemetry.weight_grams < 10) {
      return res.status(406).json({ error: 'Item weight too low. Likely empty.' });
    }

    // Verify door is securely locked
    if (!payload.hardware.door_locked) {
      console.warn(`[IoT] WARNING: Device ${payload.deviceId} door failed to lock!`);
    }

    const coordinates = IOT_DEVICE_LOCATIONS[payload.deviceId] || [0, 0];

    // Create immutable audit record
    const event = new AssetEvent({
      eventType: 'DEPOSITED',
      location: { type: 'Point', coordinates: coordinates },
      extractedTags: ['IoT_Drop', ...payload.telemetry.rfid_epc_tags],
      eventTimestamp: new Date(payload.timestamp),
      transactionTime: new Date()
    });

    await event.save();
    console.log(`[IoT] Ingested DEPOSITED event from ${payload.deviceId}`);

    return res.status(201).json({ status: 'ACK', eventId: event._id });
  } catch (error) {
    console.error('[IoT] Ingestion error:', error);
    return res.status(500).json({ error: 'Internal IoT Gateway Error' });
  }
});

export default router;
