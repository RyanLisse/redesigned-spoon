"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Assistant from "@/components/assistant";
import useConversationStore from "@/stores/useConversationStore";

export default function Main() {
  const router = useRouter();
  const { resetConversation } = useConversationStore();

  // After OAuth redirect, reinitialize the conversation so the next turn
  // uses the connector-enabled server configuration immediately
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isConnected = new URLSearchParams(window.location.search).get(
      "connected"
    );
    if (isConnected === "1") {
      resetConversation();
      router.replace("/", { scroll: false });
    }
  }, [router, resetConversation]);

  return (
    <div className="flex h-full justify-center">
      <div className="w-full">
        <Assistant />
      </div>
    </div>
  );
}
