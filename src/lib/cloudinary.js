export async function uploadToCloudinary(file, { onProgress } = {}) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing Cloudinary env vars: VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET",
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  // Use XHR so we can report progress
  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();

    form.append("file", file);
    form.append("upload_preset", uploadPreset);
    // optional: force folder if not set in preset
    // form.append("folder", "menu");

    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      onProgress?.(pct);
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          // Cloudinary returns secure_url
          resolve(data);
        } else {
          reject(new Error(data?.error?.message || "Cloudinary upload failed"));
        }
      } catch {
        reject(new Error("Cloudinary upload failed (bad response)"));
      }
    };

    xhr.onerror = () =>
      reject(new Error("Cloudinary upload failed (network error)"));
    xhr.send(form);
  });
}
