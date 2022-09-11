import type { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import type { Server as NetServer } from "http";

import { NextApiResponseServerIO } from "../../types/global";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  _: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/ws",
    });

    res.socket.server.io = io;
  }

  res.end();
}
