
export type Ophthalmologist = {
  id: string; // Google place_id
  name: string;
  specialty: string; // Will be generic like "Ophthalmologist" or based on keywords
  clinicName: string; // Often same as name for Places API results
  address: string;
  phone?: string; // Optional, as not always available from Nearby Search
  googleRating?: number; // Optional
  distance?: string; // Optional, may not be provided by API directly
  photoUrl?: string;
  googleReviews?: string; // Optional, as Nearby Search doesn't provide detailed reviews
  socialMediaPosts?: string; // Optional, custom field not from API
  lat?: number; // Optional: latitude
  lng?: number; // Optional: longitude
};

// MOCK_OPHTHALMOLOGISTS is now empty.
export const MOCK_OPHTHALMOLOGISTS: Ophthalmologist[] = [];
