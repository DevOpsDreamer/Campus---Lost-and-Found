import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Note: Tesseract.js is asynchronous and runs in workers.
import { createWorker } from 'tesseract.js';

/**
 * Utility for DPDP Act 2023 Compliance
 * Systematically blurs detected Indian identification markers (PAN / Aadhaar)
 */
export class RedactionPipeline {
  
  // Strict regular expressions for Indian Govt Identification
  private static readonly PAN_REGEX = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
  private static readonly AADHAAR_REGEX = /\d{4}\s?\d{4}\s?\d{4}/g;

  /**
   * Processes an image to find PII and applies a heavy Gaussian blur over it.
   * @param inputImagePath The absolute path to the uploaded image
   * @param outputImagePath The absolute path to save the redacted image
   */
  public static async processAndRedact(inputImagePath: string, outputImagePath: string): Promise<boolean> {
    try {
      console.log(`[Redaction] Starting DPDP pipeline for ${inputImagePath}`);
      
      const worker = await createWorker('eng');
      
      // Run OCR to get text and bounding box locations
      const { data }: any = await worker.recognize(inputImagePath);
      await worker.terminate();

      const imageMetadata = await sharp(inputImagePath).metadata();
      const imageWidth = imageMetadata.width || 0;
      const imageHeight = imageMetadata.height || 0;

      // Filter words that match PII regex
      const wordsToBlur = data.words.filter((word: any) => {
        const text = word.text;
        return this.PAN_REGEX.test(text) || this.AADHAAR_REGEX.test(text);
      });

      if (wordsToBlur.length === 0) {
        console.log(`[Redaction] No PII detected. Proceeding safely.`);
        // Just copy the original if no PII found
        fs.copyFileSync(inputImagePath, outputImagePath);
        return false;
      }

      console.log(`[Redaction] CRITICAL: Found ${wordsToBlur.length} identifiable sequences. Applying Blur.`);

      // Create an SVG overlay with blurred rectangles over bounding boxes
      let svgRects = '';
      for (const word of wordsToBlur) {
        const { x0, y0, x1, y1 } = word.bbox; // Bounding box coordinates
        const width = x1 - x0;
        const height = y1 - y0;
        // SVG rect uses x, y, width, height. We draw white/black box to blur over?
        // Better: We cut out those regions, blur them, or composite a black box over them.
        svgRects += `<rect x="${x0}" y="${y0}" width="${width}" height="${height}" fill="black" />`;
      }

      const svgBuffer = Buffer.from(`
        <svg width="${imageWidth}" height="${imageHeight}">
          ${svgRects}
        </svg>
      `);

      // We compose the black boxes over the image to "redact" it immediately in memory.
      // A full heavy gaussian blur over the specific region is heavier. For strict DPDP, blacking out is safer.
      await sharp(inputImagePath)
        .composite([{ input: svgBuffer, blend: 'over' }])
        .toFile(outputImagePath);

      console.log(`[Redaction] Redacted image saved securely to ${outputImagePath}`);
      return true;

    } catch (error) {
      console.error('[Redaction] OCR/Blurring pipeline failed:', error);
      throw error;
    }
  }
}
