"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function MessagePage() {
  const { userId } = useParams(); // Get userId from the URL
  const [recipientName, setRecipientName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecipientName() {
      try {
        // Fetch recipient details (replace with actual API call or logic)
        const response = await fetch(`/api/recipient/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch recipient details");
        }
        const data = await response.json();
        setRecipientName(data.name || "Unknown User");
      } catch (err) {
        setError(err.message);
      }
    }

    if (userId) {
      fetchRecipientName();
    }
  }, [userId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!recipientName) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Message {recipientName}</h1>
      <p>Send a message to {recipientName} (User ID: {userId})</p>
    </div>
  );
}