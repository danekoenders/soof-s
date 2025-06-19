// Function to create HTML from transcript
export function formatTranscript(transcript) {
  // Handle both string and already parsed data
  const parsedTranscript =
    typeof transcript === "string" ? JSON.parse(transcript) : transcript;

  return parsedTranscript
    .filter((entry) => {
      // Only include human and constructor (AI) messages, skip tool messages and errors
      return (
        entry.type === "human" ||
        (entry.type === "constructor" && entry.kwargs && entry.kwargs.content)
      );
    })
    .map((entry) => {
      // Determine role based on type
      const role = entry.type === "human" ? "user" : "assistant";

      // Extract message content
      let message = "";
      if (entry.type === "human") {
        message = entry.content || "";
      } else if (entry.type === "constructor" && entry.kwargs) {
        message = entry.kwargs.content || "";
      }

      // Escape HTML in message content
      const escapedMessage = message
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

      return `
            <div class="message ${role}">
              <div class="message-content">${escapedMessage}</div>
            </div>
          `;
    })
    .join("");
}

// Function to generate an anonymous email
export function generateAnonymousEmail(email) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}...@${domain}`;
}
