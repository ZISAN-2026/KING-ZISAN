module.exports.config = {
    name: "fork",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "SHAHADAT SAHU",
    description: "Send YouTube channel and GitHub fork link with intro text",
    commandCategory: "other",
    usages: "fork",
    cooldowns: 0,
};

module.exports.run = async function({ api, event }) {
    const message = 
        "🌟 আসসালামু আলাইকুম সম্মানিত বট ইউজার 🌟\n\n" +
        "আপনি যদি তৈরি করতে চান, তাহলে চলে যেতে পারেন আমাদের FACBOOK ID" +
        "সেখানে গিয়ে ভিডিও দেখে আপনি খুব সহজে বট তৈরি করে নিতে পারবেন। " +
        "তাহলে আর দেরি না করে এখনি চলে যান আমাদের FACBOOK ID।\n\n" +
        "➤ Facbook link: https://www.facebook.com/share/19Q5LKFUpA/\n\n" +
        "🔗 GitHub Fork Link: https://github.com/ZISAN-2026/KING-ZISAN.git";

    return api.sendMessage(message, event.threadID, event.messageID);
};
