import * as crypto from 'crypto';

const SHARED_SECRET = process.env.SHOPIFY_API_SECRET || '';

function verifySignature(queryObject: Record<string, string>): boolean {
  const signature = queryObject.signature;
  delete queryObject.signature;

  const sortedParams = Object.entries(queryObject)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join('');

  const hmac = crypto.createHmac('sha256', SHARED_SECRET);
  hmac.update(sortedParams);
  const calculatedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(calculatedSignature, 'hex'));
}

export { verifySignature };