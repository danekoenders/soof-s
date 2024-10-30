const crypto = require('crypto');

const secret = process.env.MANTLE_API_KEY;

function verifySignature(timestamp, expectedSignature, rawBody) {
    const data = `${timestamp}.${rawBody}`;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data, 'utf8');
    const calculatedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(calculatedSignature), Buffer.from(expectedSignature));
}

export { verifySignature };