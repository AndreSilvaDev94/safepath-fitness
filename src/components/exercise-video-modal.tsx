'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ExerciseVideoModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  videoUrl: string;
}

export function ExerciseVideoModal({
  isOpen,
  setIsOpen,
  title,
  videoUrl,
}: ExerciseVideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Watch this video to ensure you're performing the exercise correctly
            and safely.
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video overflow-hidden rounded-lg">
          <iframe
            width="100%"
            height="100%"
            src={videoUrl}
            title={`YouTube video player for ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
