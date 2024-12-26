import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import {
  CreateAvatarSchema,
  CreateElementSchema,
  CreateMapSchema,
  UpdateElementSchema,
} from "../../types";
import client from "@repo/db/client";

export const adminRouter = Router();

adminRouter.post("/element", adminMiddleware, async (req, res) => {
  const parseData = CreateElementSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const element = await client.element.create({
    data: {
      width: parseData.data.width,
      height: parseData.data.height,
      static: parseData.data.static,
      imageUrl: parseData.data.imageUrl,
    },
  });

  res.json({
    id: element.id,
  });
});

adminRouter.put("/element/:id", adminMiddleware, async (req, res) => {
  const parseData = UpdateElementSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }

  await client.element.update({
    where: {
      id: req.params.id,
    },
    data: {
      imageUrl: parseData.data.imageUrl,
    },
  });
  res.json({
    message: "Element updated",
  });
});

adminRouter.post("/avatar", adminMiddleware, async (req, res) => {
  const parseData = CreateAvatarSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }

  const avatar = await client.avatar.create({
    data: {
      imageUrl: parseData.data.imageUrl,
      name: parseData.data.name,
    },
  });

  res.json({ avatarId: avatar.id });
});

adminRouter.post("/map", adminMiddleware, async (req, res) => {
  const parseData = CreateMapSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const map = await client.map.create({
    data: {
      name: parseData.data.name,
      width: parseInt(parseData.data.dimensions.split("x")[0]),
      height: parseInt(parseData.data.dimensions.split("x")[1]),
      thumbnail: parseData.data.thumbnail,
      mapElements: {
        create: parseData.data.defaultElements.map((element) => ({
          elementId: element.elementId,
          x: element.x,
          y: element.y,
        })),
      },
    },
  });
  res.json({
    id: map.id,
  });
});
