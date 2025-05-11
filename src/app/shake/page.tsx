"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface AccelerationData {
  x: number;
  y: number;
  z: number;
}

export default function ShakePage() {
  const [shakeCount, setShakeCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to the Socket.IO server
    const _socket = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000", {
      path: "/api/socket",
    });
    setSocket(_socket);

    return () => {
      // Disconnect the socket when the component is unmounted
      if (_socket) _socket.disconnect();
    };
  }, []);

  const startShakeDetection = () => {
    let lastX: number | undefined, lastY: number | undefined, lastZ: number | undefined;
    let moveCounter = 0;

    const threshold = 15; // Sensitivity threshold
    const cooldownPeriod = 100; // Cooldown in ms
    let lastShakeTime = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x, y, z } = acceleration as AccelerationData;

      if (lastX !== undefined && lastY !== undefined && lastZ !== undefined) {
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);

        if (deltaX + deltaY + deltaZ > threshold) {
          moveCounter++;
          if (moveCounter > 2) {
            const currentTime = new Date().getTime();
            if (currentTime - lastShakeTime > cooldownPeriod) {
              setShakeCount((prevCount) => prevCount + 1);
              if (socket?.connected) {
                socket.emit("sendShake"); // Send shake event to the server
              }
              lastShakeTime = currentTime;
            }
            moveCounter = 0;
          }
        } else {
          moveCounter = 0;
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    const requestMotionPermission = () => {
      const deviceMotion = DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<PermissionState>;
      };
      if (deviceMotion.requestPermission) {
        deviceMotion
          .requestPermission()
          .then((permissionState) => {
            if (permissionState === "granted") {
              window.addEventListener("devicemotion", handleMotion);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener("devicemotion", handleMotion);
      }
    };

    requestMotionPermission();
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <button
        type="button"
        className="text-2xl text-green-900 font-medium px-12 py-4 bg-white rounded-lg shadow-lg"
        onClick={startShakeDetection}
      >
        กดเพื่อเริ่ม!
      </button>
      <h1 className="text-8xl font-bold text-white mt-8">{shakeCount}</h1>
    </div>
  );
}
