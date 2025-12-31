import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/config/cloudinary";

export const uploadToCloudinary = async (file) => {
  // Add this line to see what you are actually receiving
  console.log("What is 'file'?", file, "Is it a File instance?", file instanceof File);

  const formData = new FormData();
  // ... rest of code
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData }
  );

  // 1. Get the response body FIRST
  const data = await res.json();

  // 2. Check for error and Log the REAL message
  if (!res.ok) {
    console.error("Cloudinary Error Details:", data); // Check your browser console for this!
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return data;
};