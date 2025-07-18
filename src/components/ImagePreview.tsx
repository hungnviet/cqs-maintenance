import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  smallClassName?: string;
  largeClassName?: string;
}

export default function ImagePreview({ src, alt = '', smallClassName = 'w-16 h-16 object-cover rounded cursor-pointer', largeClassName = 'w-[60vw] max-w-2xl h-auto object-contain rounded' }: ImagePreviewProps) {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={smallClassName}
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex items-center justify-center !max-w-none w-auto bg-transparent shadow-none p-0">
          <DialogTitle asChild>
            <span className="sr-only">Image preview: {alt}</span>
          </DialogTitle>
          <img src={src} alt={alt} className={largeClassName} />
        </DialogContent>
      </Dialog>
    </>
  );
}
