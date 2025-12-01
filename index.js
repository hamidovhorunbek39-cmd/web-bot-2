// Yagona fayl (index.js)
// Telegram bot (node-telegram-bot-api) uchun, Admin Panel va Broadcast funksiyalari bilan.

// 1. Kerakli kutubxonalarni yuklash
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

// 2. Token va Admin ID
// !!! DIQQAT: Token va ADMIN_CHAT_ID o'zgartirilishi kerak!
const TOKEN = "8174118912:AAFG6Se1Nrvdc6ZjTWr5-1O72F5PGSfV65I";
const ADMIN_CHAT_ID = "8268245837"; // Sizning shaxsiy Admin ID'ingiz

// ----------------------------------------------------
// GLOBAL HOLAT UCHUN O'ZGARMALAR
// ----------------------------------------------------
// Admin yozgan xabarni keyingi bosqichda ishlatish uchun vaqtinchalik saqlaymiz.
const ADMIN_PENDING_MESSAGE = {}; // {adminChatId: 'Saqlangan xabar matni'}

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
// TAYYOR AI JAVOBLAR LUG'ATI (50+ savol-javob)
// ----------------------------------------------------
const AI_RESPONSES = {
  // === SALOMLASHISH VA ILK SAVOLLAR ===
  salom:
    "Va alaykum assalom! Botimizga xush kelibsiz. Qanday yordam bera olaman? 😊",
  "assalomu alaykum":
    "Va alaykum assalom! Xizmatingizga tayyorman. Savolingizni yuboring.",
  "xayrli tong": "Sizga ham xayrli tong! Buguningiz omadli kelsin.",
  "xayrli kun": "Xayrli kun! Qanday savol bilan murojaat qildingiz?",
  qalesiz: "Rahmat, yaxshiman! Men AI, doim ishlayman. Siz qandaysiz?",
  yaxshimisiz: "Rahmat, yaxshiman! Sizga qanday yordam bera olaman?",
  "kim siz":
    "Men Telegram botiman, Ma'muriyat va foydalanuvchilar o'rtasidagi asosiy vositachiman.",
  "nima qilasiz":
    "Men oddiy xabarlarni Adminga uzataman, Admindan kelgan xabarlarni tarqataman va ba'zi savollarga avtomatik javob beraman.",
  "yordam kerak":
    "Albatta, qanday masala bo'yicha yordam kerak? Savolingizni to'liqroq yozing, Adminga yetkazaman.",

  // === XIZMATLAR VA KOMPANIYA HAQIDA ===
  "ish vaqti":
    "Bizning ish vaqtimiz har kuni ertalab 9:00 dan kechki 18:00 gacha (Uzbekiston vaqti bilan).",
  manzil:
    "Manzilimiz haqidagi ma'lumotlar uchun ma'muriyatga murojaat qiling, ular yordam berishadi. Biz Toshkent shahrida joylashganmiz.",
  ofis: "Ofisimizning joylashuvini aniqlash uchun Adminga aniq so'rov yuboring.",
  narxlar:
    "Narxlar haqida bilish uchun aniq mahsulot yoki xizmat nomini yozing, ma'muriyatga uzataman.",
  "to'lov usullari":
    "Plastik karta (Uzcard/Humo), Click yoki Payme orqali to'lovlarni qabul qilamiz.",
  aksiya:
    "Hozirda qaysi mahsulotlar bo'yicha aksiyalar borligini Admindan so'rang.",
  chegirma:
    "Eng so'nggi chegirmalar haqida ma'lumot olish uchun 'chegirmalar' so'zini yozing, Adminga uzataman.",
  "qanday kurslar":
    "Biz dasturlash, dizayn va til kurslarini taklif qilamiz. Batafsil ma'lumotni Adminga uzataman.",
  "boshqa savol":
    "Agar boshqa savolingiz bo'lsa, bemalol yozing. Adminga yuborilishini tekshiraman.",
  "qanaqa xizmatlar":
    "Biz keng turdagi xizmatlarni taklif etamiz. Savolingizni aniqlashtiring, iltimos.",

  // === TEXNIK SAVOLLAR ===
  "bot ishlayaptimi":
    "Ha, men ayni damda ishlayapman va xabarlaringizni qabul qilishga tayyorman.",
  "token nima":
    "Token - bu botni boshqarish uchun kerak bo'ladigan maxfiy kalit. Uni tarqatmang!",
  "bot yaratish":
    "Bot yaratish xizmati bo'yicha Adminga murojaat qiling, ular sizga yordam berishadi.",
  "chat id":
    "Sizning Chat ID'ingizni Ma'muriyat xabarlaringizni yuborganda ko'radi.",
  "bot qanday yasalgan":
    "Men Node.js va node-telegram-bot-api kutubxonasida yasalganman.",

  // === XAYRLASHISH VA MINNATDORCHILIK ===
  raxmat:
    "Arzimaydi! Xizmat qilishdan xursandman. Yana biror savol bo'lsa, bemalol yozing.",
  "kattakon rahmat": "Sizga ham tashakkur! Kuningiz xayrli o'tsin.",
  ajoyib: "Minnatdorman! Sizning bahoingiz biz uchun muhim. 😊",
  zor: "Xursandman! Doim yaxshi xizmat qilishga intilamiz.",
  xayr: "Xayr! Yana keling. Agar muhim xabar bo'lsa, Adminga uzataman.",

  // === QIZIQARLI VA NOODATIY SAVOLLAR (Qo'shimcha) ===
  "ob-havo":
    "Kechirasiz, men ob-havo ma'lumotlarini tekshira olmayman, lekin xohlasangiz Adminga uzataman.",
  "kim g'olib":
    "Qaysi musobaqa haqida gapiryapsiz? Savolingizni aniqlashtiring, Adminga yuboraman.",
  charchamadizmi:
    "Men sun'iy intellektman, charchoq nimaligini bilmayman. Doim xizmatingizga tayyor!",
  "soat nechchi":
    "Men aniq vaqtni ko'rsata olmayman, iltimos, o'z qurilmangizdagi soatga qarang.",
  "sizni kim yozgan": "Meni Jamshid ismli dasturchi yozgan.",
  "sevimli ovqatingiz":
    "Mening ovqatlanishim shart emas, chunki men dasturiy kodman! 😉",
  mashina:
    "Yangi mashinalar narxi va kredit shartlari haqida Admindan so'rang.",
  "telefon nomeri":
    "Ma'muriyatning telefon raqami haqida so'rovni Adminga yuboraman, ular sizga aloqaga chiqadi.",
  instagram: "Bizning ijtimoiy tarmoqlardagi sahifalarimizni Admindan so'rang.",
  yangiliklar:
    "Eng so'nggi yangiliklar bo'yicha Adminga so'rov yuborishingiz mumkin.",
  "qabul vaqti":
    "Ma'muriyat qabul vaqtlari bo'yicha so'rovni Adminga uzataman.",
  "kurslarga yozilish":
    "Kurslarga ro'yxatdan o'tish uchun Adminga murojaat qiling.",
  "o'qish narxi": "Kurslarning narxi bo'yicha so'rovni Adminga yuboraman.",
  "qanaqa talablar":
    "Kurslarga qabul qilish shartlari bo'yicha Admindan so'rang.",
  muammo: "Qanday muammo yuz berdi? Batafsil yozing, Adminga yetkazaman.",
  shikoyat:
    "Shikoyatingizni to'liq matnda yozing, albatta ma'muriyatga uzataman.",
  taklif: "Taklifingiz uchun rahmat! Uni Adminga yetkazaman.",
  "nechta odam":
    "Botdan foydalanuvchilar soni haqida ma'lumotni Adminga uzataman.",
};

/**
 * AI javoblar lug'atidan mos javobni topadi.
 * @param {string} text - Foydalanuvchi yuborgan matn.
 * @returns {string | null} - Javob matni yoki null.
 */
function getAiResponse(text) {
  // Matnni kichik harflarga o'tkazamiz va bo'shliqlarni olib tashlaymiz
  const cleanedText = text.toLowerCase().trim();
  for (const key in AI_RESPONSES) {
    // Lug'atdagi kalit so'zni o'z ichiga olsa javob qaytarish
    if (cleanedText.includes(key)) {
      return AI_RESPONSES[key];
    }
  }
  return null;
}

// ----------------------------------------------------
// FAYL TIZIMI FUNKSIYALARI (ID SAQLASH) - MUSTAHKAMLANGAN
// ----------------------------------------------------
const USER_IDS_FILE = "user_ids.json";
let userIds = new Set();

function loadUserIds() {
  try {
    if (fs.existsSync(USER_IDS_FILE)) {
      const data = fs.readFileSync(USER_IDS_FILE, "utf8");
      if (data.trim() === "") {
        console.warn("⚠️ user_ids.json fayli bo'sh. Bo'sh Set qaytarilmoqda.");
        return new Set();
      }

      try {
        const parsedData = JSON.parse(data);
        if (!Array.isArray(parsedData)) {
          throw new Error("JSON Array emas");
        }
        return new Set(parsedData.map(String));
      } catch (jsonError) {
        console.error(
          "❌ Xato: user_ids.json ichidagi JSON ma'lumotlar noto'g'ri formatda yoki bo'sh:",
          jsonError.message
        );
        return new Set();
      }
    } else {
      // Fayl mavjud bo'lmasa, bo'sh fayl yaratish
      fs.writeFileSync(USER_IDS_FILE, "[]", "utf8");
      return new Set();
    }
  } catch (error) {
    console.error(
      "❌ Xato: Foydalanuvchi ID'larini o'qishda yoki fayl yaratishda xato:",
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
    console.error("❌ Xato: Foydalanuvchi ID'larini saqlashda xato:", error);
  }
}

// XATO ANIQLANGAN JOY. Bu qator endi ishlaydi.
userIds = loadUserIds();
console.log(`Bot ishga tushdi. Yuklangan foydalanuvchilar: ${userIds.size}`);

// ----------------------------------------------------
// BOTNI ISHGA TUSHIRISH
// ----------------------------------------------------
const bot = new TelegramBot(TOKEN, { polling: true });
console.log("Bot ishga tushdi va xabarlarni kutmoqda...");

// --- /start buyrug'i ---
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const chatIdString = String(chatId);
  if (!userIds.has(chatIdString)) {
    userIds.add(chatIdString);
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
// Barcha Matnli Xabarlarga Ishlov Berish (Uzatmalar, Elon/Reply va AI javob)
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

  // STSENARIY B: YUBORUVCHI — ODDIY FOYDALANUVCHI (AI javob yoki Adminga uzatish)
  if (currentChatIdString !== adminIdString) {
    // 1. AI Javob Bazasi orqali tekshirish
    const aiResponse = getAiResponse(userText);
    if (aiResponse) {
      bot.sendMessage(chatId, aiResponse, { parse_mode: "Markdown" });
      return; // Agar AI javob bergan bo'lsa, Adminga uzatish shart emas
    }

    // 2. Agar AI javob topmasa, xabarni Adminga uzatish
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
    return;
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
    } // 2. BOSHQA FOYDALANUVCHILAR ro'yxatidan tugmalar yaratish (oxirgi 5 ta)

    const recentUsers = allUsers
      .filter((id) => String(id) !== targetChatId)
      .slice(-5)
      .reverse();

    if (recentUsers.length > 0 && (recentUsers.length > 0 || targetChatId)) {
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
    } // 3. "Hammasiga" tugmasi
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
bot.on("polling_error", (err) => console.error("Polling xatosi:", err.message));
