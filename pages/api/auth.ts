import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, User } from "@prisma/client";

type FormData = {
  email: string;
};

const db = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | null>
) {
  if (req.method === "POST") {
    const { email } = req.body as FormData;

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json(null);
    }

    return res.status(200).json(user);
  }
}
