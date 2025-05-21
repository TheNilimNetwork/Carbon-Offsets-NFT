// This function mocks an IPFS upload using a predictable hash algorithm
// In a production environment, this would use Pinata or another IPFS service
export async function uploadToIPFS(file: File | Blob): Promise<string> {
  // Hardcoded credentials as a fallback
  const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY || "58ad5556c3a7a95ec9cc";
  const pinataSecretApiKey = import.meta.env.VITE_PINATA_SECRET_API_KEY || "eea95b8d56b2985d6e30cf6fecaca6493e066dc5fcffd3a2c423c273a8950ae3";
  
  console.log("IPFS Upload - API Key available:", !!pinataApiKey);
  console.log("IPFS Upload - Secret Key available:", !!pinataSecretApiKey);

  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error('Pinata API credentials are required for IPFS uploads');
  }

  return uploadToPinata(file, pinataApiKey as string, pinataSecretApiKey as string);
}

async function uploadToPinata(file: File | Blob, apiKey: string, secretApiKey: string): Promise<string> {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  
  // Create form data for the file upload
  const formData = new FormData();
  if (file instanceof File) {
    formData.append('file', file, file.name);
  } else {
    // For blob, create a filename based on current time
    formData.append('file', file, `blob-${Date.now()}.json`);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretApiKey
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to Pinata: ${response.statusText}`);
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}
