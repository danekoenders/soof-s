export async function sendUsageChat({ customerApiToken }) {
    const response = await fetch("https://appapi.heymantle.com/v1/usage_events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Mantle-App-Id": process.env.GADGET_PUBLIC_MANTLE_APP_ID,
            "X-Mantle-Customer-Api-Token": customerApiToken,
        },
        body: JSON.stringify({
            eventName: "chats"
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to send chat usage event");
    }

    return await response.json();
}
