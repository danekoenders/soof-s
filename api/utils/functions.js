// Function to create HTML from transcript
export function formatTranscript(transcript) {
    const parsedTranscript = JSON.parse(transcript);
    return parsedTranscript.map(entry => {
        const role = entry.role === 'user' ? 'assistant' : 'user';
        const message = typeof entry.message === 'string' ? entry.message : entry.message.reply;
        const timestamp = new Date(entry.timestamp).toLocaleString();
        return `
        <div class="message ${role}">
          <div class="timestamp"><strong>${timestamp}</strong></div>
          <div class="message-content">${message}</div>
        </div>
      `;
    }).join('');
}

// Function to generate an anonymous email
export function generateAnonymousEmail(email) {
    const [name, domain] = email.split('@');
    return `${name.slice(0, 2)}...@${domain}`;
}