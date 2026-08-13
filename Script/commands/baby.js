const axios = require("axios");

const apiList = "https://raw.githubusercontent.com/shahadat-sahu/SAHU-API/refs/heads/main/SAHU-API.json";
let cachedSimsimUrl = null;

// API URL মেমরিতে ক্যাশ করার জন্য ফাংশন (যাতে বারবার গিটহাব রিকোয়েস্ট করে বট স্লো না হয়)
const getMainAPI = async () => {
  if (cachedSimsimUrl) return cachedSimsimUrl;
  try {
    const res = await axios.get(apiList);
    cachedSimsimUrl = res.data.simsimi;
    return cachedSimsimUrl;
  } catch (err) {
    console.error("Error fetching main API:", err.message);
    return null;
  }
};

module.exports.config = {
  name: "baby",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "ULLASH & FIXED",
  description: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion ☢️",
  commandCategory: "Chat",
  usages: "[message/query]",
  cooldowns: 2, // ২ সেকেন্ড কুলডাউন দেওয়া হলো স্প্যামিং কমানোর জন্য
  prefix: true
};

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const uid = event.senderID;
    const senderName = await Users.getNameUser(uid);
    const rawQuery = args.join(" ");
    const query = rawQuery.toLowerCase();
    const simsim = await getMainAPI();
    if (!simsim) return api.sendMessage("API currently unavailable. Try again later.", event.threadID, event.messageID);

    if (!query) {
      const ran = ["Bolo baby", "hum"];
      const r = ran[Math.floor(Math.random() * ran.length)];
      return api.sendMessage(r, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      });
    }

    const command = args[0].toLowerCase();

    if (["remove", "rm"].includes(command)) {
      const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
      if (parts.length < 2) return api.sendMessage("Use: remove [Question] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts.map(p => p.trim());
      const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (command === "list") {
      const res = await axios.get(`${simsim}/list`);
      if (res.data.code === 200) {
        return api.sendMessage(
          `♾ Total Questions Learned: ${res.data.totalQuestions}\n★ Total Replies Stored: ${res.data.totalReplies}\nDeveloper: ${res.data.author}`,
          event.threadID, event.messageID
        );
      } else return api.sendMessage(`Error: ${res.data.message}`, event.threadID, event.messageID);
    }

    if (command === "edit") {
      const parts = rawQuery.replace(/^edit\s*/i, "").split(" - ");
      if (parts.length < 3) return api.sendMessage("Use: edit [Q] - [Old] - [New]", event.threadID, event.messageID);
      const [ask, oldReply, newReply] = parts.map(p => p.trim());
      const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (command === "teach") {
      const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
      if (parts.length < 2) return api.sendMessage("Use: teach [Q] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts.map(p => p.trim());
      const groupID = event.threadID;
      let groupName = event.threadName ? event.threadName : "";
      try {
        if (!groupName && groupID != uid) {
          const threadInfo = await api.getThreadInfo(groupID);
          if (threadInfo?.threadName) groupName = threadInfo.threadName;
        }
      } catch {}

      let teachUrl = `${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}&groupID=${encodeURIComponent(groupID)}`;
      if (groupName) teachUrl += `&groupName=${encodeURIComponent(groupName)}`;
      const res = await axios.get(teachUrl);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
    const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

    for (const rep of replies) {
      await new Promise(resolve => {
        api.sendMessage(rep, event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "simsimi"
            });
          }
          resolve();
        }, event.messageID);
      });
    }

  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
  if (handleReply.type !== "simsimi") return;
  try {
    const senderName = await Users.getNameUser(event.senderID);
    const replyText = event.body ? event.body.toLowerCase() : "";
    if (!replyText) return;
    const simsim = await getMainAPI();
    if (!simsim) return;

    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`);
    const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

    for (const rep of replies) {
      await new Promise(resolve => {
        api.sendMessage(rep, event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "simsimi"
            });
          }
          resolve();
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    const raw = event.body ? event.body.toLowerCase().trim() : "";
    if (!raw) return;

    // যদি অলরেডি বটের মেসেজে কেউ রিপ্লাই দিয়ে কথা বলে, তবে ডাবল রিপ্লাই এড়াতে handleEvent ব্লক করা হলো
    if (event.type === "message_reply" && global.client.handleReply) {
      const replyInfo = global.client.handleReply.find(item => item.messageID === event.messageReply.messageID);
      if (replyInfo && replyInfo.name === module.exports.config.name) return;
    }

    const senderName = await Users.getNameUser(event.senderID);
    const senderID = event.senderID;
    const simsim = await getMainAPI();

    const greetings = [ "বেশি bot Bot করলে leave নিবো কিন্তু😒😒",
      "শুনবো না😼 তুমি আমার বস 𝐙𝐈𝐒𝐀𝐍 কে প্রেম করাই দাও নাই🥺পচা তুমি🥺",
      "আমি আবাল দের সাথে কথা বলি না,ok😒",
      "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈",
      "Bolo Babu, তুমি কি আমার বস 𝐙𝐈𝐒𝐀𝐍 কে ভালোবাসো? 🙈💋",
      "বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑",
      "হ্যা বলো😒, তোমার জন্য কি করতে পারি😐😑?",
      "এতো ডাকছিস কেন?গালি শুনবি নাকি? 🤬",
      "I love you janu🥰",
      "আরে Bolo আমার জান ,কেমন আছো?😚",
      "আজ বট বলে অসম্মান করছি,😰😿",
      "Hop beda😾,Boss বল boss😼",
      "চুপ থাক ,নাই তো তোর দাত ভেগে দিবো কিন্তু",
      "আমাকে না ডেকে মেয়ে হলে বস 𝐙𝐈𝐒𝐀𝐍 ইনবক্সে চলে যা 🌚😂 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/share/19Q5LKFUpA/",
      "আমাকে বট না বলে , বস 𝐙𝐈𝐒𝐀𝐍 কে জানু বল জানু 😘",
      "বার বার Disturb করছিস কোনো😾,আমার জানুর সাথে ব্যাস্ত আছি😋",
      "আরে বলদ এতো ডাকিস কেন🤬",
      "আমাকে ডাকলে ,আমি কিন্তু চুদে করে দিবো😘",
      "আমারে এতো ডাকিস না আমি মজা করার mood এ নাই এখন😒",
      "হ্যাঁ জানু , এইদিক এ আসো কিস দেই🤭 😘",
      "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣",
      "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
      "আমাকে ডেকো না,আমি বস 𝐙𝐈𝐒𝐀𝐍 সাথে ব্যাস্ত আছি",
      "কি হলো , মিস্টেক করচ্ছিস নাকি🤣",
      "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
      "জান মেয়ে হলে বস 𝐙𝐈𝐒𝐀𝐍 ইনবক্সে চলে যাও 😍🫣💕 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/share/19Q5LKFUpA/",
      "কালকে দেখা করিস তো একটু 😈",
      "হা বলো, শুনছি আমি 😏",
      "আর কত বার ডাকবি ,শুনছি তো",
      "হুম বলো কি বলবে😒",
      "বলো কি করতে পারি তোমার জন্য",
      "আমি তো অন্ধ কিছু দেখি না🐸 😎",
      "আরে বোকা বট না জানু বল জানু😌",
      "বলো জানু 🌚",
      "তোর কি চোখে পড়ে না আমি ব্যাস্ত আছি😒",
      "হুম জান তোমার ওই খানে উম্মহ😑😘",
      "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
      "jang hanga korba😒😬",
      "হুম জান তোমার অইখানে উম্মমাহ😷😘",
      "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি..!🥰",
      "ভালোবাসার নামক আবলামি করতে চাইলে বস 𝐙𝐈𝐒𝐀𝐍 ইনবক্সে গুতা দিন ~🙊😘🤣 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/share/19Q5LKFUpA/",
      "আমাকে এতো না ডেকে বস 𝐙𝐈𝐒𝐀𝐍 কে একটা gf দে 🙄",
      "আমাকে এতো না ডেকছ কেন ভলো টালো বাসো নাকি🤭🙈",
      "🌻🌺💚-আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ-💚🌺🌻",
      "আমি এখন বস 𝐙𝐈𝐒𝐀𝐍 এর সাথে বিজি আছি আমাকে ডাকবেন না-😕😏 ধন্যবাদ-🤝🌻",
      "আমাকে না ডেকে আমার বস 𝐙𝐈𝐒𝐀𝐍 কে একটা জি এফ দাও-😽🫶🌺",
      "ঝাং থুমালে আইলাপিউ পেপি-💝😽",
      "উফফ বুঝলাম না এতো ডাকছেন কেনো-😤😡😈",
      "জান তোমার বান্ধবী রে আমার বস 𝐙𝐈𝐒𝐀𝐍 হাতে তুলে দিবা-🙊🙆‍♂️",
      "আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না-😪🤧",
      "ঝাং 🫵থুমালে য়ামি রাইতে পালুপাসি উম্মম্মাহ-🌺🤤💦",
      "চুনা ও চুনা আমার বস 𝐙𝐈𝐒𝐀𝐍 এর হবু বউ রে কেও দেকছো খুজে পাচ্ছি না😪🤧😭",
      "স্বপ্ন তোমারে নিয়ে দেখতে চাই তুমি যদি আমার হয়ে থেকে যাও-💝🌺🌻",
      "জান হাঙ্গা করবা-🙊😝🌻",
      "জান মেয়ে হলে চিপায় আসো বস 𝐙𝐈𝐒𝐀𝐍 থেকে অনেক ভালোবাসা শিখছি তোমার জন্য-🙊🙈😽",
      "ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤🌼",
      "আমার বস 𝐙𝐈𝐒𝐀𝐍 পক্ষ থেকে তোমারে এতো এতো ভালোবাসা-🥰😽🫶 আমার বস 𝐙𝐈𝐒𝐀𝐍 জন্য দোয়া করবেন-💝💚🌺🌻",
      "- ভালোবাসা নামক আবলামি করতে মন চাইলে আমার বস 𝐙𝐈𝐒𝐀𝐍 এর ইনবক্স চলে যাও-🙊🥱👅 🌻𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐈𝐃 𝐋𝐈𝐍𝐊 🌻:- https://www.facebook.com/share/19Q5LKFUpA/",
      "আমার জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি-💝🌺😽",
      "কিরে প্রেম করবি তাহলে বস 𝐙𝐈𝐒𝐀𝐍 ইনবক্সে গুতা দে 😘🤌 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤🌼- https://www.facebook.com/share/19Q5LKFUpA/",
      "জান আমার বস কে বিয়ে করবা-🙊😘🥳",
      "-আন্টি-🙆-আপনার মেয়ে-👰‍♀️-রাতে আমারে ভিদু কল দিতে বলে🫣-🥵🤤💦",
      "oii-🥺🥹-এক🥄 চামচ ভালোবাসা দিবা-🤏🏻🙂",
      "-আপনার সুন্দরী বান্ধুবীকে ফিতরা হিসেবে আমার বস 𝐙𝐈𝐒𝐀𝐍 কে দান করেন-🥱🐰🍒",
      "-ও মিম ও মিম-😇-তুমি কেন চুরি করলা সাদিয়ার ফর্সা হওয়ার ক্রীম-🌚🤧",
      "-অনুমতি দিলাম-𝙋𝙧𝙤𝙥𝙤𝙨𝙚 কর বস 𝐙𝐈𝐒𝐀𝐍 কে-🐸😾🔪",
      "-编𝙂𝙖𝙮𝙚𝙨-🤗-যৌবনের কসম দিয়ে আমারে 𝐁𝐥𝐚𝐜𝐤𝐦𝐚𝐢𝐥 করা হচ্ছে-🥲🤦‍♂️🤧",
      "-𝗢𝗶𝗶 আন্টি-🙆‍♂️-তোমার মেয়ে চোখ মারে-🥺🥴🐸",
      "তাকাই আছো কেন চুমু দিবা-🙄🐸😘",
      "আজকে প্রপোজ করে দেখো রাজি হইয়া যামু-😌🤗😇",
      "-আমার গল্পে তোমার নানি সেরা-🙊🙆‍♂️🤗",
      "কি বেপার আপনি শ্বশুর বাড়িতে যাচ্ছেন না কেন-🤔🥱🌻",
      "দিনশেষে পরের 𝐁𝐎𝐖 সুন্দর-☹️🤧",
      "-তাবিজ কইরা হইলেও ফ্রেম এক্কান করমুই তাতে যা হই হোক-🤧🥱🌻",
      "-ছোটবেলা ভাবতাম বিয়ে করলে অটোমেটিক বাচ্চা হয়-🥱-ওমা এখন দেখি কাহিনী অন্যরকম-😦🙂🌻",
      "প্রেম করতে চাইলে বস  ইনবক্সে চলে যা 😏🐸 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/share/19Q5LKFUpA/",
      "-আজ একটা বিন নেই বলে ফেসবুকের নাগিন-🤧-গুলোরে আমার বস সাহু ধরতে পারছে না-🐸🥲",
      "-চুমু থাকতে তোরা বিড়ি খাস কেন বুঝা আমারে-😑😒🐸⚒️",
      "—যে ছেড়ে গেছে-😔-তাকে ভুলে যাও-🙂-আমার বস 𝐙𝐈𝐒𝐀𝐍 এর সাথে প্রেম করে তাকে দেখিয়ে দাও-🙈🐸🤗",
      "—হাজারো লুচ্চা লুচ্চির ভিরে-🙊🥵আমার বস 𝐙𝐈𝐒𝐀𝐍 এক নিস্পাপ ভালো মানুষ-🥱🤗🙆‍♂️",
      "-রূপের অহংকার করো না-🙂❤️চকচকে সূর্যটাও দিনশেষে অন্ধকারে পরিণত হয়-🤗💜",
      "সুন্দর মাইয়া মানেই-🥱আমার বস 𝐙𝐈𝐒𝐀𝐍'র বউ-😽🫶আর বাকি গুলো আমার বেয়াইন-🙈🐸🤗",
      "এত অহংকার করে লাভ নেই-🌸মৃত্যুটা নিশ্চিত শুধু সময়টা অ'নিশ্চিত-🖤🙂",
      "-দিন দিন কিছু মানুষের কাছে অপ্রিয় হয়ে যাইতেছি-🙂😿🌸",
      "ভালোবাসার নামক আবলামি করতে চাইলে বস 𝐙𝐈𝐒𝐀𝐍 ইনবক্সে গুতা দিন🤣😼",
      "মেয়ে হলে বস 𝐙𝐈𝐒𝐀𝐌 ইনবক্সে চলে যা 🤭🤣😼 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 https://www.facebook.com/share/19Q5LKFUpA/",
      "হুদাই আমারে শয়তানে লারে-😝😑☹️",
      "-𝗜 𝗟𝗢𝗩𝗘 𝗬𝗢🇺-😽-আহারে ভাবছো তোমারে প্রোপজ করছি-🥴-থাপ্পর দিয়া কিডনী লক করে দিব-😒-ভুল পড়া বের করে দিবো-🤭🐸",
      "-আমি একটা দুধের শিশু-😇-🫵𝗬𝗢𝗨🐸💦",
      "-কতদিন হয়ে গেলো বিছনায় মুতি না-😿-মিস ইউ নেংটা কাল-🥺🤧",
      "-বালিকা━👸-𝐃𝐨 𝐲𝐨𝐮-🫵-বিয়া-𝐦𝐞-😽-আমি তোমাকে-😻-আম্মু হইতে সাহায্য করব-🙈🥱",
      "-এই আন্টির মেয়ে-🫢🙈-𝐔𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐦𝐡-😽🫶-আসলেই তো স্বাদ-🥵💦-এতো স্বাদ কেন-🤔-সেই স্বাদ-😋",
      "-ইস কেউ যদি বলতো-🙂-আমার শুধু তোমাকেই লাগবে-💜🌸",
      "-ওই বেডি তোমার বাসায় না আমার বস 𝐙𝐈𝐒𝐀𝐍 মেয়ে দেখতে গেছিলো-🙃-নাস্তা আনারস আর দুধ দিছো-🙄🤦‍♂️-বইন কইলেই তো হয় বয়ফ্রেন্ড আছে-🥺🤦‍♂️-আমার বস সাহু কে জানে মারার কি দরকার-🙄🤧",
      "-একদিন সে ঠিকই ফিরে তাকাবে-😇-আর মুচকি হেসে বলবে ওর মতো আর কেউ ভালবাসেনি-🙂😅",
      "-হুদাই গ্রুপে আছি-🥺🐸-কেও ইনবক্সে নক দিয়ে বলে না জান তোমারে আমি অনেক ভালোবাসি-🥺🤧",
      "কি'রে গ্রুপে দেখি একটাও বেডি নাই-🤦‍🥱💦",
      "-দেশের সব কিছুই চুরি হচ্ছে-🙄-শুধু আমার বস 𝐙𝐈𝐒𝐀𝐍 এর মনটা ছাড়া-🥴😑😏",
      "-🫵তোমারে প্রচুর ভাল্লাগে-😽-সময় মতো প্রপোজ করমু বুঝছো-🔨😼-ছিট খালি রাইখো- 🥱🐸🥵",
      "-আজ থেকে আর কাউকে পাত্তা দিমু না -!😏-কারণ আমি ফর্সা হওয়ার ক্রিম কিনছি -!🙂🐸"];

    const triggers = ["baby", "bot", "bby", "jan", "xan", "জান", "বট", "বেবি"];

    if (triggers.includes(raw)) {
      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
      return api.sendMessage(randomReply, event.threadID, (err, info) => {
        if (!err && global.client && global.client.handleReply) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "simsimi"
          });
        }
      }, event.messageID);
    }

    const matchedTrigger = triggers.find(t => raw.startsWith(t + " "));
    if (matchedTrigger && simsim) {
      const query = raw.substring(matchedTrigger.length + 1).trim();
      if (!query) return;

      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
      const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

      for (const rep of replies) {
        await new Promise(resolve => {
          api.sendMessage(rep, event.threadID, (err, info) => {
            if (!err && global.client && global.client.handleReply) {
              global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: senderID,
                type: "simsimi"
              });
            }
            resolve();
          }, event.messageID);
        });
      }
    }
  } catch (e) {
    console.error("Error in handleEvent:", e);
  }
};
