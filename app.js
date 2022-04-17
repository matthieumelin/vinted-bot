// Discord.js
const { Client, MessageEmbed } = require("discord.js");
const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});

// Config
const config = require("./config.json");
const token = config.token;
const premium = config.premium;

// Requests
const vinted = require("vinted-api");
const fetchedOffers = new Array();
const fetchTime = 1000 * 30;

// Listeners
client.on("ready", async () => {
  console.log("Vinted Bot v1.0 logged!");

  await fetch();
  await autoFetch();
});

const createEmbedMessage = async (channel, article) => {
  const embedMessage = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(article.title)
    .setURL(article.url)
    .addFields(
      {
        name: "💳 Prix",
        value: `${article.price}${article.currency}`,
        inline: true,
      },
      {
        name: "📏 Taille",
        value: article.size_title,
        inline: true,
      },
      {
        name: "🔖 Marque",
        value: article.brand_title,
        inline: true,
      }
    )
    .setImage(article.photo.url)
    .setFooter({
      text: `Vendu par ${article.user.login} | Vue ${article.view_count} fois`,
    });
  channel.send({ embeds: [embedMessage] });
};

const autoFetch = async () => {
  setInterval(async () => await fetch(), fetchTime);
};

const fetch = async () => {
  const links = new Array(
    {
      type: "jackets",
      url: "https://www.vinted.fr/vetements?catalog[]=2052&price_to=60&currency=EUR",
    },
    {
      type: "sweater",
      url: "https://www.vinted.fr/vetements?catalog[]=79&price_to=40&currency=EUR",
    },
    {
      type: "shirts",
      url: "https://www.vinted.fr/vetements?catalog[]=76&price_to=15&currency=EUR",
    },
    {
      type: "pants",
      url: "https://www.vinted.fr/vetements?catalog[]=80&catalog[]=257&catalog[]=34&price_to=70&currency=EUR",
    }
  );

  let index = 0;

  links.forEach(async (link) => {
    await vinted.search(link.url).then((offers) => {
      setTimeout(async () => {
        const channel = client.channels.cache.get(
          config.channels.free[link.type]
        );

        if (channel) {
          const items = offers.items;
          const item = items[index++];

          if (
            fetchedOffers.filter(
              (item) =>
                item != null &&
                item.title != null &&
                item.url != null &&
                item.price != null &&
                item.currency != null &&
                item.size_title != null &&
                item.brand_title != null &&
                item.photo.url != null &&
                item.user.login != null &&
                item.view_count != null &&
                !item.is_suspicious &&
                !item.is_for_swap
            ) &&
            fetchedOffers.includes(item)
          )
            return;

          fetchedOffers.push(item);

          await createEmbedMessage(channel, item);

          console.log("New offer fetched!");
        }
      }, fetchTime);
    });
  });
};

client.login(token);
