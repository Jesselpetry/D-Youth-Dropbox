"use client";

// This is shake page

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Socket, io } from "socket.io-client";

interface AccelerationData {
    x: number;
    y: number;
    z: number;
}

export default function Home() {
    const [shakeCount, setShakeCount] = useState(0);
    const [isStart, setStart] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    function connectSocketIO() {
        const _socket = io(
            process.env.NEXT_PUBLIC_API_URL ??
                "https://openhouse-shake-api.it22.dev"
        );
        _socket.on("rateLimitExceeded", (info) => {
            toast.error(`คุณเขย่าเร็วเกินไปแล้ว เป็นบอทรึเปล่าา, โปรดลองใหม่ในอีก ${info.resetIn} วินาที`)
        });
        setSocket(_socket);
    }

    function start() {
        let lastX: number | undefined,
            lastY: number | undefined,
            lastZ: number | undefined;
        let moveCounter = 0;

        const threshold = 15; // Adjust this value to change shake sensitivity
        const cooldownPeriod = 100; // 1 second cooldown between shakes
        let lastShakeTime = 0;

        const handleMotion = (event: DeviceMotionEvent) => {
            const acceleration = event.accelerationIncludingGravity;
            if (!acceleration) return;

            const { x, y, z } = acceleration as AccelerationData;

            if (
                typeof lastX !== "undefined" &&
                typeof lastY !== "undefined" &&
                typeof lastZ !== "undefined"
            ) {
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
                                socket.emit("sendShake");
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
            const deviceMotion = DeviceMotionEvent as any;
            if (typeof deviceMotion.requestPermission === "function") {
                deviceMotion
                    .requestPermission()
                    .then((permissionState: PermissionState) => {
                        if (permissionState === "granted") {
                            window.addEventListener(
                                "devicemotion",
                                handleMotion
                            );
                        }
                    })
                    .catch(console.error);
            } else {
                window.addEventListener("devicemotion", handleMotion);
            }
        };

        requestMotionPermission();
        setStart(true);
    }

    useEffect(() => {
        connectSocketIO();
        return () => {
            setStart(false);
            if (socket?.connected) {
                socket.disconnect();
            }
        };
    }, []);

    return (
        <div className="relative w-full min-h-[100dvh]">
            <img
                className="absolute w-full h-full object-cover object-center"
                src="https://openhouse.it.kmitl.ac.th/main-bg.webp"
                alt="main-bg"
            />
            <div className="absolute w-full h-full flex flex-col justify-center items-center">
                {isStart ? (
                    <h1 className="text-8xl font-semibold">
                        {shakeCount.toLocaleString()}
                    </h1>
                ) : (
                    <button
                        type="button"
                        className="text-2xl font-medium px-12 py-4 bg-white/10 rounded-xl border-2 border-white/10 transition active:scale-95"
                        onClick={(e) => {
                            e.preventDefault();
                            start();
                        }}
                    >
                        คลิกเพื่อเริ่มเขย่า
                    </button>
                )}
            </div>

            {isStart && (
                <p className="absolute bottom-16 left-1/2 -translate-x-1/2 font-medium text-2xl">
                    เขย่ามือถือของคุณ!
                </p>
            )}
        </div>
    );
}