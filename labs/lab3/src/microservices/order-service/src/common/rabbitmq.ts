import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export const connectToRabbitMQ = async (retries = 10, delay = 3000) => {
  while (retries > 0) {
    try {
      console.log(`🐇 Trying to connect to RabbitMQ... (${retries} retries left)`);

      const connection = await amqp.connect("amqp://rabbitmq:5672");

      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
      });

      connection.on("close", () => {
        console.error("RabbitMQ connection closed! Reconnecting…");
        channel = null;
        connectToRabbitMQ(); // авто-переподключение
      });

      channel = await connection.createChannel();
      console.log("✅ Connected to RabbitMQ");

      return;
    } catch (err) {
      console.error("❌ RabbitMQ connection failed:", err.message);
      retries--;
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error("Could not connect to RabbitMQ after all retries.");
};

export const sendOrderCreated = async (order: { userId: string }) => {
  if (!channel) {
    console.error("❌ RabbitMQ channel is not ready yet. Cannot send message.");
    return;
  }

  const queue = "order_created";

  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(order)));

  console.log("📨 Sent order_created:", order);
};
