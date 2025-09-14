import Image from "next/image";
import type React from "react";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import type { MessageItem } from "@/lib/assistant";

// Hoisted regex to avoid recreating it on each render
const IMAGE_EXT_REGEX = /\.(png|jpg|jpeg|gif|webp|svg)$/i;

// Prefer `type` over `interface` for simple props shapes
type MessageProps = {
  message: MessageItem;
};

const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="text-sm">
      {message.role === "user" ? (
        <div className="flex justify-end">
          <div>
            <div className="ml-4 rounded-[16px] bg-[#ededed] px-4 py-2 font-light text-stone-900 md:ml-24">
              <div>
                <div>{message.content[0].text as string}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex">
            <div className="mr-4 rounded-[16px] bg-white px-4 py-2 font-light text-black md:mr-24">
              <div>
                {message.content[0].reasoning ? (
                  <Reasoning
                    isStreaming={Boolean(
                      message.content[0].reasoning_streaming
                    )}
                  >
                    <ReasoningTrigger />
                    <ReasoningContent>
                      {message.content[0].reasoning as string}
                    </ReasoningContent>
                  </Reasoning>
                ) : null}
                <Response>{message.content[0].text as string}</Response>
                {message.content[0].annotations
                  ?.filter(
                    (a) =>
                      a.type === "container_file_citation" &&
                      a.filename &&
                      IMAGE_EXT_REGEX.test(a.filename)
                  )
                  ?.map((a, i) => (
                    <Image
                      alt={a.filename || ""}
                      className="mt-2 max-w-full"
                      key={
                        a.fileId ||
                        `${a.containerId ?? "container"}-${a.filename ?? i}`
                      }
                      src={`/api/container_files/content?file_id=${a.fileId}${a.containerId ? `&container_id=${a.containerId}` : ""}${a.filename ? `&filename=${encodeURIComponent(a.filename)}` : ""}`}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
