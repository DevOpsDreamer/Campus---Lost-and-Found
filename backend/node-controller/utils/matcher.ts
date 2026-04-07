/**
 * Mathematical Spatiotemporal Matcher Utility
 * Computes Match Probability Score (MPS) based on:
 * 1. Haversine Spatial Distance (S)
 * 2. Continuous Exponential Temporal Decay (T)
 * 3. AI Semantic NLP Score (V)
 */

export class MatcherUtils {
  private static readonly EARTH_RADIUS_METERS = 6371e3;

  /**
   * Calculates great-circle distance between two points on a sphere.
   * @param lat1 Latitude of point 1 in degrees
   * @param lon1 Longitude of point 1 in degrees
   * @param lat2 Latitude of point 2 in degrees
   * @param lon2 Longitude of point 2 in degrees
   * @returns Distance in meters
   */
  public static calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);
    const deltaPhi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lon2 - lon1);

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return MatcherUtils.EARTH_RADIUS_METERS * c;
  }

  /**
   * Generates a spatial score based on inverse distance weighting.
   * Punishes distances larger than expected typical campus deviation (e.g. 150m walking gap).
   * @param distanceMeters The raw haversine distance.
   */
  public static calculateSpatialScore(distanceMeters: number): number {
    // Inverse distance weighting logic (very simplistic implementation)
    // If exact same spot (0m), score is 1.0. 
    // If 150m away, score might be 0.5. If 500m away, score approaches 0.
    const maxCampusWalkingDeviation = 150; 
    return Math.max(0, 1 - (distanceMeters / (maxCampusWalkingDeviation * 2)));
  }

  /**
   * Calculates temporal decay.
   * As the time gap between "lost time" and "found time" grows, probability of match decays exponentially.
   * @param lostTime Timestamp the item was lost
   * @param foundTime Timestamp the item was found
   * @param decayConstant Lambda constant calibrated for the university
   */
  public static calculateTemporalDecay(lostTime: Date, foundTime: Date, decayConstant: number = 0.05): number {
    const timeDeltaHours = Math.abs(foundTime.getTime() - lostTime.getTime()) / (1000 * 60 * 60);
    return Math.exp(-decayConstant * timeDeltaHours);
  }

  /**
   * The Unified Spatiotemporal Match Probability Function
   */
  public static calculateUnifiedScore(
    spatialScore: number, 
    temporalScore: number, 
    aiVlvScore: number,
    weights = { alpha: 0.3, beta: 0.2, gamma: 0.5 } // Weight coefficients. AI score has the highest priority mapping the secret key.
  ): number {
    return (weights.alpha * spatialScore) + (weights.beta * temporalScore) + (weights.gamma * aiVlvScore);
  }
}
