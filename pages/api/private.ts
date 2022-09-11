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
    const { message, from, to } = req.body;

    await db.msg.create({
      data: {
        type: "private",
        from,
        to,
        msg: message,
      },
    });

    // dispatch to channel "message"
    res?.socket?.server?.io?.emit(`${to}`, `${from}: ${message}`);

    // return message
    res.status(201).json(message);
  }
}
