import { getUploadSignatureAction } from '@/app/admin/actions';

// Shared by the New/Edit article forms: uploads a file straight from the
// browser to Cloudinary using a short-lived signature from our backend, so
// the image bytes never pass through our own serverless function.
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const { cloudName, apiKey, timestamp, signature, folder } = await getUploadSignatureAction();

  const body = new FormData();
  body.append('file', file);
  body.append('api_key', apiKey);
  body.append('timestamp', String(timestamp));
  body.append('folder', folder);
  body.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');
  return data.secure_url as string;
}
