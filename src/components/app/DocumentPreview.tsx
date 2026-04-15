'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';

const PdfPreview = dynamic(() => import('@/components/app/PdfPreview'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-96 items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  ),
});

type DocumentPreviewProps = {
  fileUrl: string;
  title: string;
  zoom: number;
};

export default function DocumentPreview({ fileUrl, title, zoom }: DocumentPreviewProps) {
  const [docxHtml, setDocxHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const extension = getExtension(fileUrl);

  useEffect(() => {
    let cancelled = false;

    const renderDocx = async () => {
      if (extension !== 'docx') return;

      try {
        setLoading(true);
        setError('');
        setDocxHtml('');

        const mammoth = await import('mammoth/mammoth.browser');
        const response = await fetch(encodeURI(fileUrl));
        if (!response.ok) throw new Error('Unable to load Word document');

        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (!cancelled) setDocxHtml(result.value);
      } catch (err) {
        console.error('Word preview error:', err);
        if (!cancelled) setError('Unable to render this Word document preview.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    renderDocx();

    return () => {
      cancelled = true;
    };
  }, [extension, fileUrl]);

  if (extension === 'pdf') {
    return <PdfPreview fileUrl={fileUrl} zoom={zoom} />;
  }

  if (extension === 'docx') {
    return (
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 text-black shadow-2xl" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
        {loading && (
          <div className="flex min-h-72 items-center justify-center gap-3 text-neutral-600">
            <Loader2 className="animate-spin text-primary" size={24} />
            Rendering Word preview...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        {!loading && !error && (
          <article
            className="prose max-w-none prose-headings:text-black prose-p:text-neutral-800 prose-li:text-neutral-800"
            dangerouslySetInnerHTML={{ __html: docxHtml }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-lg border border-border bg-card p-10 text-center">
      <FileText className="text-primary" size={48} />
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-muted">
          Secure in-app preview is available for PDF and DOCX files. This older document format cannot be rendered safely in the browser without conversion.
        </p>
      </div>
    </div>
  );
}

function getExtension(fileUrl: string) {
  return fileUrl.split('?')[0].split('.').pop()?.toLowerCase() || '';
}
