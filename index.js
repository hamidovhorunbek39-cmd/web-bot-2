// Yagona fayl (index.js)
// Telegram bot (node-telegram-bot-api) uchun, Admin Panel va Broadcast funksiyalari bilan.

// 1. Kerakli kutubxonalarni yuklash
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

// 2. Token va Admin ID
// !!! DIQQAT: Token va ADMIN_CHAT_ID o'zgartirilishi kerak!
const TOKEN = "8174118912:AAFG6Se1Nrvdc6ZjTWr5-1O72F5PGSfV65I";
const ADMIN_CHAT_ID = "8268245837"; // Sizning shaxsiy Admin ID'ingiz

// ----------------------------------------------------
// GLOBAL HOLAT UCHUN O'ZGARMALAR
// ----------------------------------------------------
const ADMIN_PENDING_MESSAGE = {}; // Admin xabari vaqtinchalik saqlanadi.

// ----------------------------------------------------
// TAYYOR REKLAMA VARIANTLARI (10 ta)
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
// ----------------------------------------------------
const AI_RESPONSES_MAPPING = {
  // [Kalit so'zlar ro'yxati] : "Javob matni"

  // 1. SALOMLASHISH
  "salom|assalom|qalaysan|qale|qanaqa":
    "Va alaykum assalom! Botimizga xush kelibsiz. Qanday yordam bera olaman? 😊",
  "xayrli tong|kun|kech":
    "Sizga ham xayrli kun! Qanday savol bilan murojaat qildingiz?",
  "yaxshi|zo'r|charchamadi":
    "Rahmat, yaxshiman! Men AI, doim ishlayman. Siz qandaysiz?",
  "kim|nima|bot":
    "Men Telegram botiman, Ma'muriyat va foydalanuvchilar o'rtasidagi asosiy vositachiman.",

  // 2. XIZMATLAR
  "narx|pul|arzon|qancha|skidka|necha pul":
    "Narxlar haqida bilish uchun aniq mahsulot yoki xizmat nomini yozing, ma'muriyatga uzataman.",
  "aksiyalar|chegirma|akciya|skidka":
    "Hozirda qaysi mahsulotlar bo'yicha aksiyalar borligini Admindan so'rang.",
  "ish vaqti|o'chish|vaqt|soat":
    "Bizning ish vaqtimiz har kuni ertalab 9:00 dan kechki 18:00 gacha (Uzbekiston vaqti bilan).",
  "manzil|joy|adres|ofis":
    "Manzilimiz haqidagi ma'lumotlar uchun ma'muriyatga murojaat qiling, ular yordam berishadi. Biz Toshkent shahrida joylashganmiz.",
  "to'lov|plastik|click|payme":
    "Plastik karta (Uzcard/Humo), Click yoki Payme orqali to'lovlarni qabul qilamiz.",
  "kurs|dars|o'qish|trening":
    "Biz dasturlash, dizayn va til kurslarini taklif qilamiz. Batafsil ma'lumotni Adminga uzataman.",

  // 3. BOT HAQIDA
  "ishlayaptimi|muammo|xato|o'chgan":
    "Ha, men ayni damda ishlayapman va xabarlaringizni qabul qilishga tayyorman.",
  "dasturchi|yaratgan|kim yozgan":
    "Meni professional dasturchilar jamoasi yozgan.",
  "aloqa|tel|nomer|telefon":
    "Ma'muriyatning telefon raqami haqida so'rovni Adminga yuboraman, ular sizga aloqaga chiqadi.",
  "kanal|gruppa|instagram|facebook":
    "Bizning ijtimoiy tarmoqlardagi sahifalarimizni Admindan so'rang.",

  // 4. XAYRLASHISH VA MINNATDORCHILIK
  "raxmat|tashakkur|kattakon|minnatdor":
    "Arzimaydi! Xizmat qilishdan xursandman. Yana biror savol bo'lsa, bemalol yozing.",
  "ajoyib|yaxshi|ok|qoyil":
    "Xursandman! Doim yaxshi xizmat qilishga intilamiz. Kuningiz xayrli o'tsin.",
  "xayr|ko'rishguncha|salomat|do svidaniya":
    "Xayr! Yana keling. Agar muhim xabar bo'lsa, Adminga uzataman.",

  // 5. BOSHQA SAVOLLAR
  "yordam|kerak|qanday":
    "Albatta, qanday masala bo'yicha yordam kerak? Savolingizni to'liqroq yozing, Adminga yetkazaman.",
  "shikoyat|norozilik|muammolar":
    "Shikoyatingizni to'liq matnda yozing, albatta ma'muriyatga uzataman.",
  "taklif|fikr|maslahat": "Taklifingiz uchun rahmat! Uni Adminga yetkazaman.",
  "ob-havo|vaqt|soat|bugun":
    "Kechirasiz, men ob-havo ma'lumotlarini tekshira olmayman. Savolingizni adminga uzatishimni xohlaysizmi?",
  "nechta odam|soni":
    "Botdan foydalanuvchilar soni haqida ma'lumotni Adminga uzataman.",
};

// ----------------------------------------------------
// YORDAMCHI FUNKSIYALAR (Qisqartma/Xato tuzatish uchun) - YANGI
// ----------------------------------------------------

/**
 * Matndagi ba'zi keng tarqalgan xato yozuvlarni (W, Q, X, H) to'g'ri o'zbek lotiniga moslashtiradi.
 * @param {string} text - Foydalanuvchi matni.
 * @returns {string} - Normalizatsiya qilingan matn.
 */
function normalizeText(text) {
  if (!text) return "";
  let normalized = text.toLowerCase();

  // Keng tarqalgan xato yozuvlarni tuzatish
  normalized = normalized.replace(/sh/g, "w"); // sh o'rniga w yozsa
  normalized = normalized.replace(/ch/g, "4"); // ch o'rniga 4 yozsa (misol)

  // W, Q, X, H, G kabi harflarni moslashtirish (agar odamlar uni noto'g'ri ishlatgan bo'lsa)
  normalized = normalized
    .toLowerCase()
    .replace(/w/g, "sh") // W -> sh (misol: "wunchaki")
    .replace(/ch/g, "c") // ch o'rniga c (misol: "cerez")
    .replace(/yerdam/g, "yordam") // Yordam so'zidagi xato
    .replace(/qanday/g, "qanaqa") // "Qanday" o'rniga "Qanaqa"
    .replace(/x/g, "h") // x o'rniga h (misol: xizmat -> hizmat)
    .replace(/o'/g, "o") // o' o'rniga o
    .replace(/g'/g, "g"); // g' o'rniga g

  // Matnni juda qisqa bo'lsa, xato normalizatsiya qilmaslik uchun.

  return normalized;
}

/**
 * AI javoblar lug'atidan mos javobni topadi (kalit so'zlar bo'yicha).
 * @param {string} text - Foydalanuvchi yuborgan matn.
 * @returns {string | null} - Javob matni yoki null.
 */
function getAiResponse(text) {
  // 1. Matnni normalizatsiya qilish (xato/qisqartma tuzatish)
  const normalizedText = normalizeText(text);

  // 2. Tozalash (raqamlar, tinish belgilari)
  const cleanedText = normalizedText
    .toLowerCase()
    .trim()
    .replace(/[.,?!]/g, "");

  for (const keywordsString in AI_RESPONSES_MAPPING) {
    // Kalit so'zlar ro'yxatini ajratib olish (pipe | orqali)
    const keywords = keywordsString.split("|");

    for (const keyword of keywords) {
      const trimmedKeyword = keyword.trim();
      // Agar tozalangan matn kalit so'zni o'z ichiga olsa (qisman moslik)
      if (cleanedText.includes(trimmedKeyword)) {
        // Qo'shimcha tekshiruv: "pul" kaliti "pulla" so'zini qamrab olishi kerak.
        // Qisqa so'zlar uchun aynan mos kelishga yaqinlashamiz.

        // Masalan, agar kalit so'z 3 harfdan qisqa bo'lsa, uni alohida so'z sifatida qidiramiz
        if (trimmedKeyword.length <= 3) {
          const regex = new RegExp(`\\b${trimmedKeyword}\\b`);
          if (regex.test(cleanedText)) {
            return AI_RESPONSES_MAPPING[keywordsString];
          }
        } else {
          // Uzunroq so'zlar uchun qisman moslik etarli
          return AI_RESPONSES_MAPPING[keywordsString];
        }
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

userIds = loadUserIds();
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
  if (adminId !== ADMIN_CHAT_ID.trim()) {
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

  if (adminId !== ADMIN_CHAT_ID.trim()) {
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
  const adminIdString = ADMIN_CHAT_ID.trim();
  const currentChatIdString = String(chatId); // 1. ID saqlash

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
  }

  // STSENARIY B: YUBORUVCHI — ODDIY FOYDALANUVCHI (AI Javob yoki Adminga uzatish)
  if (currentChatIdString !== adminIdString) {
    // 2.1. AI Javob Bazasi orqali tekshirish (qisqartmalarni ham tekshiradi)
    const aiResponse = getAiResponse(userText);
    if (aiResponse) {
      bot.sendMessage(chatId, aiResponse, { parse_mode: "Markdown" });
      return; // Agar AI javob bergan bo'lsa, Adminga uzatish shart emas
    }

    // 2.2. Agar AI javob topmasa, xabarni Adminga uzatish
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
    bot.sendMessage(adminIdString, adminNotification, {
      parse_mode: "Markdown",
    });
  }
  // STSENARIY A: YUBORUVCHI — ADMIN (E'lonni yuborishni tasdiqlash)
  else {
    ADMIN_PENDING_MESSAGE[adminIdString] = userText;

    const allUsersSet = loadUserIds();
    const allUsers = Array.from(allUsersSet).filter(
      (id) => String(id) !== adminIdString
    );
    const inlineKeyboard = [];
    let targetChatId = null;

    const repliedMessage = msg.reply_to_message;
    if (repliedMessage && repliedMessage.text) {
      const match = repliedMessage.text.match(/💬 \*Chat ID:\* `(\d+)`/);

      if (match && match[1]) {
        targetChatId = match[1];
        inlineKeyboard.push([
          {
            text: `↩️ Faqat Shu Foydalanuvchiga Javob Berish (${targetChatId})`,
            callback_data: `FORWARD_${targetChatId}`,
          },
        ]);
      }
    }

    const recentUsers = allUsers
      .filter((id) => String(id) !== targetChatId)
      .slice(-5)
      .reverse();

    if (recentUsers.length > 0 || targetChatId) {
      inlineKeyboard.push([
        {
          text: "--- YAKKA YUBORISH VARIANTLARI ---",
          callback_data: "ignore_header_1",
        },
      ]);

      recentUsers.forEach((userId) => {
        inlineKeyboard.push([
          {
            text: `👤 Eng So'nggi Foydalanuvchi: ${userId}`,
            callback_data: `FORWARD_${userId}`,
          },
        ]);
      });
    }
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
  }
});

// Xatolar uchun ishlov berish
bot.on("polling_error", (err) => {
  // 409 Conflict xatosini e'tiborsiz qoldirish
  if (!err.message.includes("409 Conflict")) {
    console.error("Polling xatosi:", err.message);
  }
});
