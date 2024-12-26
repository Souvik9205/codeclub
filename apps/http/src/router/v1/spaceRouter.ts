import { Router } from "express";
import { userMiddleware } from "../../middleware/user";
import {
  AddElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
  JoinSpaceSchema,
} from "../../types";
import client from "@repo/db/client";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
  const parseData = CreateSpaceSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  if (!parseData.data.mapId) {
    const space = await client.space.create({
      data: {
        name: parseData.data.name,
        width: parseInt(parseData.data.dimensions.split("x")[0]),
        height: parseInt(parseData.data.dimensions.split("x")[1]),
        creatorId: req.userId!,
      },
    });
    res.json({
      spaceId: space.id,
    });
    return;
  }
  const map = await client.map.findUnique({
    where: {
      id: parseData.data.mapId,
    },
    select: {
      mapElements: true,
      width: true,
      height: true,
      thumbnail: true,
    },
  });

  if (!map) {
    res.status(400).json({ message: "Map not found" });
    return;
  }

  let space = await client.$transaction(async () => {
    const space = await client.space.create({
      data: {
        name: parseData.data.name,
        width: map.width,
        height: map.height,
        creatorId: req.userId!,
        thumbnail: map.thumbnail,
      },
    });
    await client.spaceElements.createMany({
      data: map.mapElements.map((e) => ({
        spaceId: space.id,
        elementId: e.elementId,
        x: e.x!,
        y: e.y!,
      })),
    });
    return space;
  });
  res.json({
    spaceId: space.id,
  });
});

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
  const space = await client.space.findUnique({
    where: {
      id: req.params.spaceId,
    },
    select: {
      creatorId: true,
    },
  });
  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }
  if (space?.creatorId !== req.userId) {
    res.status(403).json({ message: "You are not the creator of this space" });
    return;
  }

  await client.space.delete({
    where: {
      id: req.params.spaceId,
    },
  });
  res.json({ message: "Space deleted" });
});

spaceRouter.post("/join", userMiddleware, async (req, res) => {
  const parseData = JoinSpaceSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const space = await client.space.findUnique({
    where: {
      id: parseData.data.spaceId,
    },
    include: {
      members: true,
    },
  });
  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }
  const isAlreadyMember = space.members.some(
    (member) => member.id === parseData.data.userId
  );
  if (isAlreadyMember) {
    res.status(400).json({ message: "User is already a member of this space" });
    return;
  }

  await client.space.update({
    where: {
      id: space.id,
    },
    data: {
      members: {
        connect: { id: parseData.data.userId }, // Connect the user to the space
      },
    },
  });
  res.json({ message: "Space Member joined" });
});

spaceRouter.get("/all", userMiddleware, async (req, res) => {
  const spaces = await client.space.findMany({
    where: {
      creatorId: req.userId!,
    },
  });

  res.json({
    spaces: spaces.map((s) => ({
      id: s.id,
      name: s.name,
      thumbnail: s.thumbnail,
      dimensions: `${s.width}x${s.height}`,
    })),
  });
});
spaceRouter.get("/joined", userMiddleware, async (req, res) => {
  try {
    // Fetch spaces where the user is a member
    const spaces = await client.space.findMany({
      where: {
        members: {
          some: {
            id: req.userId!,
          },
        },
      },
    });

    // Respond with the spaces in a formatted way
    res.json({
      spaces: spaces.map((s) => ({
        id: s.id,
        name: s.name,
        thumbnail: s.thumbnail,
        dimensions: `${s.width}x${s.height}`,
      })),
    });
  } catch (error) {
    console.error("Error fetching joined spaces:", error);
    res.status(500).json({ message: "Failed to fetch joined spaces" });
  }
});

spaceRouter.post("/element", userMiddleware, async (req, res) => {
  const parseData = AddElementSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const space = await client.space.findUnique({
    where: {
      id: req.body.spaceId,
      creatorId: req.userId!,
    },
    select: {
      width: true,
      height: true,
    },
  });
  if (
    req.body.x < 0 ||
    req.body.y < 0 ||
    req.body.x > space?.width! ||
    req.body.y > space?.height!
  ) {
    res.status(400).json({ message: "Point is outside of the boundary" });
    return;
  }

  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  await client.spaceElements.create({
    data: {
      x: req.body.x,
      y: req.body.y,
      elementId: req.body.elementId,
      spaceId: req.body.spaceId,
    },
  });
  res.json({
    message: "Element added",
  });
});

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
  const parseData = DeleteElementSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });

    return;
  }
  const spaceElement = await client.spaceElements.findFirst({
    where: {
      id: parseData.data.id,
    },
    include: {
      space: true,
    },
  });
  console.log("spaceElement?.space", spaceElement?.space);

  if (
    !spaceElement?.space.creatorId ||
    spaceElement?.space.creatorId !== req.userId
  ) {
    res.status(403).json({ message: "You are not the creator of this space" });
    return;
  }

  await client.spaceElements.delete({
    where: {
      id: parseData.data.id,
    },
  });
  res.json({ message: "Element deleted" });
});

spaceRouter.get("/maps", async (req, res) => {
  const maps = await client.map.findMany();

  res.json({
    maps: maps.map((m) => ({
      id: m.id,
      name: m.name,
      thumbnail: m.thumbnail,
      dimensions: `${m.width}x${m.height}`,
    })),
  });
});

spaceRouter.get("/:spaceId", userMiddleware, async (req, res) => {
  const space = await client.space.findUnique({
    where: {
      id: req.params.spaceId,
    },
    include: {
      spaceElements: {
        include: {
          element: true,
        },
      },
    },
  });

  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  res.json({
    dimensions: `${space.width}x${space.height}`,
    elements: space.spaceElements.map((e) => ({
      id: e.id,
      element: {
        id: e.element.id,
        imageUrl: e.element.imageUrl,
        width: e.element.width,
        height: e.element.height,
        static: e.element.static,
      },
      x: e.x,
      y: e.y,
    })),
  });
});
