const venom = require("venom-bot");

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

venom.create({
    session: "worldtelecom",
    headless: true,
    useChrome: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
}).then((client) => start(client)).catch((err) => console.error(err));

function start(client) {
    console.log("Bot hazırdır!");
    resetDaily();

    client.onMessage(async (message) => {
        if (message.isGroupMsg) return;
        const sender = message.from;
        if (respondedToday.has(sender)) return;
        respondedToday.add(sender);
        await client.sendText(sender,
            "Salam hər vaxtınız xeyir. World Telecom şirkətinin əməkdaşı ilə əlaqə saxlamısınız. Tezliklə sizinlə əlaqə saxlanılacaq."
        );
        console.log("Cavab verildi:", sender);
    });
}