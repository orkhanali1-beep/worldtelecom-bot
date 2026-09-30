const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");

let respondedToday = new Set();

function resetDaily() {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    setTimeout(() => {
        respondedToday.clear();
        console.log("Gün sıfırlandı");
        resetDaily();
    }, msUntilMidnight);
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }),
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log("QR KOD - WhatsApp ilə scan edin:");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") {
            console.log("Bot qoşuldu!");
            resetDaily();
        }
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Yenidən qoşulur...");
                startBot();
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        if (msg.key.fromMe) return;
        if (msg.key.remoteJid.endsWith("@g.us")) return;

        const sender = msg.key.remoteJid;
        if (respondedToday.has(sender)) return;

        respondedToday.add(sender);

        await sock.sendMessage(sender, {
            text: "Salam hər vaxtınız xeyir. World Telecom şirkətinin əməkdaşı ilə əlaqə saxlamısınız. Tezliklə sizinlə əlaqə saxlanılacaq."
        });

        console.log("Cavab verildi:", sender);
    });
}

startBot();