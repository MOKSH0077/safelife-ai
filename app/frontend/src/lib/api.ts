const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatResponse {
  response: string;
  category: string;
}

export interface UploadResponse {
  message: string;
}

export interface UploadedFile {
  name: string;
  type: "medical" | "fraud";
}

/**
 * Sends a chat question to the SafeLife AI backend.
 * @param question - The message string from the user.
 * @param threadId - Unique session ID for persistent memory.
 * @param uploadedFiles - Active uploaded files in the current chat session.
 */
export async function sendChatMessage(
  question: string, 
  threadId: string, 
  uploadedFiles?: UploadedFile[]
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      question, 
      thread_id: threadId,
      uploaded_files: uploadedFiles
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to send message: ${response.statusText}. ${errText}`);
  }

  return response.json();
}

/**
 * Uploads a medical or fraud document to the SafeLife AI backend for indexing.
 * @param file - The PDF file object.
 * @param type - The document category ('medical' or 'fraud').
 */
export async function uploadPDF(file: File, type: "medical" | "fraud"): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${API_BASE_URL}/upload?type=${type}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to upload document: ${response.statusText}. ${errText}`);
  }

  return response.json();
}
