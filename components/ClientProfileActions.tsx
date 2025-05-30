// components/ClientProfileActions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Share2, Github } from "lucide-react";

export default function ClientProfileActions({ githubUrl }: { githubUrl?: string }) {
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center md:items-end mt-4 md:mt-0">
      <Button variant="outline" className="w-full flex gap-2" onClick={handleShare}>
        <Share2 className="w-4 h-4" />Compartilhar Perfil
      </Button>
      {githubUrl && (
        <a href={githubUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full flex gap-2" variant="default">
            <Github className="w-4 h-4" />Ver no GitHub
          </Button>
        </a>
      )}
    </div>
  );
}
