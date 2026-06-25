
"use server";

import { analyzeEyeImage, AnalyzeEyeImageInput, AnalyzeEyeImageOutput } from "@/ai/flows/analyze-eye-image";
import { summarizeOphthalmologistReviews, SummarizeOphthalmologistReviewsInput, SummarizeOphthalmologistReviewsOutput } from "@/ai/flows/summarize-ophthalmologist-reviews";
import type { Ophthalmologist } from "@/lib/constants";

// --- MOCK DATA DEFINITION for AI Triage ---
const MOCK_ANALYZE_EYE_IMAGE_OUTPUT: AnalyzeEyeImageOutput = {
  triageUrgency: 'Refer Within Week',
  reason: 'MOCK DATA: Patient presents with mild conjunctival injection and reports intermittent blurry vision. Image shows slight corneal clouding. These findings suggest a condition that warrants specialist attention within a week for further evaluation and to rule out infectious keratitis or early uveitis. This is mock data for development purposes.',
  possibleDiagnoses: ['Mock Mild Keratitis', 'Mock Episcleritis', 'Mock Early Uveitis'],
  treatmentSuggestions: ['Advise symptomatic relief with cool compresses (Mock)', 'Recommend avoiding contact lens wear (Mock)', 'Suggest over-the-counter lubricating eye drops (Mock)'],
  referralTimingDetails: 'Refer to an ophthalmologist within 3-5 days for comprehensive slit-lamp examination and appropriate management. (Mock Data)',
};

// The MOCK_SUMMARIZE_REVIEWS_OUTPUT is intentionally kept commented out or removed
// as the request was specific to "mock triaging".
// const MOCK_SUMMARIZE_REVIEWS_OUTPUT: SummarizeOphthalmologistReviewsOutput = {
//   summary: 'SERVER-SIDE MOCK: This ophthalmologist is highly praised for their thoroughness and compassionate care. Patients frequently mention the modern clinic and helpful staff. This summary is hardcoded for testing.',
// };
// --- END MOCK DATA DEFINITIONS ---


export async function performEyeAnalysis(input: AnalyzeEyeImageInput): Promise<AnalyzeEyeImageOutput | { error: string }> {
  if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.warn("WARNING: GOOGLE_GENAI_API_KEY or GOOGLE_API_KEY is not set. EyeTriage will return MOCK AI Triage data. For live results, please set your API key in the .env file.");
    return MOCK_ANALYZE_EYE_IMAGE_OUTPUT;
  }
  try {
    // Basic validation for data URI
    if (!input.photoDataUri || !input.photoDataUri.startsWith('data:image/') || !input.photoDataUri.includes(';base64,')) {
      return { error: "Invalid image data format. Ensure it's a valid data URI (e.g., 'data:image/jpeg;base64,...')." };
    }
    const result = await analyzeEyeImage(input);
    return result;
  } catch (error) {
    console.error("Error in performEyeAnalysis (server action):", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    let clientErrorMessage = `Failed to analyze eye image.`;
    
    if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
      clientErrorMessage = "Failed to analyze eye image: The API key may be invalid or not properly configured for the required services. Please verify your API key and its permissions.";
    } else if (errorMessage.toLowerCase().includes('model not found') || errorMessage.toLowerCase().includes('not found')) {
      clientErrorMessage = `Failed to analyze eye image: The configured AI model could not be accessed. This might be due to an incorrect model name in the AI flow, or the API key not having permissions for this model. Please check your Google Cloud project and API key settings. Details: ${errorMessage}`;
    } else if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('limit exceeded')) {
      clientErrorMessage = `Failed to analyze eye image: AI service quota may have been exceeded. Details: ${errorMessage}`;
    } else if (errorMessage.includes('503 Service Unavailable') || errorMessage.toLowerCase().includes('model is overloaded')) {
      clientErrorMessage = `Failed to analyze eye image: The AI service is temporarily busy or overloaded. Please try again in a few moments. Details: ${errorMessage}`;
    } else if (errorMessage) {
      clientErrorMessage += ` Details: ${errorMessage}`;
    }
    
    clientErrorMessage += " Please check server logs for the full error details if the problem persists."

    return { error: clientErrorMessage };
  }
}

export async function summarizeReviews(input: SummarizeOphthalmologistReviewsInput): Promise<SummarizeOphthalmologistReviewsOutput | { error: string }> {
  if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_GENAI_API_KEY or GOOGLE_API_KEY is not set in the environment variables for summarizeReviews.");
    // For summarizeReviews, we return an error if key is missing, not mock data, as per focused request.
    return { error: "AI service is not configured for reviews. API key is missing. Please set GOOGLE_GENAI_API_KEY in your .env file." };
  }
  try {
    const result = await summarizeOphthalmologistReviews(input);
    return result;
  } catch (error) {
    console.error("Error in summarizeReviews:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to summarize reviews. ${errorMessage.includes('API key not valid') ? 'The API key may be invalid.' : 'Please try again.'}` };
  }
}

interface FetchNearbyOphthalmologistsParams {
  latitude: number;
  longitude: number;
}

export async function fetchNearbyOphthalmologists({ latitude, longitude }: FetchNearbyOphthalmologistsParams): Promise<Ophthalmologist[] | { error: string }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY is not set in environment variables.");
    return { error: "Map service is not configured. API key is missing. Please ensure GOOGLE_MAPS_API_KEY is set in your .env file." };
  }

  const radius = 15000; // 15km
  const url = `https://places.googleapis.com/v1/places:searchText`; 
  const fieldMask = "places.id,places.displayName,places.formattedAddress,places.rating,places.photos,places.location,places.nationalPhoneNumber";

  const requestBody = {
    textQuery: "ophthalmologist", 
    includedType: "doctor",       
    maxResultCount: 15,
    locationBias: { 
      circle: {
        center: {
          latitude: latitude,
          longitude: longitude,
        },
        radius: radius,
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google Places API (New) searchText error response:", data);
      const errorDetails = data.error?.message || JSON.stringify(data.error) || `HTTP status ${response.status}`;
      throw new Error(`Google Places API (New) searchText request failed: ${errorDetails}`);
    }
    
    if (data.error) {
        console.error("Google Places API (New) searchText returned error object:", data.error);
        throw new Error(`Google Places API (New) searchText error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    if (!data.places || data.places.length === 0) {
      return []; 
    }
    
    const ophthalmologists: Ophthalmologist[] = data.places.map((place: any) => {
      let photoUrl;
      if (place.photos && place.photos.length > 0) {
        const photoResourceName = place.photos[0].name; 
        photoUrl = `https://places.googleapis.com/v1/${photoResourceName}/media?maxWidthPx=400&key=${apiKey}`;
      }

      const name = place.displayName?.text || "Name not available";

      return {
        id: place.id,
        name: name,
        clinicName: name, 
        address: place.formattedAddress || "Address not available",
        googleRating: place.rating,
        photoUrl: photoUrl || `https://placehold.co/100x100.png?text=${name.substring(0,1)}`,
        specialty: "Ophthalmologist", 
        phone: place.nationalPhoneNumber,
        lat: place.location?.latitude,
        lng: place.location?.longitude,
      };
    });

    return ophthalmologists;

  } catch (error) {
    console.error("Error fetching nearby ophthalmologists:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to fetch nearby ophthalmologists. ${errorMessage}. Please ensure your GOOGLE_MAPS_API_KEY is correctly set up in the .env file and has the Places API (New) enabled.` };
  }
}

