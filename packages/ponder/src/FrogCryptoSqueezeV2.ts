import { ponder } from "@/generated";

ponder.on("FrogCryptoSqueezeV2:Squeeze", async ({ event, context }) => {
  const { SqueezeLog, User } = context.db;

  await User.upsert({
    id: event.args.owner,
    create: {
      rarityAmount: event.args.rarityReward,
      jumpAmount: event.args.jumpReward,
      speedAmount: event.args.speedReward,
      intelligenceAmount: event.args.intelligenceReward,
      beautyAmount: event.args.beautyReward,
      totalAmount:
        event.args.rarityReward +
        event.args.jumpReward +
        event.args.speedReward +
        event.args.intelligenceReward +
        event.args.beautyReward,
      updated: Number(event.block.timestamp),
    },
    update: ({ current }) => ({
      rarityAmount: current.rarityAmount + event.args.rarityReward,
      jumpAmount: current.jumpAmount + event.args.jumpReward,
      speedAmount: current.speedAmount + event.args.speedReward,
      intelligenceAmount: current.intelligenceAmount + event.args.intelligenceReward,
      beautyAmount: current.beautyAmount + event.args.beautyReward,
      totalAmount: current.totalAmount + event.args.rarityReward + event.args.jumpReward + event.args.speedReward + event.args.intelligenceReward + event.args.beautyReward,
      updated: Number(event.block.timestamp),
    }),
  });

  await SqueezeLog.create({
    id: `${event.args.frogId}-${event.block.timestamp}`,
    data: {
      frogId: event.args.frogId,
      rarityAmount: event.args.rarityReward,
      jumpAmount: event.args.jumpReward,
      speedAmount: event.args.speedReward,
      intelligenceAmount: event.args.intelligenceReward,
      beautyAmount: event.args.beautyReward,
      totalAmount: event.args.rarityReward + event.args.jumpReward + event.args.speedReward + event.args.intelligenceReward + event.args.beautyReward,
      name: event.args.nameAndStory.split("|")[0],
      story: event.args.nameAndStory.split("|")[1],
      timestamp: Number(event.block.timestamp),
      ownerId: event.args.owner,
    },
  });
});
