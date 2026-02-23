// src/services/uploadService.js
import { storage, storageRef, uploadBytesResumable, getDownloadURL } from '../firebase';

/**
 * Upload a file to Firebase Storage.
 * Returns { uploadTask, promise } where promise resolves to { url, name, size, type }.
 */
export function uploadFile(chatId, file, onProgress) {
  const path = `chats/${chatId}/${Date.now()}_${file.name}`;
  const fileRef = storageRef(storage, path);
  const uploadTask = uploadBytesResumable(fileRef, file);

  const promise = new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    );
  });

  return { uploadTask, promise };
}

/**
 * Check if a file type is an image.
 */
export function isImage(type) {
  return type && type.startsWith('image/');
}

/**
 * Check if a file type is a video.
 */
export function isVideo(type) {
  return type && type.startsWith('video/');
}
