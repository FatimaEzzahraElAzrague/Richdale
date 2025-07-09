interface InpaintingRequest {
  image: string;
  mask: string;
  prompt: string;
}

// Helper function to resize image to 512x512
function resizeImageTo512(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 512;
      canvas.height = 512;
      
      if (ctx) {
        // Fill with white background first
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 512, 512);
        
        // Calculate scaling to fit image within 512x512 while maintaining aspect ratio
        const scale = Math.min(512 / img.width, 512 / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center the image
        const x = (512 - scaledWidth) / 2;
        const y = (512 - scaledHeight) / 2;
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      }
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = imageDataUrl;
  });
}

export async function generateInpainting({ image, mask, prompt }: InpaintingRequest): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_STABILITY_API_KEY;
  
  console.log('API Key check:', apiKey ? `Found (${apiKey.substring(0, 10)}...)` : 'Not found');
  console.log('Full API Key:', apiKey);
  
  if (!apiKey) {
    throw new Error('Stability API key not found. Please add NEXT_PUBLIC_STABILITY_API_KEY to your environment variables.');
  }

  try {
    // Resize both image and mask to 512x512
    console.log('Resizing image and mask to 512x512...');
    const resizedImage = await resizeImageTo512(image);
    const resizedMask = await resizeImageTo512(mask);
    
    // Convert resized base64 data URLs to blobs
    const imageBlob = await fetch(resizedImage).then(res => res.blob());
    const maskBlob = await fetch(resizedMask).then(res => res.blob());
    
    console.log('Image blob size:', imageBlob.size);
    console.log('Mask blob size:', maskBlob.size);

    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('mask', maskBlob);
    formData.append('prompt', prompt);
    formData.append('output_format', 'png');

    console.log('Sending request to Stability AI...');
    const response = await fetch('https://api.stability.ai/v2beta/stable-image/edit/inpaint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*',
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability API error response:', errorText);
      throw new Error(`Stability API error: ${response.status} ${response.statusText}`);
    }

    const generatedImageBlob = await response.blob();
    console.log('Generated image blob size:', generatedImageBlob.size);
    const imageUrl = URL.createObjectURL(generatedImageBlob);
    
    return imageUrl;
  } catch (error) {
    console.error('Detailed error calling Stability API:', error);
    throw error;
  }
}