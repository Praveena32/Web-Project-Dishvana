require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 8000;
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const ORDERS_FILE = isVercel ? path.join('/tmp', 'orders.json') : path.join(__dirname, 'orders.json');

// In-memory notifications logs for the simulation dashboard
let notificationLogs = [];

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Utility function to parse JSON body on POST requests
function parseJsonBody(req, res, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const parsed = JSON.parse(body || '{}');
            callback(parsed);
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON request payload' }));
        }
    });
}

// Helper: Generate MD5 Hash
function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

// SMS Notification sender (native https call to Twilio or mock dashboard logging)
function sendSMSNotification(to, messageText) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;

    const logRecord = {
        id: 'sms-' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'sms',
        recipient: to,
        subject: 'SMS Alert to Shop Owner',
        body: messageText,
        status: 'Sent (Simulated)'
    };

    if (!accountSid || !authToken || !from) {
        console.log(`[SMS SIMULATION] Sent to: ${to} | Text: ${messageText}`);
        notificationLogs.push(logRecord);
        return Promise.resolve({ sent: true, method: 'Simulated', log: logRecord });
    }

    const postData = querystring.stringify({
        To: to,
        From: from,
        Body: messageText
    });

    const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64')
        }
    };

    return new Promise((resolve) => {
        const twilioReq = https.request(options, (twilioRes) => {
            let responseBody = '';
            twilioRes.on('data', (d) => { responseBody += d; });
            twilioRes.on('end', () => {
                if (twilioRes.statusCode === 201) {
                    logRecord.status = 'Sent (Twilio API)';
                    notificationLogs.push(logRecord);
                    resolve({ sent: true, method: 'Twilio' });
                } else {
                    console.error('[Twilio API Error]:', twilioRes.statusCode, responseBody);
                    logRecord.status = `Failed: status ${twilioRes.statusCode}`;
                    notificationLogs.push(logRecord);
                    resolve({ sent: false, error: responseBody });
                }
            });
        });

        twilioReq.on('error', (e) => {
            console.error('[Twilio Request Connection Error]:', e);
            logRecord.status = `Error: ${e.message}`;
            notificationLogs.push(logRecord);
            resolve({ sent: false, error: e.message });
        });

        twilioReq.write(postData);
        twilioReq.end();
    });
}

// Email Notification sender (uses configured SMTP or Nodemailer test accounts)
async function sendEmailNotification(order) {
    const ownerEmail = process.env.SHOP_OWNER_EMAIL || 'owner@dishvanacolombo.lk';
    
    // Generate styled HTML receipt details
    const itemsHtml = order.cart.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">LKR ${item.price.toLocaleString()}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">LKR ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
    `).join('');

    const emailBodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #ea580c; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; text-transform: uppercase;">New Order Received</h2>
            <p><strong>Order ID:</strong> #${order.orderId}</p>
            <p><strong>Date/Time:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            
            <h3 style="margin-top: 20px; color: #333;">Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 4px 0; font-weight: bold; width: 120px;">Name:</td><td>${order.customer.name}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: bold;">Phone:</td><td>${order.customer.phone}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: bold;">Email:</td><td>${order.customer.email}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: bold;">Delivery Addr:</td><td>${order.customer.address}</td></tr>
            </table>

            <h3 style="margin-top: 20px; color: #333;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f8f8f8;">
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                        <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd; width: 50px;">Qty</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd; width: 100px;">Price</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd; width: 100px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div style="text-align: right; font-size: 16px; font-weight: bold; padding: 10px 0; border-top: 2px solid #eee;">
                Grand Total: <span style="color: #ea580c; font-size: 18px;">LKR ${order.total.toLocaleString()}</span>
            </div>
            
            <div style="margin-top: 30px; font-size: 11px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
                Dishvana Colombo Dashboard notification daemon.
            </div>
        </div>
    `;

    const mailOptions = {
        from: process.env.SMTP_FROM || 'no-reply@dishvanacolombo.lk',
        to: ownerEmail,
        subject: `[Dishvana Alert] New Order #${order.orderId} Placed (${order.paymentMethod})`,
        html: emailBodyHtml
    };

    const logRecord = {
        id: 'email-' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'email',
        recipient: ownerEmail,
        subject: mailOptions.subject,
        body: emailBodyHtml,
        status: 'Sending...'
    };

    // Check if SMTP details exist in environment
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        try {
            const info = await transporter.sendMail(mailOptions);
            logRecord.status = `Sent via SMTP (Message ID: ${info.messageId})`;
            notificationLogs.push(logRecord);
            return { sent: true, method: 'SMTP', messageId: info.messageId };
        } catch (error) {
            console.error('[SMTP Transport Error]:', error);
            logRecord.status = `Failed (SMTP Error: ${error.message})`;
            notificationLogs.push(logRecord);
            return { sent: false, error: error.message };
        }
    } else {
        // Create an Ethereal test inbox on the fly
        try {
            const testAccount = await nodemailer.createTestAccount();
            const etherealTransporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });

            const info = await etherealTransporter.sendMail(mailOptions);
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`[ETHEREAL INBOX] Mock Email delivered. Open preview: ${previewUrl}`);
            logRecord.status = `Sent (Ethereal test mail account)`;
            logRecord.previewUrl = previewUrl;
            notificationLogs.push(logRecord);
            return { sent: true, method: 'Ethereal', previewUrl: previewUrl };
        } catch (error) {
            console.error('[Ethereal Transporter Generation Error]:', error);
            logRecord.status = `Sent (Simulated UI fallback)`;
            notificationLogs.push(logRecord);
            return { sent: true, method: 'Simulated', error: error.message };
        }
    }
}

const server = http.createServer((req, res) => {
    // API endpoint for fetching menu data
    if (req.method === 'GET' && req.url === '/api/menu') {
        const menuPath = path.join(__dirname, 'menu.json');
        fs.readFile(menuPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Could not read menu data: ${err.message}` }));
                return;
            }
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
        });
        return;
    }

    // API: Generate PayHere Hash MD5 securely
    if (req.method === 'POST' && req.url === '/api/payhere-hash') {
        parseJsonBody(req, res, (data) => {
            const { order_id, amount, currency } = data;
            if (!order_id || amount === undefined || !currency) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing parameters order_id, amount, or currency' }));
                return;
            }

            const merchantId = process.env.PAYHERE_MERCHANT_ID || '1211149';
            const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '8MTEzMjY5ODMxMzE1NDQ4NTE5ODAyMTAxMjAxOTExNDU2MTk3NTA1';

            // Amount formatted to two decimal points
            const formattedAmount = Number(amount).toFixed(2);
            
            // Equation: hash = uppercase(md5(merchant_id + order_id + amount + currency + uppercase(md5(merchant_secret))))
            const hashedSecret = md5(merchantSecret).toUpperCase();
            const concatString = merchantId + order_id + formattedAmount + currency + hashedSecret;
            const finalHash = md5(concatString).toUpperCase();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                hash: finalHash,
                merchant_id: merchantId
            }));
        });
        return;
    }

    // API: Placed Orders handler
    if (req.method === 'POST' && req.url === '/api/confirm-order') {
        parseJsonBody(req, res, async (data) => {
            const { orderId, cart, customer, paymentMethod, paymentId } = data;
            
            if (!orderId || !cart || !customer || !paymentMethod) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Incomplete order parameters' }));
                return;
            }

            // Calculate total on server
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const newOrder = {
                orderId,
                timestamp: new Date().toISOString(),
                cart,
                customer,
                paymentMethod,
                paymentId: paymentId || 'COD',
                total
            };

            // Write order to orders.json file
            let orders = [];
            if (fs.existsSync(ORDERS_FILE)) {
                try {
                    const fileData = fs.readFileSync(ORDERS_FILE, 'utf8');
                    orders = JSON.parse(fileData || '[]');
                } catch (e) {
                    console.error("Error reading orders database file:", e);
                }
            }
            orders.unshift(newOrder); // Add to beginning

            try {
                fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
            } catch (writeErr) {
                console.error("Failed to write order data to disk:", writeErr);
            }

            // Trigger Email notification in background
            sendEmailNotification(newOrder).catch(err => console.error("Email notify fail:", err));

            // Trigger SMS notifications in background
            const itemsShortText = cart.map(item => `${item.name} x${item.quantity}`).join(', ');
            const smsText = `Dishvana Order #${orderId} by ${customer.name} (${customer.phone}). Total: LKR ${total.toLocaleString()}. Items: ${itemsShortText}. Method: ${paymentMethod.toUpperCase()}`;
            sendSMSNotification(process.env.SHOP_OWNER_PHONE || '+94771234567', smsText).catch(err => console.error("SMS notify fail:", err));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, orderId }));
        });
        return;
    }

    // API: Fetch current orders list
    if (req.method === 'GET' && req.url === '/api/orders') {
        let orders = [];
        if (fs.existsSync(ORDERS_FILE)) {
            try {
                orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8') || '[]');
            } catch (e) {
                console.error(e);
            }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(orders));
        return;
    }

    // API: Fetch simulated notification inbox logs
    if (req.method === 'GET' && req.url === '/api/admin/notifications') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(notificationLogs));
        return;
    }

    // API: Reset admin database
    if (req.method === 'POST' && req.url === '/api/admin/clear') {
        try {
            fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
            notificationLogs = [];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // Serve static files
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Safety check to prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log("==============================================================");
        console.log(` Dishvana Colombo - Modern Demo Server running at:`);
        console.log(` http://localhost:${PORT}/`);
        console.log("==============================================================");
        console.log("Press Ctrl+C to stop the server.");
    });
}

module.exports = server;
