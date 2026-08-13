const request = require("request");
const fs = require("fs-extra");

module.exports.config = {
  name: "owner",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "SHAHADAT SAHU",
  description: "Show Owner Info with styled box & random photo",
  commandCategory: "Information",
  usages: "owner",
  cooldowns: 2
};

module.exports.run = async function ({ api, event }) {

  
  const info = `
╔═════════════════════ ✿
║ ✨ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ✨
╠═════════════════════ ✿
║ 👑 𝗡𝗮𝗺𝗲 : 𝐙𝐈𝐒𝐀𝐍 𝐒𝐀𝐑𝐃𝐀𝐑
║ 🧸 𝗡𝗶𝗰𝗸 𝗡𝗮𝗺𝗲 : 𝐙𝐈𝐒𝐀𝐍 
║ 🎂 𝗔𝗴𝗲 : 𝟭𝟴+
║ 💘 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻 : 𝐒𝐈𝐍𝐆𝐋𝐄
║ 🎓 𝗣𝗿𝗼𝗳𝗲𝘀𝘀𝗶𝗼𝗻 : 𝐉𝐎𝐁
║ 📚 𝗘𝗱𝘂𝗰𝗮𝘁𝗶𝗼𝗻 : 𝐓𝐇𝐄 𝐄𝐍𝐃
║ 🏡 𝗔𝗱𝗱𝗿𝗲𝘀𝘀 : 𝐃𝐇𝐀𝐊𝐀-𝐀𝐈𝐑𝐏𝐎𝐑𝐓
╠═════════════════════ ✿
║ 🔗 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 𝗟𝗜𝗡𝗞𝗦
╠═════════════════════ ✿
║ 📘 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 :
║ fb.com/100004039690397
║ 💬 𝗠𝗲𝘀𝘀𝗲𝗻𝗴𝗲𝗿 :
║ m.me/100004039690397
║ 📞 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 :
║ wa.me/01743319347
╚═════════════════════ ✿
`;

  const images = [
    "https://ibb.co.com/YTWzgd38",
    "https://ibb.co.com/YTWzgd38",
    "https://ibb.co.com/YTWzgd38",
    "https://ibb.co.com/YTWzgd38"
  ];

  const randomImg = images[Math.floor(Math.random() * images.length)];

  const callback = () => api.sendMessage(
    {
      body: info,
      attachment: fs.createReadStream(__dirname + "/cache/owner.jpg")
    },
    event.threadID,
    () => fs.unlinkSync(__dirname + "/cache/owner.jpg")
  );

  return request(encodeURI(randomImg))
    .pipe(fs.createWriteStream(__dirname + "/cache/owner.jpg"))
    .on("close", () => callback());
};
