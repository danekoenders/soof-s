export async function getCustomer({ customerApiToken }) {
    const response = await fetch("https://appapi.heymantle.com/v1/customer", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Mantle-App-Id": process.env.GADGET_PUBLIC_MANTLE_APP_ID,
            "X-Mantle-Customer-Api-Token": customerApiToken,
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch customer");
    }

    const data = await response.json();
    return data.customer;
}