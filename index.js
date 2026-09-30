const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Hər gün cavab verilən nömrələri saxlayır
let respondedToday = new Set();

// Gecə yarısı sıfırla
function resetDaily() {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    setTimeout(() => {
        respondedToday.clear();
        console.log('Gün sıfırlandı - yeni cavablar başlayır');
        resetDaily();
    }, msUntilMidnight);
}

client.on('qr', (qr) => {
    console.log('QR kodu scan edin:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot hazırdır! WhatsApp bağlandı.');
    resetDaily();
});

client.on('message', async (message) => {
    if (message.from.endsWith('@g.us')) return;
    const sender = message.from;
    if (respondedToday.has(sender)) return;
    respondedToday.add(sender);
    await message.reply(
        'Salam hər vaxtınız xeyir. World Telecom şirkətinin əməkdaşı ilə əlaqə saxlamısınız. Tezliklə sizinlə əlaqə saxlanılacaq.'
    );
    console.log(`Cavab verildi: ${sender}`);
});

client.initialize();