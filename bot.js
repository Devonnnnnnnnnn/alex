require("dotenv").config();

const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const { DateTime } = require("luxon");

const client = new Discord.Client({
  // intents are ignored in v12, so you can omit or keep empty
});

// --- Express server to keep bot alive ---
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("🤖 Bot is alive and kicking! 🚀"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

// --- Constants ---
const prefix = "!";
const ROLE_ID = "1388462648739500134"; // Update as needed
const adminIDs = [
  "826494218355605534",
  "1385377368108961884",
  "1231292898469740655",
];

// --- Paths ---
const styleDataPath = path.join(__dirname, "styleData.json");
const verifiedUsersPath = path.join(__dirname, "verifiedUsers.json");
const giveawayDataPath = path.join(__dirname, "giveawayData.json");

// --- Load data ---
let styleData = fs.existsSync(styleDataPath)
  ? JSON.parse(fs.readFileSync(styleDataPath, "utf8"))
  : {};
let verifiedUsers = fs.existsSync(verifiedUsersPath)
  ? JSON.parse(fs.readFileSync(verifiedUsersPath, "utf8"))
  : {};
let giveawayInfo = fs.existsSync(giveawayDataPath)
  ? JSON.parse(fs.readFileSync(giveawayDataPath, "utf8"))
  : {};

// --- Define finalizeGiveaway outside to ensure proper scope ---
async function finalizeGiveaway(giveawayId) {
  const giveaway = giveawayInfo[giveawayId];
  if (!giveaway) return;

  const channel = client.channels.cache.get(giveaway.channelId);
  if (!channel) return;

  try {
    const message = await channel.messages.fetch(giveaway.messageId);
    const reaction = message.reactions.cache.get("🎉");
    const users = reaction ? await reaction.users.fetch() : [];
    const entries = Array.from(users.values()).filter(u => !u.bot);

    if (entries.length === 0) {
      channel.send(`❗ Giveaway **${giveaway.name}** ended with no entries.`);
    } else {
      const winner = entries[Math.floor(Math.random() * entries.length)];
      channel.send(`🎉 Congratulations <@${winner.id}>! You won **${giveaway.prize}** in the giveaway **${giveaway.name}**! 🏆`);
    }
  } catch (err) {
    console.error("Error finalizing giveaway:", err);
    channel.send("❌ An error occurred while concluding the giveaway.");
  }

  // Remove giveaway from memory and file
delete giveawayInfo.giveawayId
  const updatedJson = JSON.stringify(giveawayInfo, null, 2);    fs.writeFileSync(giveawayDataPath, updatedJson, 'utf-8');

}

// --- Style Scores ---
const styleStats = {
  "Hinto (Hinoto)": 400,
  "Tonkura (Tonoko)": 370,
  "Hakochi (Haibo)": 330,
  "Kishoti (Kito)": 380,
  "Sagumi (Saguwuru)": 400,
  "Yachikusai (Yamegushi)": 390,
  "Ninyoku ('Nichonayo')": 430,
  "Tsuchiro (Tzuzichiwa)": 440,
  "Oyatsu (Ojiri)": 420,
  "Imaezi (Iwaezeni)": 410,
  "Uchikai (Ushishima)": 540,
  "Kyoshin (Kosumi)": 450,
  "Sazuroku (Sagafura)": 470,
  "Azmei (Azamena)": 440,
  "Yokai (Yabu)": 520,
  "Kuzei (Kuzee)": 520,
  "Yomosuke (Yomomute)": 460,
  "Kyamo (Kagayomo)": 600,
  "Bakuri (Butoku)": 540,
  "Okazu (Oigawa)": 560,
  "Hirakumi": 490,
  "Sanju (Sanu)": 630,
  "Timeskip Hinoto": 560,
  "Timeskip Kagayomo": 570,
  "The Twins Osuma": 470,
  "The Twins Atasumi": 530,
  "Kisuki (Kimiro)": 580,
  "Timeskip Oigawa": 530,
  "Taichou": 525,
  "Kazana": 0,
};

// --- Style Descriptions ---
const styleInfo = {
  Hinoto: "Starter style, common rarity and all of the stats are at 50%.",
  Tonoko: "Common spiker style, block; bump; jump and serve are on 50%, dive is on 40%, set and speed are on 30% and spike is on 70%.",
  Haibo: "Common blocker style, serve is on 10%, spike is on 20%, speed is on 30%, dive is on 40%, bump and set are on 50%, block is on 60% and jump is on 70%.",
  Kito: "Common libero style, block and jump are on 40%, serve is on 25%, set is on 20%, spike is on 30%, bump and speed are on 70% and dive is on 75%.",
  Saguwuru: "Common spiker/setter style, speed and bump are on 40%, block; jump and serve are on 50%, dive is on 55%, spike is on 70% and set is on 75%.",
  Yamegushi: "Common server style, set is on 30%, spike is on 40%, block; speed and dive are on 50%, bump is on 70%, jump and serve are on 75%.",
  Nichonayo: "Rare libero style, block is on 50%, bump is on 100%, dive is on 100%, jump is on 50%, serve is on 10%, set is on 30%, speed is on 70%, spike is on 25%.",
  Tsuzichiwa: "Rare blocker style, bump and speed are on 40%, dive is on 45%, serve and spike are on 50%, set is on 70%, blocker is on 75% and jump is on 100%.",
  Ojiri: "Rare server style, spike and set are on 40%, dive is on 45%, block and speed are on 50%, bump and serve are on 70% and jump is on 75%.",
  Iwaezeni: "Rare spiker style, bump and speed are at 40%, dive is at 45%, block; serve and set are at 50%, spike is at 70% and jump is at 75%.",
  Uchishima: "Legendary spiker style, bump and set are on 40%, block; dive; speed and set are on 50%, jump is on 70% and spike is on 100%.",
  Kosumi: "Legendary libero/setter style, block and speed are 50%, bump is on 65%, dive is on 80%, jump and set are on 70%, serve is on 10% and spike is on 40%.",
  Sagafura: "Legendary libero/setter, block and jump are on 50%, bump is on 70%, dive is on 80%, serve is on 10%, set is on 75%, speed is on 100%, spike is on 40%.",
  Azamena: "Legendary spiker style, set is at 20%, block is at 30%, speed is at 35%, dive is at 45%, bump is at 50%, jump is at 70%, serve and spike are at 90%.",
  Yabu: "Legendary Libero/Blocker style, serve is at 10%, spike is at 30%, set is at 50%, block is at 70%, bump and dive are on 85% and jump and speed are on 100%.",
  Kuzee: "Legendary Spiker/Blocker style, speed is at 10%, set is at 35%, dive is at 40%, block and bump are on 70%, serve and spike are on 80% and jump is on 100%.",
  Yomomute: "Legendary spiker/libero style, set is on 35%, block; speed and jump are on 50%, serve is on 25%, spike is on 70%, bump is on 75% and dive is on 80%.",
  Kagayomo: "Godly setter/blocker style, block; serve and jump are on 80%, bump is on 45%, dive and speed are on 70%, spike is on 50% and set is on 100%.",
  Butoku: "Godly spiker/ blocker style, set is on 30%, speed is on 35%, dive is on 45%, bump is on 50%, block is on 75%, serve is on 80% and spike with jump are on 100%.",
  Oigawa: "Godly setter/ server style, block and set are on 90%, bump and spike are on 40%, dive and speed are on 50% and jump with serve are on 100%.",
  Hirakumi: "Godly blocker style, speed is on 15%, bump is on 40%, dive is on 45%, set and spike are on 50%, serve is on 90% and jump with block are 100%.",
  Sanu: `Secret spiker style, block; bump and dive are on 50%, serve is on 30%, set and speed are on 40%, jump and spike are on 100% and his special ability is super tilt which is on 100%+.
Sanu's Secret Special is Super Tilt.

Normally, tilting allows for more reach sideways (approximately 1.5 more ball widths on each side), but does not change direction. However, Sanu's spikes change by about a few degrees from the direction he's facing whenever spiking with tilt.`,
  "Timeskip Hinoto": `Secret spiker style, set is on 30%, bump is on 40%, block and dive are on 50%, speed is on 70%, serve is on 90%, jump is on 100% and spike is on 85%-110%. Timeskip Hinoto's Secret Special is Super Spike.

At the bottom of the screen, there is a meter. This is the Spike Gauge. It can gradually be filled by moving around, but if you stop moving, then it'll immediately become empty. It will also stop filling (but not empty itself) when you jump. The more filled the Spike Gauge, the more powerful your spike will be. If you manage to fill the entire gauge before spiking, you will land a Super Spike. This Super Spike releases purple bolts of lightning and will be more powerful than a style with a max spike stat.`,
  "Timeskip Kagayomo": `Secret setter style, bump is on 35%, spike and block are on 50%, dive is on 60%, speed is on 85%, jump is on 90% and serve with set are on 100%. Timeskip Kagayomo's Secret Special is Super Set.

When you do a directional set, the ball will instantaneously float a fixed distance in that direction before stopping and falling straight down. This distance can be altered with Advanced Controls. Timeskip Kagayomo's Super Set would float a bit upwards and last slightly longer in the air before falling.`,
  "The Twins (Osuma)": `Secret spiker/ blocker, serve is on 10%, speed it on 20%, dive is on 35%, bump is on 40%, set is on 50%, block is on 85%, jump and spike are on 100%. Super Switch: You can switch between 2 different styles, Atasumi and Osuma, in-game. This ability has a cooldown of 5 seconds.`,
  "The Twins (Atasumi)": `Secret setter style, block is on 20%, spike is on 35%, bump is on 50%, jump is on 60%, dive is on 70%, speed is on 85% and serve and set are on 100%. Super Switch: You can switch between 2 different styles, Atasumi and Osuma, in-game. This ability has a cooldown of 5 seconds.

Super Float: When serving with Atasumi, you can back-tilt in order to perform a "float serve". Upon reaching the opponent's side, the ball will rapidly decelerate and curve, making for an unpredictable, erratic serve. You can sort of control where it will float by doing left/right back-tilts, where it will then curve down with a slight inclination towards that direction.`,
  Kimiro: `Secret libero style, block is on 20%, spike is on 30%, jump and serve are on 75%, bump; set and speed are on 100% and dive is on 100%+. Kimiro's Secret Special is Super Dive.

Kimiro can charge up a dive. This dive can cover great distances, such as the entire court, quickly. He also has a 50% increased dive hitbox.`,
  "Timeskip Oigawa": `Secret setter style, block is on 20%, bump is on 30%, dive is on 40%, spike is on 60%, speed is on 80% and jump; serve and set are on 100%. Timeskip Oigawa's Secret Special is Super Serve.

Super Serve: When setting the power for a serve, the power meter will be slightly extended, and there will be a small, shiny section at the end of it. If you manage to time it right and hit the marker in the "rainbow" section, the subsequent serve will be enhanced into a Super Serve. It isn't any stronger than a max power serve (at least not noticeably), but it has a couple of special effects. First, the person who receives this Super Serve will be knocked back a small distance and stunned on the ground for approximately 2 seconds. Then, the ball will go in the direction based on the position of the receiver. For example, if the ball is hit to the left of the receiver, it'll fly left. And vice versa for the right, and the same for all directions. When receiving, the ball will fly in a high arc, rising up and falling down at a high speed.`,
  Taichou: `Secret setter style, block is on 20%, bump is on 35%, spike is on 40%, dive is on 60%, serve is on 80%, speed is on 90% and jump with set are on 100%. 
  
  Taichou's Secret Special is Super Enhance.

Whenever Taichou does a set of any kind, it will enhance the power of the next spike that interacts with the ball. There are 3 levels of boosts.

Base/ground sets will boost spike power a little, giving off a faint, wispy trail of air.
Neutral (no tilt) OR low-power side sets (under 50% power) will boost spike power a bit more, exuding a fiery orange trail.
Neutral jumpsets will give off the faint trail of air instead of the orange one, but the buff is there.
Sideways, max-power side sets (at least 50% power) will boost spike power the most, flourishing a magical, purple trail.
These boosts can also stack with multiple Taichou users, resulting in a large boost for the spiker if two fast jumpsets are hit in succession.`,
};

// --- Ability Descriptions ---
const abilityInfo = {
  "Super Sprint": "🔥 **Super Sprint**: A blazing speed boost for 4 seconds, engulfed in flames and lightning! ⚡🔥",
  "Team Spirit": "🌟 **Team Spirit**: Boosts your entire team's movement speed by 50% for 5 seconds! ⚡🤝",
  "Rolling Thunder": "🌩️ **Rolling Thunder**: Dive across the court at lightning speed! ⚡🏃‍♂️",
  "Boom Jump": "🚀 **Boom Jump**: Leap high and spike past blockers! 💥🏐",
  Moonball: "🌙 **Moonball**: High arc, fast descent, and back-line smash! 🌕🏐",
  "Zero Gravity Set": "🪐 **Zero Gravity Set**: Slow rising, floating sets that last longer! ✨",
  "Steel Block": "🛡️ **Steel Block**: Curves opponent’s spikes with a shield! 🛡️🚧",
  "Curve Spike": "🌪️ **Curve Spike**: Spin in alignment with your tilt for deadly precision! 🎯",
  "Redirection Jump": "🔄 **Redirection Jump**: Spike with insane tilt and speed! ⚡🏐",
  "Shield Breaker": "🛡️ **Shield Breaker**: Break through blocks and spikes! 💥🔥",
  "Magnetic Pull": "🧲 **Magnetic Pull**: Draw balls towards you within a radius! 🧲⚽",
  // Add more with emojis and style as needed
};

// --- Bot Ready ---
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Schedule ongoing giveaways on startup
  if (fs.existsSync(giveawayDataPath)) {
    try {
      giveawayInfo = JSON.parse(fs.readFileSync(giveawayDataPath, "utf8"));
      for (const [giveawayId, giveaway] of Object.entries(giveawayInfo)) {
        const endsAt = DateTime.fromISO(giveaway.endsAt).setZone("Europe/Prague");
        const msRemaining = endsAt.diffNow().as("milliseconds");
        if (msRemaining <= 0) {
          finalizeGiveaway(giveawayId);
        } else {
          setTimeout(() => finalizeGiveaway(giveawayId), msRemaining);
        }
      }
    } catch (err) {
      console.error("❌ Failed to load giveaways:", err);
    }
  }
});

// --- Message handler ---
client.on("message", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const fullCommand = message.content.slice(prefix.length).trim();
  const command = fullCommand.split(' ')[0].toLowerCase();
  const argsString = fullCommand.slice(command.length).trim();

  // Helper functions
  function generateId(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  function parseDuration(input) {
    const regex = /^(\d+)([smhd])$/i;
    const match = input.match(regex);
    if (!match) return null;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    switch (unit) {
      case "s": return { seconds: value };
      case "m": return { minutes: value };
      case "h": return { hours: value };
      case "d": return { days: value };
      default: return null;
    }
  }

  // --- Main function to finalize giveaway (already defined above) ---

  // Command: ping
  if (command === "ping") {
    const msg = await message.channel.send("🏓 Pinging...");
    const latency = msg.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    return msg.edit(`🏓 Pong!\n🕑 Latency: **${latency}ms**\n🌐 API: **${apiLatency}ms**`);
  }

  // Command: compare
  if (command === "compare") {
    const args = argsString.split(',').map(arg => arg.trim());
    if (args.length !== 2) return message.channel.send("❗ Usage: `!compare <style1>, <style2>`");
    const [input1, input2] = args;

    const key1 = Object.keys(styleStats).find(k => k.toLowerCase() === input1.toLowerCase());
    const key2 = Object.keys(styleStats).find(k => k.toLowerCase() === input2.toLowerCase());
    if (!key1 || !key2) return message.channel.send("❌ One or both styles not found!");

    const stat1 = styleStats[key1];
    const stat2 = styleStats[key2];

    const embed = new Discord.MessageEmbed()
      .setColor(stat1 === stat2 ? "#f5c518" : stat1 > stat2 ? "#00ff99" : "#ff6666")
      .setTitle("📊 Style Showdown! ⚔️")
      .addField("📝 Style 1", `${key1} — **${stat1}**`, true)
      .addField("📝 Style 2", `${key2} — **${stat2}**`, true);

    if (stat1 === stat2) {
      embed.addField("🤝 Result", "It's a **tie**!", false);
    } else {
      const winner = stat1 > stat2 ? key1 : key2;
      const loser = stat1 > stat2 ? key2 : key1;
      embed
        .addField("🏆 Winner", `${winner} — **${styleStats[winner]}**`, true)
        .addField("💔 Loser", `${loser} — **${styleStats[loser]}**`, true)
        .addField("🔢 Difference", `${Math.abs(stat1 - stat2)} points`, false);
    }
    return message.channel.send(embed);
  }

  // Command: info / description
  if (command === "info" || command === "information") {
    const query = argsString.toLowerCase();
    const styleKey = Object.keys(styleInfo).find(k => k.toLowerCase() === query);
    const abilityKey = Object.keys(abilityInfo).find(k => k.toLowerCase() === query);

    const finalStyleKey = styleKey || Object.keys(styleInfo).find(k => k.toLowerCase().includes(query));
    const finalAbilityKey = abilityKey || Object.keys(abilityInfo).find(k => k.toLowerCase().includes(query));

    if (!finalStyleKey && !finalAbilityKey) {
      return message.channel.send("❌ No matching style or ability found.");
    }

    const embed = new Discord.MessageEmbed().setColor("#0099ff");
    if (finalStyleKey) {
      embed
        .setTitle(`📝 Style: ${finalStyleKey}`)
        .setDescription(styleInfo[finalStyleKey])
        .addField("🌟 Technique Score", styleStats[finalStyleKey] || "Unknown");
    } else if (finalAbilityKey) {
      embed
        .setTitle(`📝 Ability: ${finalAbilityKey}`)
        .setDescription(abilityInfo[finalAbilityKey]);
    }
    return message.channel.send(embed);
  }

  // Command: setstyle
  if (command === "setstyle") {
    const input = argsString.toLowerCase();
    const key = Object.keys(styleStats).find(k => k.toLowerCase() === input);
    if (!key) return message.channel.send("❌ Style not found.");
    styleData[message.author.id] = key;
    fs.writeFileSync(styleDataPath, JSON.stringify(styleData, null, 2));
    return message.channel.send(`✅ Your style has been set to **${key}**!`);
  }

  // Command: verifyroblox
  if (command === "verifyroblox") {
    const args = argsString.split(' ').filter(arg => arg);
    if (!args.length) return message.channel.send("❗ Usage: `!verifyroblox <username>`");
    const username = args[0];
    const member = message.guild ? message.guild.members.cache.get(message.author.id) : null;
    const verifiedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "verified");
    if (!verifiedRole) return message.channel.send("❗ Verified role not found.");
    if (member?.roles.cache.has(verifiedRole.id)) return message.channel.send("✅ You are already verified!");

    verifiedUsers[message.author.id] = username;
    fs.writeFileSync(verifiedUsersPath, JSON.stringify(verifiedUsers, null, 2));
    try {
      await member.roles.add(verifiedRole);
      return message.channel.send(`✅ Verified as **${username}**!`);
    } catch (err) {
      console.error("Error adding role:", err);
      return message.channel.send("❌ Failed to assign verified role.");
    }
  }

  // Command: profile
  if (command === "profile") {
    const target = message.mentions.users.first() || message.author;
    const member = message.guild ? message.guild.members.cache.get(target.id) : null;
    const displayName = member ? member.displayName : target.username;
    const style = styleData[target.id] || "No style assigned";
    const roblox = verifiedUsers[target.id] || "Not verified";

    const embed = new Discord.MessageEmbed()
      .setTitle(`🎮 ${displayName}'s Profile`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addField("📝 Style", style, true)
      .addField("🌐 Roblox", roblox, true)
      .setColor("#00ccff");
    return message.channel.send(embed);
  }

  // Command: list
  if (command === "list") {
    const styleNames = Object.keys(styleStats);
    const abilityNames = Object.keys(abilityInfo);
    const styleEmbed = new Discord.MessageEmbed()
      .setTitle("🏐 Available Volleyball Styles")
      .setColor("#00FFFF")
      .setDescription(styleNames.join(', '));
    const abilityEmbed = new Discord.MessageEmbed()
      .setTitle("🏐 Available Volleyball Abilities")
      .setColor("#00FFFF")
      .setDescription(abilityNames.join(', '));
    message.channel.send(styleEmbed);
    message.channel.send(abilityEmbed);
  }

  // Command: help
  if (command === "help") {
  const embed = new Discord.MessageEmbed()
    .setTitle("🤖 Command List")
    .setColor("#00cc99")
    .setDescription("Here’s a list of all available commands to help you get started:")
    .addFields(
      { name: "🏓 !ping", value: "Check the bot's latency and see if it's responsive." },
      { name: "⚔️ !compare <style1>, <style2>", value: "Compare two Volleyball Legends styles by their technique scores to see which is stronger." },
      { name: "📝 !info <style|ability>", value: "Get detailed info about a specific style or ability in the game." },
      { name: "🎽 !setstyle <style>", value: "Set your preferred Volleyball Legends style for your profile." },
      { name: "🎮 !verifyroblox <username>", value: "Link your Roblox account to your Discord profile and get verified." },
      { name: "👤 !profile [@user]", value: "View your own or another user’s Volleyball Legends profile stats." },
      { name: "❓ !help", value: "Display this help menu with all commands and descriptions." },
      { name: "📜 !list", value: "Show a full list of all styles and abilities available in Volleyball Legends." },
      { name: "🎉 !g", value: "Start a giveaway in your server. (Admin Only)" },
      { name: "✂️ !rps", value: "Play Rock Paper Scissors against Alex. Can you beat him?" }
    )
    .setFooter("Use commands with the ! prefix")
  return message.channel.send(embed);
}


  // Command: uptime
  if (command === "uptime") {
    const totalSeconds = Math.floor(client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    return message.channel.send(`⏱️ I've been running for: **${uptime}**`);
  }

  // Command: startgiveaway
  if (command === "g") {
    if (!adminIDs.includes(message.author.id)) {
      return message.channel.send("❌ You don’t have permission to use this command.");
    }
    const rawArgs = fullCommand.slice("!g".length).trim();
    const input = rawArgs.split(",").map(arg => arg.trim());
    if (input.length < 3) {
      return message.channel.send("❗ Usage: `!g <name>, <prize>, <duration>` (e.g., `!startgiveaway Friday, Free Robux, 10m`)");
    }
    const [name, prize, durationStr] = input;
    const duration = parseDuration(durationStr);
    if (!duration) {
      return message.channel.send("❌ Please provide a valid duration (`10m`, `2h`, `1d`, etc).");
    }
    const endsAt = DateTime.now().setZone("Europe/Prague").plus(duration);
    const giveawayId = generateId(8);

    const embed = new Discord.MessageEmbed()
      .setTitle(`🎁 Giveaway: ${name}`)
      .setDescription(
        `🎉 **Prize**: ${prize}\n` +
        `🕒 **Ends At**: <t:${Math.floor(endsAt.toSeconds())}:F>\n` +
        `🤖 React with 🎉 to enter!\n` +
        `🔑 **ID**: \`${giveawayId}\``
      )
      .setColor("#FFD700")
      .setFooter(`Hosted by ${message.author.username}`)
      .setTimestamp();

    const giveawayMessage = await message.channel.send({ embed });
    await giveawayMessage.react("🎉");

    // Save giveaway info
    giveawayInfo[giveawayId] = {
      name,
      prize,
      messageId: giveawayMessage.id,
      channelId: message.channel.id,
      host: message.author.username,
      endsAt: endsAt.toISO(),
    };
    fs.writeFileSync(giveawayDataPath, JSON.stringify(giveawayInfo, null, 2));

    // Schedule end
    setTimeout(() => finalizeGiveaway(giveawayId), endsAt.diffNow().as("milliseconds"));

    return message.channel.send(`✅ Giveaway **${name}** has started! ID: \`${giveawayId}\``);
  }
 
  if (command === "rps" || command === "rockpaperscissors") {
  const rpsEmbed = new Discord.MessageEmbed()
    .setTitle("🪨📄✂️ Rock Paper Scissors!")
    .setDescription("React with your choice:\n🪨 = Rock\n📄 = Paper\n✂️ = Scissors")
    .setColor("#0099ff");
  // Send the embed and get the sent message
  message.channel.send(rpsEmbed).then(sentMessage => {
    
    const choices = ["🪨", "📄", "✂️"];
    // React with the choices emojis
    choices.forEach(reaction => sentMessage.react(reaction));
   const filter = (reaction, user) =>
choices.includes(reaction.emoji.name) && user.id === message.author.id;
    // Await reactions with the filter
    sentMessage.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] })
      .then(collected => {
        const userChoice = collected.first().emoji.name;
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        let resultMessage;
        if (userChoice === botChoice) {
          resultMessage = "It's a tie! 🤝";
        } else if (
         (userChoice === "🪨" && botChoice === "✂️") ||
          (userChoice === "📄" && botChoice === "🪨") ||
          (userChoice === "✂️" && botChoice === "📄")
        ) {
          resultMessage = "You won! 🎉";
        } else {
          resultMessage = "Alex won! 😈";
        }
        const resultEmbed = new Discord.MessageEmbed()
          .setTitle("Rock Paper Scissors Result")
         .addField("Your choice", userChoice, true)
          .addField("Alex's choice", botChoice, true)
          .addField("Result", resultMessage)
          .setColor(resultMessage === "You won! 🎉" ? "#00ff00" : resultMessage === "It's a tie! 🤝" ? "#ffff00" : "#ff0000");
        message.channel.send(resultEmbed);     
      })
    
      .catch(() => {
        message.channel.send("⌛ You didn't react in time!");
      });
  });
}
});

// --- Login ---
client.login(process.env.TOKEN);