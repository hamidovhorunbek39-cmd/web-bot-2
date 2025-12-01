// Yagona fayl (index.js) - AI javoblari matnning istalgan qismida ishlashi uchun kengaytirilgan.

// 1. Kerakli kutubxonalarni yuklash
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

// 2. Token va Admin ID
// !!! DIQQAT: Token va ADMIN_CHAT_ID o'zgartirilishi kerak!
const TOKEN = "8174118912:AAFG6Se1Nrvdc6ZjTWr5-1O72F5PGSfV65I";
const ADMIN_CHAT_ID = "8268245837"; // << BU YERGA O'ZINGIZNING TELEGRAM ID'ingizni QO'YING!
const ADMIN_CHAT_ID_STRING = String(ADMIN_CHAT_ID).trim(); // String turida saqlaymiz

// ----------------------------------------------------
// GLOBAL HOLAT UCHUN O'ZGARMALAR
// ----------------------------------------------------
const ADMIN_PENDING_MESSAGE = {};

// ----------------------------------------------------
// TAYYOR REKLAMA VARIANTLARI (10 ta)
// (Bu qism o'zgarishsiz qoldi)
// ----------------------------------------------------
const ADS_DATA = [
  {
    imageUrl:
      "https://media.rbcdn.ru/media/upload_tmp/2018/lauren-fleischmann-r2aodqjn3b8-unsplash.jpg",
    price: "99 000 so'm",
    description:
      "Yozgi chegirmalar boshlandi! Barcha kiyimlarga 50% gacha chegirma. Tezroq ulguring!",
    tag: "#Chegirma #YozgiAksiya",
  },
  {
    imageUrl:
      "https://jamshid91.github.io/myResume.github.io/assets/img/codeclass.jpg",
    price: "Bepul",
    description:
      "IT kurslarimizga ro'yxatdan o'ting va birinchi darsga bepul qatnashing. Keling va dasturlash olamini kashf eting!",
    tag: "#ITKurslari #BepulDars",
  },
  {
    imageUrl:
      "https://mobidevices.com/images/2022/01/Acer-Predator-Helios-300.jpeg",
    price: "3 500 000 so'm",
    description:
      "Yangi avlod noutbuklari keldi! Eng kuchli protsessorlar va yuqori tezlik. Kreditga olish imkoniyati mavjud.",
    tag: "#Texnika #Noutbuklar",
  },
  {
    imageUrl:
      "https://wallpapers.com/images/hd/1920x1080-desserts-background-k93ze62oiipumrm0.jpg",
    price: "15 000 so'm",
    description:
      "Eng shirin kofe va yangi pishiriqlar! Faqat shu hafta ertalabki maxsus narx.",
    tag: "#Kofe #Pishiriqlar",
  },
  {
    imageUrl:
      "https://i.pinimg.com/originals/bf/d5/45/bfd545fbe208315eb52524a2bc274989.jpg",
    price: "450 000 so'm",
    description:
      "Professional fotosessiya xizmati! Oilaviy, to'y va portret fotosessiyalari uchun bron qiling.",
    tag: "#Fotosessiya #Fotograf",
  },
  {
    imageUrl:
      "https://i2.wp.com/www.mathematics.lk/wp-content/uploads/2020/06/Learn-Online-English.jpg",
    price: "14 kunlik sinov",
    description:
      "Ingliz tili onlayn kurslariga yoziling! 14 kunlik bepul sinov darsi mavjud.",
    tag: "#InglizTili #OnlineKurs",
  },
  {
    imageUrl:
      "https://s.yimg.com/ny/api/res/1.2/vj1YuR8_yt1zxVEY1etfQg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTk2MDtoPTUxOQ--/https://media.zenfs.com/en/car_and_driver_581/1383fa250256fa960fc9df0ddb36f3bc",
    price: "50 000 so'm/soat",
    description:
      "Avtomobilingiz uchun kimyoviy tozalash xizmati. Sifat va tezlik kafolati!",
    tag: "#AvtoXizmat #Himchistka",
  },
  {
    imageUrl: "https://i.ytimg.com/vi/JGsB0fCHh0Y/maxresdefault.jpg",
    price: "20%",
    description:
      "Barcha smartfon aksessuarlariga 20% chegirma! Faqat bir kun amal qiladi.",
    tag: "#Smartfon #Aksessuarlar",
  },
  {
    imageUrl:
      "https://mebelmarket.su/upload/iblock/251/06is9y9g8rm8l7loz07z2jgl2oa1x1t9.webp",
    price: "Boshlang'ich narx 70$",
    description:
      "Mebel buyurtma qilish! Eng zamonaviy dizaynlar va yuqori sifatli materiallar.",
    tag: "#Mebel #Buyurtma",
  },
  {
    imageUrl:
      "https://media.zenfs.com/en/parade_250/005ebd90537e73269a6563a39075d1fe",
    price: "10 000 so'm",
    description:
      "Yangi kitoblar keldi! Har qanday janrdagi eng sara asarlar to'plami.",
    tag: "#Kitoblar #Yangi",
  },
];

// ----------------------------------------------------
// KENGAYTIRILGAN AI JAVOBLAR LUG'ATI
// (Bu qism ham o'zgarishsiz qoldi, sababi u yetarlicha yaxshi tuzilgan)
// ----------------------------------------------------
const AI_RESPONSES_MAPPING = {
  // [Kalit so'zlar ro'yxati] : "Javob matni"

  // 1. SALOMLASHISH VA HOL SO'RASH
  "salom|assalom|qale|qanisan|salom alekum|wassalom|sallom|sa|as|a.s|v.a.s":
    "Va alaykum assalom! Botimizga xush kelibsiz. Qanday yordam bera olaman? 😊",
  "xayrli tong|kun|kech|ertalan|tush|oqshom":
    "Sizga ham xayrli kun! Qanday savol bilan murojaat qildingiz?",
  "yaxshi|zo'r|charchamadi|yahshiman|zor|ok|norm|qanday|qanaqa|qalesan":
    "Rahmat, yaxshiman! Men AI, doim ishlayman. Siz qandaysiz?",
  "kim|nima|bot|siz|nega":
    "Men Telegram botiman, Ma'muriyat va foydalanuvchilar o'rtasidagi asosiy vositachiman.",
  "yordam|kerak|masla|maslahat|qaerga|nima qil":
    "Albatta, qanday masala bo'yicha yordam kerak? Savolingizni to'liqroq yozing, Adminga yetkazaman.",

  // 2. XIZMATLAR VA MOL/NARX
  "narx|pul|arzon|qancha|necha pul|summasi|qiymat|tannarx|skitka|chegirma|akciya|aksiya|tekin|nechi":
    "Narxlar va chegirmalar haqida bilish uchun aniq mahsulot yoki xizmat nomini yozing, ma'muriyatga uzataman.",
  "ish vaqti|o'chish|vaqt|soat|ishla|ochiladi|yopiladi":
    "Bizning ish vaqtimiz har kuni ertalab 9:00 dan kechki 18:00 gacha (Uzbekiston vaqti bilan).",
  "manzil|joy|adres|ofis|qayerda|kaerda|joylashuv|lokatsiya":
    "Manzilimiz haqidagi ma'lumotlar uchun ma'muriyatga murojaat qiling, ular yordam berishadi. Biz Toshkent shahrida joylashganmiz.",
  "to'lov|plastik|click|payme|karta|naqd|perevod|uzcard|humo":
    "Plastik karta (Uzcard/Humo), Click yoki Payme orqali to'lovlarni qabul qilamiz.",
  "kurs|dars|o'qish|trening|ustoz|mentor|savod|o'rgatish":
    "Biz dasturlash, dizayn va til kurslarini taklif qilamiz. Batafsil ma'lumotni Adminga uzataman.",
  "xizmat|qiliw|mahsulot|servis|nima bor|bor":
    "Biz keng turdagi xizmatlar va mahsulotlarni taklif etamiz. Savolingizni aniqlashtiring, iltimos.",
  "kredit|muddatli|bo'lib|bo'lib tolash|rassrochka":
    "Muddatli to'lov (rassrochka) imkoniyatlari bo'yicha ma'muriyatga murojaat qiling.",

  // 3. TEXNIK VA BOG'LANISH
  "ishlayaptimi|muammo|xato|o'chgan|bug|gluk|qotmoq":
    "Ha, men ayni damda ishlayapman va xabarlaringizni qabul qilishga tayyorman.",
  "dasturchi|yaratgan|kim yozgan|maker|developer|kod|program":
    "Meni professional dasturchilar jamoasi yozgan.",
  "aloqa|tel|nomer|telefon|raqam|kontakt|call|pochta":
    "Ma'muriyatning telefon raqami haqida so'rovni Adminga yuboraman, ular sizga aloqaga chiqadi.",
  "kanal|gruppa|instagram|facebook|twitter|ijtimoiy|sayt":
    "Bizning ijtimoiy tarmoqlardagi sahifalarimizni Admindan so'rang.",
  "admin|murojaat|bog'lanish|lichkaga|admin bilan|javob":
    "Ma'muriyat bilan bog'lanish uchun xabaringizni yozing, darhol uzataman.",
  "id|chatid|user id|mening id|telegram id":
    "Sizning Chat ID'ingizni Ma'muriyat xabarlaringizni yuborganda ko'radi.",

  // 4. MULOQOT VA QIZIQARLI SAVOLLAR
  "raxmat|tashakkur|kattakon|minnatdor|thanks|spasibo|zur rahmat":
    "Arzimaydi! Xizmat qilishdan xursandman. Yana biror savol bo'lsa, bemalol yozing.",
  "ajoyib|a'lo|yaxshi|ok|qoyil|gud|malades|barakalla":
    "Xursandman! Doim yaxshi xizmat qilishga intilamiz. Kuningiz xayrli o'tsin.",
  "xayr|ko'rishguncha|salomat|do svidaniya|gudbay|paka|chaqqon|korguncha":
    "Xayr! Yana keling. Agar muhim xabar bo'lsa, Adminga uzataman.",
  "shikoyat|norozilik|muammolar|ayb|notogri|xato":
    "Shikoyatingizni to'liq matnda yozing, albatta ma'muriyatga uzataman.",
  "taklif|fikr|maslahat|ideya|loyiha|maslahat bering":
    "Taklifingiz uchun rahmat! Uni Adminga yetkazaman.",
  "ob-havo|vaqt|soat|bugun|ertaga|qachon":
    "Kechirasiz, men ob-havo ma'lumotlarini tekshira olmayman. Savolingizni adminga uzatishimni xohlaysizmi?",
  "charchamadizmi|qalisan":
    "Men sun'iy intellektman, charchoq nimaligini bilmayman. Doim xizmatingizga tayyor!",
  "sevimli ovqatingiz|ovqat|ichimlik|nima":
    "Mening ovqatlanishim shart emas, chunki men dasturiy kodman! 😉",
  "nechta odam|soni|foydalanuvchi|azolar|nechta":
    "Botdan foydalanuvchilar soni haqida ma'lumotni Adminga uzataman.",
};

// ----------------------------------------------------
// YORDAMCHI FUNKSIYALAR (Qisqartma/Xato tuzatish uchun)
// ----------------------------------------------------

/**
 * Matndagi barcha lotin-kirill xatolarni tuzatadi va uni butunlay tozalaydi.
 * @param {string} text - Foydalanuvchi matni.
 * @returns {string} - Tozalangan matn.
 */
function normalizeText(text) {
  if (!text) return "";
  let normalized = text.toLowerCase();

  // 1. Keng tarqalgan lotin-kirill almashtirish (qo'shimcha himoya)
  normalized = normalized
    .replace(/a\.s/g, "assalom")
    .replace(/v\.a\.s/g, "assalom")
    .replace(/yerdam/g, "yordam")

    // Lotin maxsus harflarini oddiyga o'tkazish
    .replace(/oʻ|o‘/g, "o") // o'
    .replace(/gʻ|g‘/g, "g") // g'
    .replace(/sh/g, "s") // sh - s ga
    .replace(/ch/g, "c") // ch - c ga

    // Eng ko'p uchraydigan kirill-lotin xatolarini tuzatish
    .replace(/w/g, "v")
    .replace(/x/g, "h")
    .replace(/c/g, "ch")
    .replace(/q/g, "k") // q - k ga

    // Qisqa, juda mashhur qisqartmalarni to'liq so'zga almashtirish
    .replace(/\b(sa|as|a s)\b/g, "salom")
    .replace(/\b(qale)\b/g, "qalesan")

    // Barcha tinish belgilari, raqamlar va ortiqcha belgilar/bo'shliqlarni olib tashlash
    .replace(/[^a-z' ]/g, " ");

  // Matnda bir nechta bo'shliq bo'lsa, bittaga tushirish
  normalized = normalized.replace(/\s+/g, " ");

  return normalized.trim();
}

/**
 * AI javoblar lug'atidan mos javobni topadi. Matnning istalgan qismidagi so'zni topadi.
 * @param {string} text - Foydalanuvchi yuborgan matn.
 * @returns {string | null} - Javob matni yoki null.
 */
function getAiResponse(text) {
  // 1. Matnni tozalash va kichik harflarga o'tkazish
  const normalizedText = normalizeText(text);

  // 2. Tozalangan matndagi barcha so'zlarni olish
  const textWords = normalizedText.split(" ").filter((word) => word.length > 2); // 2 harfdan kichik so'zlarni e'tiborga olmaymiz (a, u, e kabi)

  for (const keywordsString in AI_RESPONSES_MAPPING) {
    // Kalit so'zlar ro'yxatini ajratish va tozalash
    const keywords = keywordsString.split("|").map((k) => normalizeText(k));

    for (const keyword of keywords) {
      const trimmedKeyword = keyword.trim();

      if (trimmedKeyword.length < 3) continue; // Agar kalit so'z juda qisqa bo'lsa o'tkazib yuborish

      // normalizedText ichida ushbu kalit so'z mavjudligini tekshirish
      // Bu qismi oldingi kodda to'g'ri ishlashi kerak edi, ammo tekshiruvni mustahkamlaymiz.
      if (normalizedText.includes(trimmedKeyword)) {
        return AI_RESPONSES_MAPPING[keywordsString];
      }
    }
  }
  return null;
}
// ----------------------------------------------------

// ----------------------------------------------------
// FAYL TIZIMI FUNKSIYALARI (ID SAQLASH)
// ----------------------------------------------------
const USER_IDS_FILE = "user_ids.json";
let userIds = new Set();

function loadUserIds() {
  try {
    if (fs.existsSync(USER_IDS_FILE)) {
      const data = fs.readFileSync(USER_IDS_FILE, "utf8");
      if (data.trim() === "") {
        return new Set();
      }
      try {
        // ID'larni String formatida o'qishni ta'minlaymiz
        return new Set(JSON.parse(data).map(String));
      } catch (jsonError) {
        console.error(
          "❌ Xato: JSON ma'lumotlar noto'g'ri formatda:",
          jsonError.message
        );
        return new Set();
      }
    } else {
      fs.writeFileSync(USER_IDS_FILE, "[]", "utf8");
      return new Set();
    }
  } catch (error) {
    console.error(
      "❌ Xato: Foydalanuvchi ID'larini o'qishda xato:",
      error.message
    );
  }
  return new Set();
}

function saveUserIds(userIds) {
  try {
    const data = JSON.stringify(Array.from(userIds), null, 2);
    fs.writeFileSync(USER_IDS_FILE, data, "utf8");
  } catch (error) {
    console.error("Foydalanuvchi ID'larini saqlashda xato:", error);
  }
}

userIds = loadUserIds(); // Bot ishga tushganda chaqiriladi
console.log(`Bot ishga tushdi. Yuklangan foydalanuvchilar: ${userIds.size}`);

// ----------------------------------------------------
// BOTNI ISHGA TUSHIRISH
// ----------------------------------------------------
const bot = new TelegramBot(TOKEN, { polling: true });
console.log("Bot ishga tushdi va xabarlarni kutmoqda...");

// --- /start buyrug'i ---
bot.onText(/\/start/, (msg) => {
  const chatId = String(msg.chat.id);
  if (!userIds.has(chatId)) {
    userIds.add(chatId);
    saveUserIds(userIds);
  }
  const welcomeMessage = `
🌟 *Assalomu alaykum va Xush kelibsiz!* 🌟

Men sizning yordamchi botingizman.
Menga istalgan xabarni yuboring, u ma'muriyatga uzatiladi.

*Iltimos, o'zingizni qiziqtirgan savol yoki xabarni yuboring.* 🚀
    `;
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" });
});

// ----------------------------------------------------
// YORDAMCHI FUNKSIYA: E'LONNI TARQATISH
// ----------------------------------------------------
function sendBroadcastMessage(adminId, text, targetId = null) {
  const localUserIds = loadUserIds();
  const adminIdString = String(adminId).trim();

  let successCount = 0;
  let failCount = 0;
  let usersToSend = [];

  if (targetId === "ALL") {
    usersToSend = Array.from(localUserIds).filter(
      (id) => String(id) !== adminIdString
    );
    bot.sendMessage(
      adminId,
      `🚀 E'lon **${usersToSend.length}** ta foydalanuvchiga tarqatilmoqda...`,
      { parse_mode: "Markdown" }
    );
  } else if (targetId && String(targetId) !== adminIdString) {
    usersToSend.push(targetId);
    bot.sendMessage(
      adminId,
      `🚀 Xabar **${targetId}** Chat ID'ga yuborilmoqda...`,
      { parse_mode: "Markdown" }
    );
  } else {
    bot.sendMessage(
      adminId,
      `⚠️ Xato: Target ID (${targetId}) noto'g'ri yoki Admin ID. Tarqatish bekor qilindi.`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  const broadcastMessage = `
📣 **MA'MURİYAT XABARI** 📣
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
*Xabar:*
${text}
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
*Hurmat bilan, Ma'muriyat.*
    `;

  usersToSend.forEach((userId) => {
    bot
      .sendMessage(userId, broadcastMessage, { parse_mode: "Markdown" })
      .then(() => {
        successCount++;
      })
      .catch((error) => {
        failCount++;
        console.error(`Xabar ${userId} ga yuborishda xato: ${error.message}`);
      });
  });

  setTimeout(() => {
    const resultMessage = `*✅ Xabar Tarqatildi!* *👥 Muvaffaqiyatli:* ${successCount} ta *❌ Yetkazilmadi:* ${failCount} ta`;
    bot.sendMessage(adminId, resultMessage, { parse_mode: "Markdown" });
  }, 5000);

  delete ADMIN_PENDING_MESSAGE[adminId];
}

// ----------------------------------------------------
// MEDIA BROADCAST FUNKSIYASI (Reklama)
// ----------------------------------------------------
function sendRandomMediaBroadcast(adminId) {
  const localUserIds = loadUserIds();
  const adminIdString = String(adminId).trim();

  const randomIndex = Math.floor(Math.random() * ADS_DATA.length);
  const selectedAd = ADS_DATA[randomIndex];

  const { imageUrl, price, description, tag } = selectedAd;

  let successCount = 0;
  let failCount = 0;
  const allUsers = Array.from(localUserIds);

  const captionText = `
🔥 **MAXSUS REKLAMA TAKLIFI** 🔥
━━━━━━━━━━━━━━━━━━━━━
*🎁 Tavsif:* ${description}
💵 *Narxi:* **${price}**
━━━━━━━━━━━━━━━━━━━━━
${tag}

*Batafsil ma'lumot uchun Ma'muriyat bilan bog'laning!*
    `;

  bot.sendMessage(
    adminId,
    `🖼️ Tasodifiy reklama (*${randomIndex + 1}-variant*) *${
      allUsers.length - 1
    }* ta foydalanuvchiga tarqatilmoqda...`,
    { parse_mode: "Markdown" }
  );

  allUsers.forEach((userId) => {
    if (String(userId) !== adminIdString) {
      bot
        .sendPhoto(userId, imageUrl, {
          caption: captionText,
          parse_mode: "Markdown",
        })
        .then(() => {
          successCount++;
        })
        .catch((error) => {
          failCount++;
          console.error(
            `Reklama ${userId} ga yuborishda xato: ${error.message}`
          );
        });
    }
  });

  setTimeout(() => {
    const resultMessage = `
*✅ Reklama Tarqatildi!*
*👥 Yuborildi:* ${successCount} ta
*❌ Yetkazilmadi:* ${failCount} ta
        `;
    bot.sendMessage(adminId, resultMessage, { parse_mode: "Markdown" });
  }, 5000);
}

// ----------------------------------------------------
// MAXSUS BUYRUQ: /reklama UCHUN
// ----------------------------------------------------
bot.onText(/\/reklama$/, (msg) => {
  const adminId = String(msg.chat.id);
  if (adminId !== ADMIN_CHAT_ID_STRING) {
    return;
  }
  sendRandomMediaBroadcast(adminId);
});

// ----------------------------------------------------
// CALLBACK QUERY'GA ISHLOV BERISH (Tugmalar bosilganda)
// ----------------------------------------------------

bot.on("callback_query", (callbackQuery) => {
  const message = callbackQuery.message;
  const adminId = String(message.chat.id);
  const data = callbackQuery.data;

  if (adminId !== ADMIN_CHAT_ID_STRING) {
    bot.answerCallbackQuery(callbackQuery.id, "⚠️ Siz Admin emassiz!");
    return;
  }

  const pendingText = ADMIN_PENDING_MESSAGE[adminId];

  if (!pendingText) {
    bot.answerCallbackQuery(
      callbackQuery.id,
      "⚠️ Kechirasiz, tarqatiladigan xabar topilmadi!"
    );
    bot.editMessageText(
      `⚠️ *Xabar Tarqatish Bekor Qilindi*: Saqlangan xabar topilmadi. Qayta urinib ko'ring.`,
      {
        chat_id: adminId,
        message_id: message.message_id,
        parse_mode: "Markdown",
      }
    );
    return;
  }

  const parts = data.split("_");
  const action = parts[0];

  if (action === "FORWARD") {
    const target = parts[1]; // 'ALL' yoki 'chatId'

    bot
      .editMessageText(
        `*🚀 Xabar yuborilmoqda...* \n\n*Maqsad:* ${
          target === "ALL"
            ? "Barcha foydalanuvchilar"
            : `Foydalanuvchi ID: ${target}`
        }`,
        {
          chat_id: adminId,
          message_id: message.message_id,
          parse_mode: "Markdown",
        }
      )
      .catch((err) => console.error("Tugmani o'chirishda xato:", err.message));

    sendBroadcastMessage(adminId, pendingText, target);
  } else {
    bot.answerCallbackQuery(callbackQuery.id, "Tanlov qabul qilindi.");
  }
});

// ----------------------------------------------------
// Barcha Matnli Xabarlarga Ishlov Berish (Uzatmalar va Elon/Reply)
// ----------------------------------------------------
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;
  const currentChatIdString = String(chatId); // 1. ID saqlash (string formatida)
  if (!userIds.has(currentChatIdString)) {
    userIds.add(currentChatIdString);
    saveUserIds(userIds);
  } // 2. Buyruqlarni o'tkazib yuborish
  if (!userText || userText.startsWith("/")) {
    if (
      userText &&
      !userText.startsWith("/start") &&
      !userText.startsWith("/reklama")
    ) {
      bot.sendMessage(
        chatId,
        "⚠️ *Uzr, buyruq topilmadi!* Iltimos, oddiy matnli xabar yuboring.",
        { parse_mode: "Markdown" }
      );
    }
    return;
  } // STSENARIY B: YUBORUVCHI — ODDIY FOYDALANUVCHI (AI Javob yoki Adminga uzatish)
  if (currentChatIdString !== ADMIN_CHAT_ID_STRING) {
    // 2.1. AI Javob Bazasi orqali tekshirish (BIRINCHI QADAM)
    const aiResponse = getAiResponse(userText);
    if (aiResponse) {
      bot.sendMessage(chatId, aiResponse, { parse_mode: "Markdown" });
      return; // Agar AI javob bergan bo'lsa, Adminga uzatish SHART EMAS
    } // 2.2. Agar AI javob topmasa, xabarni Adminga uzatish
    const userName = msg.from.first_name || "Noma'lum foydalanuvchi";
    const userId = msg.from.id;

    const replyMessage = `
✍️ **Xabaringiz Qabul Qilindi, ${userName}!**

Ushbu xabar **tezkor ravishda Ma'muriyatga** yetkazildi. Tez orada javob kutib qoling. 🙏
        `;
    bot.sendMessage(chatId, replyMessage, { parse_mode: "Markdown" });

    const adminNotification = `
🔔 **YANGI XABAR KELDI**
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
👤 *Kimdan:* **${userName}** (\`${userId}\`)
💬 *Chat ID:* \`${chatId}\`
--------------------------------
*Xabar:*
\`\`\`
${userText}
\`\`\`
        `;
    bot.sendMessage(ADMIN_CHAT_ID_STRING, adminNotification, {
      parse_mode: "Markdown",
    });
  } // STSENARIY A: YUBORUVCHI — ADMIN (E'lonni yuborishni tasdiqlash)
  else {
    // Adminning oddiy xabarlari uchun AI javobini tekshirish
    const aiResponseForAdmin = getAiResponse(userText);
    if (aiResponseForAdmin) {
      bot.sendMessage(chatId, aiResponseForAdmin, { parse_mode: "Markdown" });
      return;
    } // Agar admin foydalanuvchining xabariga "reply" qilgan bo'lsa, javob stsenariysini boshlash

    const repliedMessage = msg.reply_to_message;
    if (repliedMessage && repliedMessage.text) {
      const match = repliedMessage.text.match(/💬 \*Chat ID:\* `(\d+)`/); // Xabar REPLY yordamida uzatilgan bo'lsa, E'lon paneli funksiyasini boshlash
      if (match && match[1]) {
        const targetChatId = match[1];
        ADMIN_PENDING_MESSAGE[ADMIN_CHAT_ID_STRING] = userText;

        const allUsersSet = loadUserIds();
        const allUsers = Array.from(allUsersSet).filter(
          (id) => String(id) !== ADMIN_CHAT_ID_STRING
        );
        const inlineKeyboard = [];
        inlineKeyboard.push([
          {
            text: `↩️ Faqat Shu Foydalanuvchiga Javob Berish (${targetChatId})`,
            callback_data: `FORWARD_${targetChatId}`,
          },
        ]);
        inlineKeyboard.push([
          {
            text: "------------------------------------",
            callback_data: "ignore_header_2",
          },
        ]);
        inlineKeyboard.push([
          {
            text: `📢 Hammasiga E'lon Qilish (${allUsers.length} kishi)`,
            callback_data: "FORWARD_ALL",
          },
        ]);
        const promptText = `*❓ Xabarni Qayerga Yuborish Kerak?*
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
*Matn:*
\`\`\`
${userText.substring(0, 100)}${userText.length > 100 ? "..." : ""}
\`\`\`

Iltimos, pastdagi variantlardan birini tanlang:`;

        bot.sendMessage(chatId, promptText, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        });
        return;
      }
    } // Admin tomonidan reply qilinmagan oddiy xabar bo'lsa
    if (!aiResponseForAdmin) {
      bot.sendMessage(
        chatId,
        "Buning uchun foydalanuvchining xabariga *reply* qiling, yoki /reklama buyrug'ini ishlating. Oddiy xabarlarga men avtomatik javob beraman.",
        { parse_mode: "Markdown" }
      );
    }
  }
});

// Xatolar uchun ishlov berish
bot.on("polling_error", (err) => {
  // 409 Conflict xatosini e'tiborsiz qoldirish
  if (!err.message.includes("409 Conflict")) {
    console.error("Polling xatosi:", err.message);
  }
  // Agar dastur to'xtab qolsa, bu yerga tushadi
});
