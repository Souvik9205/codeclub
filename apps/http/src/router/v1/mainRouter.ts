import { Router } from "express";
import { SigninSchema, SignupSchema } from "../../types";
import { hash, compare } from "../../script";
import client from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";

export const mainRouter = Router();

mainRouter.post("/signup", async (req, res) => {
  const parseData = SignupSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const hashedPassword = await hash(parseData.data.password);

  try {
    const user = await client.user.create({
      data: {
        username: parseData.data.username,
        password: hashedPassword,
        role: parseData.data.type === "admin" ? "Admin" : "User",
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    res.status(400).json({ message: "User already exists" });
  }
});

mainRouter.post("/signin", async (req, res) => {
  const parseData = SigninSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(403).json({ message: "Validation failed" });
    return;
  }

  try {
    const user = await client.user.findUnique({
      where: {
        username: parseData.data.username,
      },
    });
    if (!user) {
      res.status(403).json({ message: "User not found" });
      return;
    }
    const isvalid = await compare(parseData.data.password, user.password);
    if (!isvalid) {
      res.status(403).json({ message: "Wrong password" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET
    );

    res.json({
      userId: user.id,
      token: token,
    });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

mainRouter.get("/avatars", async (req, res) => {
  const avatars = await client.avatar.findMany();
  res.json({
    avatars: avatars.map((x) => ({
      id: x.id,
      name: x.name,
      imageUrl: x.imageUrl,
    })),
  });
});

mainRouter.get("/avatars/:avatarId", async (req, res) => {
  const avatar = await client.avatar.findUnique({
    where: {
      id: req.params.avatarId,
    },
  });
  if (!avatar) {
    res.status(404).json({ message: "Avatar not found" });
    return;
  }
  res.json({
    name: avatar.name,
    imageUrl: avatar.imageUrl,
  });
});

mainRouter.get("/elements", async (req, res) => {
  const elements = await client.element.findMany();
  res.json({
    elements: elements.map((x) => ({
      id: x.id,
      width: x.width,
      height: x.height,
      static: x.static,
      imageUrl: x.imageUrl,
    })),
  });
});
