import { FaceQuality, BoundingBox } from "../../../shared/types/pipeline";

/**
 * Assesses face crop quality across dimensions, confidence, aspect ratio, and heuristics.
 */
export function evaluateFaceQuality(
  box: BoundingBox,
  confidence: number,
  imageDimensions: { width: number; height: number }
): FaceQuality {
  const minDimension = Math.min(box.width, box.height);
  const aspectRatio = box.width / Math.max(1, box.height);

  let score = 85;

  // Dimension penalty / bonus
  if (minDimension < 60) {
    score -= 40;
  } else if (minDimension < 100) {
    score -= 15;
  } else if (minDimension > 200) {
    score += 10;
  }

  // Confidence weighting
  if (confidence < 0.6) {
    score -= 35;
  } else if (confidence > 0.9) {
    score += 5;
  }

  // Aspect ratio check (natural faces typically 0.65 to 1.35)
  if (aspectRatio < 0.55 || aspectRatio > 1.45) {
    score -= 20;
  }

  score = Math.max(10, Math.min(99, score));
  const isAcceptable = score >= 50 && confidence >= 0.55 && minDimension >= 50;

  let feedback = "Face detected. Good signal.";
  if (!isAcceptable) {
    if (minDimension < 50) {
      feedback = "The face is too small in the frame for a reliable match.";
    } else if (confidence < 0.55) {
      feedback = "The face signal is too weak for a reliable match.";
    } else {
      feedback = "Face quality is too low for reliable matching. Try a clearer image.";
    }
  }

  return {
    score,
    isAcceptable,
    minDimension: Math.round(minDimension),
    confidence: Math.round(confidence * 100) / 100,
    aspectRatio: Math.round(aspectRatio * 100) / 100,
    feedback,
  };
}
