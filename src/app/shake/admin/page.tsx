"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Socket, io } from "socket.io-client";

export default function Admin() {
    const [shakeCount, setShakeCount] = useState(0);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Connect to the Socket.IO server
    function connectSocketIO() {
        const _socket = io(
            process.env.NEXT_PUBLIC_API_URL ?? "https://d-youth-dropbox.vercel.app"
        );

        _socket.on("updateShakeCount", (count) => {
            setShakeCount(count);
        });

        setSocket(_socket);
    }

    // Handle resetting the scores
    async function resetScores() {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-shake`, {
                method: "POST",
            });

            if (response.ok) {
                setShakeCount(0);
                toast.success("Shake scores reset successfully!");
            } else {
                throw new Error("Failed to reset scores");
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        }
    }

    useEffect(() => {
        connectSocketIO();

        return () => {
            if (socket?.connected) {
                socket.disconnect();
            }
        };
    }, []);

    return (
        <div className="relative w-full min-h-[100dvh] p-6 bg-gray-100">
            <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

            <div className="mb-8">
                <span className="text-2xl font-medium">Total Shakes:</span>
                <h2 className="text-6xl font-bold">{shakeCount.toLocaleString()}</h2>
            </div>

            <div className="mb-8">
                <button
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition active:scale-95"
                    onClick={resetScores}
                >
                    Reset Scores
                </button>
            </div>

            <div>
                <h2 className="text-2xl font-medium mb-4">Share QR Code:</h2>
            </div>
        </div>
    );
}