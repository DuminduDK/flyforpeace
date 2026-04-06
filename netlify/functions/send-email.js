/**
 * Netlify Function: send-email
 * POST /.netlify/functions/send-email
 *
 * Body (JSON):
 *   { to: string, subject: string, html: string }
 *
 * RESEND_API_KEY must be set in Netlify → Site Settings → Environment Variables.
 * It is NEVER exposed to the browser.
 */

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
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('RESEND_API_KEY is not set in environment variables.');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Email service is not configured.' }),
        };
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body.' }) };
    }

    const { to, subject, html } = payload;

    if (!to || !subject || !html) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Fly for Peace <noreply@flyforpeace.org>', // ← noreply@webmindr.online is the verified sender
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', result);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: result.message || 'Resend API error' }),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true, id: result.id }),
        };
    } catch (err) {
        console.error('Network error calling Resend:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send email.' }),
        };
    }
};
