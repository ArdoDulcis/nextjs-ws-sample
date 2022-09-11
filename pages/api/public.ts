import type { NextApiRequest } from "next";

import { PrismaClient } from "@prisma/client";
import { NextApiResponseServerIO } from "../../types/global";

const db = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method === "POST") {
    // get message
    const { message, from } = req.body;

    await db.msg.create({
      data: {
        type: "public",
        from,
        to: "all",
        msg: message,
      },
    });

    // dispatch to channel "message"
    res?.socket?.server?.io?.emit("message", `${from}: ${message}`);

    // return message
    res.status(201).json(message);
  }
}
