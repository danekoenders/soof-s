import React from 'react';
import { useSearchParams } from "react-router-dom";

export default function () {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');

    const shopDomain = document.cookie.split('; ').find(row => row.startsWith('_myshopifyDomain')).split('=')[1];

    if (shopDomain) {
        window.location.href = `https://${shopDomain}/admin/apps/soof/integrations?callback=exactOnline&code=${code}`;
    } else {
        console.error('Shop domain not found');
    }
}