// src/services/integration.js

/**
 * Funkcja wysyłająca dane do Google Cloud Application Integration
 * @param {Object} offerData - Dane nowego ogłoszenia
 */
export const triggerGCPIntegration = async (offerData) => {
  try {
    // Tutaj wklejasz endpoint wygenerowany przez Twój API Trigger w Google Cloud
    const GCP_ENDPOINT = "https://integration.googleapis.com/v1/projects/TWÓJ-PROJEKT/locations/global/integrations/...";

    const response = await fetch(GCP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Jeśli skonfigurowałeś klucz API w Google Console:
        "X-Goog-Api-Key": "TWÓJ_API_KEY_Z_CONSOLE_GOOGLE_CLOUD"
      },
      body: JSON.stringify({
        title: offerData.title,
        price: offerData.price,
        user: offerData.userEmail,
        timestamp: new Date().toISOString()
      }),
    });

    if (response.ok) {
      console.log("Application Integration triggered successfully!");
    }
  } catch (error) {
    console.error("GCP Integration Error:", error);
  }
};