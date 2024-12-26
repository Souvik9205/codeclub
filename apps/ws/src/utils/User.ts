import { WebSocket } from "ws";
import client from "@repo/db/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import { RoomManager } from "./RoomMannager";
import { OutgoingMessage } from "../types";

function getRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export class User {
  public id: string;
  public userId?: string;
  private spaceId?: string;
  private userName?: string;
  private x: number;
  private y: number;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.id = getRandomString(10);
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.initHandlers();
  }

  initHandlers() {
    this.ws.on("message", async (data) => {
      const parsedData = JSON.parse(data.toString());

      switch (parsedData.type) {
        case "join":
          try {
            const spaceId = parsedData.payload.spaceId;
            const token = parsedData.payload.token;
            const decoded = jwt.verify(token, JWT_PASSWORD) as JwtPayload;
            const userId = decoded.userId;
            const userName = decoded.username;

            if (!userId && !userName) {
              console.log("Invalid token - no userId");
              this.ws.close();
              return;
            }
            this.userId = userId;
            this.userName = userName;

            const space = await client.space.findFirst({
              where: { id: spaceId },
            });
            if (!space) {
              console.log("Space not found");
              this.ws.close();
              return;
            }

            this.spaceId = spaceId;
            RoomManager.getInstance().addUser(spaceId, this);
            this.x = Math.floor(Math.random() * space?.width);
            this.y = Math.floor(Math.random() * space?.height);

            // Broadcast user joined and send response
            this.send({
              type: "space-joined",
              payload: {
                spawn: { x: this.x, y: this.y },
                users:
                  RoomManager.getInstance()
                    .rooms.get(spaceId)
                    ?.filter((u) => u.id !== this.id)
                    .map((u) => ({
                      userId: u.userId,
                      userName: u.userName,
                      x: u.x,
                      y: u.y,
                    })) ?? [],
              },
            });
            console.log("User joined:", this.userId, this.userName);

            RoomManager.getInstance().broadcast(
              {
                type: "user-joined",
                payload: {
                  userId: this.userId,
                  userName: this.userName,
                  x: this.x,
                  y: this.y,
                },
              },
              this,
              this.spaceId as string
            );
          } catch (error) {
            console.error("Token verification failed:", error);
            this.ws.close();
            return;
          }
          break;

        case "move":
          const moveX = parsedData.payload.x;
          const moveY = parsedData.payload.y;
          const xDisplacement = Math.abs(this.x - moveX);
          const yDisplacement = Math.abs(this.y - moveY);
          if (
            (xDisplacement == 1 && yDisplacement == 0) ||
            (xDisplacement == 0 && yDisplacement == 1)
          ) {
            this.x = moveX;
            this.y = moveY;

            this.send({
              type: "moved",
              payload: {
                x: this.x,
                y: this.y,
              },
            });

            RoomManager.getInstance().broadcast(
              {
                type: "movement",
                payload: {
                  userId: this.userId,
                  userName: this.userName,
                  x: this.x,
                  y: this.y,
                },
              },
              this,
              this.spaceId!
            );
            return;
          }

          this.send({
            type: "movement-rejected",
            payload: {
              x: this.x,
              y: this.y,
            },
          });
      }
    });
  }

  destroy() {
    RoomManager.getInstance().broadcast(
      {
        type: "user-left",
        payload: {
          userId: this.userId,
          userName: this.userName,
        },
      },
      this,
      this.spaceId!
    );
    RoomManager.getInstance().removeUser(this, this.spaceId!);
  }

  send(payload: OutgoingMessage) {
    this.ws.send(JSON.stringify(payload));
  }
}
