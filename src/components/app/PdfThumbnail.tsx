'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';

interface PdfThumbnailProps {
  fileUrl: string;
}

export default function PdfThumbnail({ fileUrl }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const renderThumbnail = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Import pdfjs dynamically to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const loadingTask = pdfjsLib.getDocument(encodeURI(fileUrl));
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        if (!isMounted || !canvasRef.current) return;

        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error('Thumbnail error:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    renderThumbnail();

    return () => {
      isMounted = false;
    };
  }, [fileUrl]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-neutral-900">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      )}
      
      {error ? (
        <div className="flex flex-col items-center gap-2 text-muted">
          <FileText size={48} />
          <span className="text-[10px] uppercase font-bold tracking-tighter">No Preview</span>
        </div>
      ) : (
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
      )}
    </div>
  );
}
