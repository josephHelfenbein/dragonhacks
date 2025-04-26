import { PhoneDetectionResult } from '@/app/lib/types';

export async function detectPhone(imageBlob: Blob): Promise<PhoneDetectionResult> {
  try {
    const formData = new FormData();
    formData.append('image', imageBlob);

    const response = await fetch('/api/phone-detection', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Phone detection failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in phone detection service:', error);
    throw error;
  }
}
