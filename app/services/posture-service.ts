import { PostureDetectionResult } from '@/app/lib/types';

export async function detectPosture(imageBlob: Blob): Promise<PostureDetectionResult> {
  try {
    const formData = new FormData();
    formData.append('image', imageBlob);

    const response = await fetch('/api/posture', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Posture detection failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in posture detection service:', error);
    throw error;
  }
}
