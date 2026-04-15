'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { PDFPageProxy } from 'pdfjs-dist';

type PdfPreviewProps = {
  fileUrl: string;
  zoom: number;
};

export default function PdfPreview({ fileUrl, zoom }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const renderPdf = async () => {
      try {
        setLoading(true);
        setError('');

        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const pdf = await pdfjsLib.getDocument(encodeURI(fileUrl)).promise;
        if (cancelled) return;

        setPageCount(pdf.numPages);

        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });

        if (cancelled || !containerRef.current) return;

        const canvases = Array.from(containerRef.current.querySelectorAll('canvas'));
        const scale = zoom / 100;
        const pixelRatio = window.devicePixelRatio || 1;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          const canvas = canvases[pageNumber - 1];
          if (!canvas) continue;

          await renderPage(page, canvas, scale, pixelRatio);
        }

        if (!cancelled) setLoading(false);
      } catch (err) {
        console.error('PDF preview error:', err);
        if (!cancelled) {
          setError('Unable to render PDF preview.');
          setLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [fileUrl, zoom]);

  return (
    <div className="relative min-h-full">
      {loading && (
        <div className="sticky top-4 z-10 mx-auto mb-4 flex w-fit items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm text-muted shadow-xl">
          <Loader2 className="animate-spin text-primary" size={18} />
          Rendering preview...
        </div>
      )}

      {error ? (
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={18} />
          {error}
        </div>
      ) : (
        <div ref={containerRef} className="flex flex-col items-center gap-6 pb-10">
          {Array.from({ length: pageCount }).map((_, index) => (
            <canvas key={`${fileUrl}-${index}`} className="max-w-none rounded-md bg-white shadow-2xl" />
          ))}
        </div>
      )}
    </div>
  );
}

async function renderPage(page: PDFPageProxy, canvas: HTMLCanvasElement, scale: number, pixelRatio: number) {
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext('2d');
  if (!context) return;

  canvas.width = Math.floor(viewport.width * pixelRatio);
  canvas.height = Math.floor(viewport.height * pixelRatio);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  await page.render({
    canvas,
    canvasContext: context,
    viewport,
  }).promise;
}
