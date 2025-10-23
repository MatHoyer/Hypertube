import { SSEStreamingApi } from "hono/streaming";

export class SSEClients {
  private movieClients: Map<string, Set<SSEStreamingApi>> = new Map();

  addClient(eventId: string, clientStream: SSEStreamingApi) {
    const clients = this.movieClients.get(eventId);
    if (!clients) {
      this.movieClients.set(eventId, new Set([clientStream]));
      return;
    }
    clients.add(clientStream);
  }

  removeClient(eventId: string, clientStream: SSEStreamingApi) {
    const clients = this.movieClients.get(eventId);
    if (!clients) return;
    clients.delete(clientStream);
    if (clients.size === 0) {
      this.movieClients.delete(eventId);
    }
  }

  mapClients(
    eventId: string,
    callback: (clientStream: SSEStreamingApi) => void
  ) {
    const clients = this.movieClients.get(eventId);
    if (!clients) return;
    for (const client of clients) {
      callback(client);
    }
  }
}
