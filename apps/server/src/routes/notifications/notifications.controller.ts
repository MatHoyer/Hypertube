import { hypertubeLogger } from "@hypertube/libs";
import { EventsSubscriber } from "@hypertube/server-core";
import { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { TIsLogged } from "../../middlewares/isLogged";

export const getNotificationsSSE = async (c: Context<TIsLogged>) => {
  const { id } = c.get("user");

  hypertubeLogger.info(`[${id}] notifications SSE started`);

  return streamSSE(c, async (stream) => {
    const eventsSubscriber = new EventsSubscriber(
      { event: "notification", userId: "1" },
      async (data) => {
        await stream.write(JSON.stringify(data));
      }
    );

    stream.onAbort(() => {
      eventsSubscriber.destroy();
      hypertubeLogger.info(`[${id}] notifications SSE aborted`);
    });

    while (true) {
      await stream.sleep(60000);
    }
  });
};
