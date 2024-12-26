import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const userRouter = Router();

userRouter.post("/", userMiddleware, async (req, res) => {
  const parsedData = UpdateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed", data: parsedData });
    return;
  }
  try {
    await client.user.update({
      where: {
        id: req.userId,
      },
      data: {
        avatarId: parsedData.data.avatarId,
      },
    });
    res.json({ message: "Metadata updated" });
  } catch (e) {
    res.status(400).json({ message: "Internal server error" });
  }
});

userRouter.get("/:userId", async (req, res) => {
  const user = await client.user.findUnique({
    where: {
      id: req.params.userId,
    },
  });
  res.json({
    res: user,
    message: "ok",
  });
});

userRouter.post("/avatar", userMiddleware, async (req, res) => {
  const parseData = UpdateMetadataSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const { avatarId, userId } = parseData.data;
  try {
    const avatar = await client.avatar.findUnique({
      where: {
        id: avatarId,
      },
    });
    if (!avatar) {
      res.status(400).json({ message: "Avatar not found" });
      return;
    }
    await client.user.update({
      where: { id: userId },
      data: { avatarId },
    });

    res.status(200).json({ message: "Avatar updated" });
  } catch (e) {
    res.status(400).json({ message: "Internal server error" });
  }
});

userRouter.get("/bulk", async (req, res) => {
  const userIdString = (req.query.ids ?? "[]") as string;
  const userIds = userIdString.slice(1, userIdString?.length - 1).split(",");

  const metadata = await client.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      avatar: true,
      id: true,
    },
  });
  res.json({
    avatars: metadata.map((x) => ({
      userId: x.id,
      imageUrl: x.avatar?.imageUrl,
    })),
    message: "ok",
  });
});
