"use client";
import { CircleX, FilePlus2, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type FileUploadProps = {
  vectorStoreId?: string;
  vectorStoreName?: string;
  onAddStore: (id: string) => void;
  onUnlinkStore: () => void;
};

export default function FileUpload({
  vectorStoreId,
  onAddStore,
  onUnlinkStore,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [newStoreName, setNewStoreName] = useState<string>("Default store");
  const [uploading, setUploading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const acceptedFileTypes = {
    "text/x-c": [".c"],
    "text/x-c++": [".cpp"],
    "text/x-csharp": [".cs"],
    "text/css": [".css"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "text/x-golang": [".go"],
    "text/html": [".html"],
    "text/x-java": [".java"],
    "text/javascript": [".js"],
    "application/json": [".json"],
    "text/markdown": [".md"],
    "application/pdf": [".pdf"],
    "text/x-php": [".php"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      [".pptx"],
    "text/x-python": [".py"],
    "text/x-script.python": [".py"],
    "text/x-ruby": [".rb"],
    "application/x-sh": [".sh"],
    "text/x-tex": [".tex"],
    "application/typescript": [".ts"],
    "text/plain": [".txt"],
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: acceptedFileTypes,
  });

  const removeFile = () => {
    setFile(null);
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    setUploading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64Content = arrayBufferToBase64(arrayBuffer);
      const fileObject = {
        name: file.name,
        content: base64Content,
      };

      // 1. Upload file
      const uploadResponse = await fetch("/api/vector_stores/upload_file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileObject,
        }),
      });
      if (!uploadResponse.ok) {
        throw new Error("Error uploading file");
      }
      const uploadData = await uploadResponse.json();
      const fileId = uploadData.id;
      if (!fileId) {
        throw new Error("Error getting file ID");
      }

      let finalVectorStoreId = vectorStoreId;

      // 2. If no vector store is linked, create one
      if (!vectorStoreId || vectorStoreId === "") {
        const createResponse = await fetch("/api/vector_stores/create_store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeName: newStoreName,
          }),
        });
        if (!createResponse.ok) {
          throw new Error("Error creating vector store");
        }
        const createData = await createResponse.json();
        finalVectorStoreId = createData.id;
      }

      if (!finalVectorStoreId) {
        throw new Error("Error getting vector store ID");
      }

      onAddStore(finalVectorStoreId);

      // 3. Add file to vector store
      const addFileResponse = await fetch("/api/vector_stores/add_file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          vectorStoreId: finalVectorStoreId,
        }),
      });
      if (!addFileResponse.ok) {
        throw new Error("Error adding file to vector store");
      }
      const _addFileData = await addFileResponse.json();
      setFile(null);
      setDialogOpen(false);
    } catch (_error) {
      alert("There was an error processing your file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <div className="flex cursor-pointer items-center justify-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 font-medium text-sm transition-all hover:bg-zinc-50">
          <Plus size={16} />
          Upload
        </div>
      </DialogTrigger>
      <DialogContent className="overflow-y-scrollfrtdtd max-h-[80vh] sm:max-w-[500px] md:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add files to your vector store</DialogTitle>
          </DialogHeader>
          <div className="my-6">
            {!vectorStoreId || vectorStoreId === "" ? (
              <div className="flex items-start gap-2 text-sm">
                <label className="w-72 font-medium" htmlFor="storeName">
                  New vector store name
                  <div className="text-xs text-zinc-400">
                    A new store will be created when you upload a file.
                  </div>
                </label>
                <Input
                  className="rounded border p-2"
                  id="storeName"
                  onChange={(e) => setNewStoreName(e.target.value)}
                  type="text"
                  value={newStoreName}
                />
              </div>
            ) : (
              <div className="flex min-w-0 flex-1 items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="w-24 text-nowrap font-medium text-sm">
                    Vector store
                  </div>
                  <div className="flex-1 truncate text-ellipsis font-mono text-xs text-zinc-400">
                    {vectorStoreId}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CircleX
                          className="mt-0.5 mb-0.5 shrink-0 cursor-pointer text-zinc-400 transition-all hover:text-zinc-700"
                          onClick={() => onUnlinkStore()}
                          size={16}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Unlink vector store</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
          </div>
          <div className="mb-4 flex h-[200px] items-center justify-center">
            {file ? (
              <div className="flex flex-col items-start">
                <div className="text-zinc-400">Loaded file</div>
                <div className="mt-2 flex items-center">
                  <div className="mr-2 text-zinc-900">{file.name}</div>

                  <Trash2
                    className="cursor-pointer text-zinc-900"
                    onClick={removeFile}
                    size={16}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  {...getRootProps()}
                  className="relative flex items-center justify-center p-6 focus-visible:outline-0"
                >
                  <input {...getInputProps()} />
                  <div
                    className={`absolute rounded-full transition-all duration-300 ${
                      isDragActive
                        ? "h-56 w-56 bg-zinc-100"
                        : "h-0 w-0 bg-transparent"
                    }`}
                  />
                  <div className="z-10 flex cursor-pointer flex-col items-center text-center">
                    <FilePlus2 className="mb-4 size-8 text-zinc-700" />
                    <div className="text-zinc-700">Upload a file</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button disabled={uploading} type="submit">
              {uploading ? "Uploading..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
