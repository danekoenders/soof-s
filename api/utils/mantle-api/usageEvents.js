export async function sendUsageChat({ customerApiToken, freeChat }) {
    const response = await fetch(process.env.MANTLE_API_DOMAIN + "/usage_events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Mantle-App-Id": process.env.GADGET_PUBLIC_MANTLE_APP_ID,
            "X-Mantle-Customer-Api-Token": customerApiToken,
        },
        body: JSON.stringify({
            eventName: freeChat ? "freeChats" : "chats",
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to send chat usage event");
    }

    return await response.json();
}

export async function sendUsageProduct({ customerApiToken }) {
    const response = await fetch(process.env.MANTLE_API_DOMAIN + "/usage_events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Mantle-App-Id": process.env.GADGET_PUBLIC_MANTLE_APP_ID,
            "X-Mantle-Customer-Api-Token": customerApiToken,
        },
        body: JSON.stringify({
            eventName: "products",
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to send product usage event");
    }

    return await response.json();
}
