const crypto = require('crypto');

export const handler = async (event) => {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Invalid JSON body.' }) };
    }

    const { order_id, amount, currency } = payload;
    const merchant_id = "240156";
    // We default to the provided secret for immediate unblocking, but strongly recommend setting it in Netlify Env Vars!
    const merchant_secret = process.env.PAYHERE_SECRET || "MTk3NzM4MTg4MjM5NzgwODY4MjEyNjIyOTMyOTkxMjQ2MjQ0NDMwMw==";

    if (!order_id || !amount || !currency) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Missing parameters: order_id, amount, currency' }) };
    }

    // Hash formula:
    // uppercase(md5(merchant_id + order_id + amount_formatted_to_2_decimals + currency + uppercase(md5(merchant_secret))))
    const formattedAmount = Number(amount).toFixed(2);
    
    const hashedSecret = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
    const hashString = merchant_id + order_id + formattedAmount + currency + hashedSecret;
    const finalHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ hash: finalHash }),
    };
};
