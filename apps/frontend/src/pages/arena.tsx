import React, { useEffect, useRef, useState } from "react";

const ArenaPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<Map<string, any>>(new Map());
  const [params, setParams] = useState({
    token: "",
    spaceId: "",
    bounds: { x: 25, y: 30 },
  });
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Adjust viewport size on resize
  useEffect(() => {
    const handleResize = () =>
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token") || "";
    const spaceId = urlParams.get("spaceId") || "";
    const XxY = urlParams.get("XxY") || "25x30"; // Default bounds
    const [xMax, yMax] = XxY.split("x").map(Number);
    setParams({ token, spaceId, bounds: { x: xMax + 1, y: yMax + 1 } });

    wsRef.current = new WebSocket("ws://localhost:8080");

    wsRef.current.onopen = () => {
      wsRef.current?.send(
        JSON.stringify({
          type: "join",
          payload: { token, spaceId },
        })
      );
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case "space-joined": {
        setCurrentUser({
          userId: message.payload.userId,
          userName: message.payload.userName, //CHANGED
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
        });

        const otherUsers: Map<string, any> = new Map(
          message.payload.users.map((user: any) => [user.userName, user]) //CHANGED
        );

        setUsers(otherUsers);
        break;
      }

      case "user-joined": {
        const { userId, userName, x, y } = message.payload;
        if (userId !== currentUser?.userId) {
          setUsers((prev) =>
            new Map(prev).set(userId, { userId, userName, x, y })
          );
        }
        break;
      }

      case "movement": {
        const { userId, userName, x, y } = message.payload;
        if (userId !== currentUser?.userId) {
          setUsers((prev) => {
            const updatedUsers = new Map(prev);
            if (updatedUsers.has(userId)) {
              updatedUsers.get(userId)!.userName = userName;
              updatedUsers.get(userId)!.x = x;
              updatedUsers.get(userId)!.y = y;
            }
            return updatedUsers;
          });
        }
        break;
      }

      case "moved": {
        const { x, y } = message.payload;
        setCurrentUser((prev: any) => ({ ...prev, x, y }));
        break;
      }

      case "movement-rejected": {
        const { x, y } = message.payload;
        setCurrentUser((prev: any) => ({ ...prev, x, y }));
        break;
      }

      case "user-left": {
        const { userId } = message.payload;
        setUsers((prev) => {
          const updatedUsers = new Map(prev);
          updatedUsers.delete(userId);
          return updatedUsers;
        });
        break;
      }
    }
  };

  const handleMove = (newX: number, newY: number) => {
    if (!currentUser) return;

    // Restrict movement within accessible bounds
    const { x, y } = params.bounds;
    if (newX < 0 || newX >= x || newY < 0 || newY >= y) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "move",
        payload: {
          userId: currentUser.userId,
          userName: currentUser.userName,
          x: newX,
          y: newY,
        },
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!currentUser) return;

    const { x, y } = currentUser;
    switch (e.key) {
      case "ArrowUp":
        handleMove(x, y - 1);
        break;
      case "ArrowDown":
        handleMove(x, y + 1);
        break;
      case "ArrowLeft":
        handleMove(x - 1, y);
        break;
      case "ArrowRight":
        handleMove(x + 1, y);
        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const { width, height } = viewportSize;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!currentUser) return;

    const cellSize = 50;
    const { x: maxX, y: maxY } = params.bounds;
    const offsetX = Math.floor(width / 2 - currentUser.x * cellSize);
    const offsetY = Math.floor(height / 2 - currentUser.y * cellSize);

    // ctx.fillStyle = "#a4d3a2"; // Light grass green
    // ctx.fillRect(0, 0, width, height);
    // for (let x = 0; x < maxX; x++) {
    //   for (let y = 0; y < maxY; y++) {
    //     const cellX = offsetX + x * cellSize;
    //     const cellY = offsetY + y * cellSize;

    //     // Draw a grass patch
    //     ctx.fillStyle = (x + y) % 2 === 0 ? "#7fc47f" : "#a4d3a2"; // Alternate shades
    //     ctx.fillRect(cellX, cellY, cellSize, cellSize);

    //     ctx.strokeStyle = "#aaa";
    //     ctx.strokeRect(cellX, cellY, cellSize, cellSize); // Grid lines
    //   }
    // }

    // Draw grid and accessible area
    for (let x = 0; x < maxX; x++) {
      for (let y = 0; y < maxY; y++) {
        const cellX = offsetX + x * cellSize;
        const cellY = offsetY + y * cellSize;

        if (x > maxX + 1 || y > maxY + 1) {
          ctx.fillStyle = "#ddd"; // Non-accessible area
        } else {
          ctx.fillStyle = "#d1ffd6"; // Accessible area
        }

        ctx.fillRect(cellX, cellY, cellSize, cellSize);
        ctx.strokeStyle = "#aaa";
        ctx.strokeRect(cellX, cellY, cellSize, cellSize);
      }
    }

    // Walls (visible borders)
    ctx.strokeStyle = "#9ca3af"; // Bold blue color for walls
    ctx.lineWidth = 10; // Make walls thicker

    // Top and bottom walls
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX + maxX * cellSize, offsetY); // Top wall
    ctx.moveTo(offsetX, offsetY + maxY * cellSize);
    ctx.lineTo(offsetX + maxX * cellSize, offsetY + maxY * cellSize); // Bottom wall
    ctx.stroke();

    // Left and right walls
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX, offsetY + maxY * cellSize); // Left wall
    ctx.moveTo(offsetX + maxX * cellSize, offsetY);
    ctx.lineTo(offsetX + maxX * cellSize, offsetY + maxY * cellSize); // Right wall
    ctx.stroke();

    // Draw rulers (grid lines)
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    // Draw horizontal ruler (top)
    for (let x = 0; x < maxX; x++) {
      const rulerX = offsetX + x * cellSize + cellSize / 2;
      ctx.beginPath();
      ctx.moveTo(rulerX, offsetY);
      ctx.lineTo(rulerX, offsetY - 10);
      ctx.stroke();
      ctx.fillStyle = "#000";
      ctx.fillText(x.toString(), rulerX - 5, offsetY - 15);
    }

    // Draw vertical ruler (left)
    for (let y = 0; y < maxY; y++) {
      const rulerY = offsetY + y * cellSize + cellSize / 2;
      ctx.beginPath();
      ctx.moveTo(offsetX, rulerY);
      ctx.lineTo(offsetX - 10, rulerY);
      ctx.stroke();
      ctx.fillStyle = "#000";
      ctx.fillText(y.toString(), offsetX - 30, rulerY + 5);
    }

    // Draw current user
    ctx.fillStyle = "#FF6B6B";
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.fillRect(width / 2 - 30, height / 2 - 50, 60, 20); // Background for text
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.font = "12px Arial";
    ctx.fillText("You", width / 2, height / 2 - 35);

    // Draw other users
    users.forEach((user) => {
      const userX = offsetX + user.x * cellSize + cellSize / 2;
      const userY = offsetY + user.y * cellSize + cellSize / 2;

      ctx.fillStyle = "#2c3db8";
      ctx.beginPath();
      ctx.arc(userX, userY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(userX - 30, userY - 50, 60, 20); // Background for text
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.font = "12px Arial";
      ctx.fillText(user.userName, userX, userY - 35);
    });
  }, [currentUser, users, viewportSize, params.bounds]);

  return (
    <div
      className="p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        outline: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Arena</h1>
      <canvas
        ref={canvasRef}
        width={viewportSize.width - 50}
        height={viewportSize.height - 150}
        className="rounded shadow-lg bg-gray-200 text-[#2c3db8]"
      />
      <p className="mt-2 text-sm text-gray-600 italic">
        Use arrow keys to navigate your avatar.
      </p>
    </div>
  );
};

export default ArenaPage;
