"use client";
import { useState } from "react";
import type { McpApprovalRequestItem } from "@/lib/assistant";
import { Button } from "./ui/button";

type Props = {
  item: McpApprovalRequestItem;
  onRespond: (approve: boolean, id: string) => void;
};

export default function McpApproval({ item, onRespond }: Props) {
  const [disabled, setDisabled] = useState(false);

  const handle = (approve: boolean) => {
    setDisabled(true);
    onRespond(approve, item.id);
  };

  return (
    <div className="flex flex-col">
      <div className="flex">
        <div className="mr-4 rounded-[16px] bg-gray-100 p-4 font-light text-black md:mr-24">
          <div className="mb-2 text-sm">
            Request to execute tool{" "}
            <span className="font-medium">{item.name}</span> on server{" "}
            <span className="font-medium">{item.server_label}</span>.
          </div>
          <div className="flex gap-2">
            <Button disabled={disabled} onClick={() => handle(true)} size="sm">
              Approve
            </Button>
            <Button
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800"
              disabled={disabled}
              onClick={() => handle(false)}
              size="sm"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
