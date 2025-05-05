export interface FaceVerificationResponse {
    id: string;
    name: string;
    confidence: number;
    registered_at: string;
    verified?: boolean; // We'll calculate this based on confidence threshold
    nameMatches?: boolean; // We'll add this field to check if names match
  }