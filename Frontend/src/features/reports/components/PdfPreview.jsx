import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Must be set in the same module that renders <Document>, or react-pdf's default overrides it.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const MAX_PAGE_WIDTH = 900;
const SIDE_GUTTER = 48;

function PdfPreview({ file, title, onLoad, sx }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const pageWidth = Math.min(Math.max(width - SIDE_GUTTER, 0), MAX_PAGE_WIDTH);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={containerRef}
      role="document"
      aria-label={title}
      sx={{
        height: '100%',
        overflowY: 'auto',
        py: 3,
        '& .react-pdf__Page': {
          mx: 'auto',
          mb: 3,
          width: 'fit-content',
          boxShadow: '0 6px 24px rgba(15, 23, 42, 0.12)',
        },
        ...sx,
      }}
    >
      <Document
        file={file}
        externalLinkTarget="_blank"
        loading={null}
        onLoadSuccess={({ numPages }) => setPageCount(numPages)}
        onLoadError={onLoad}
        error={
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 6 }}>
            The PDF preview could not be loaded.
          </Typography>
        }
      >
        {pageWidth > 0
          ? Array.from({ length: pageCount }, (_, index) => (
              <Page
                key={index}
                pageNumber={index + 1}
                width={pageWidth}
                loading={null}
                onRenderSuccess={index === 0 ? onLoad : undefined}
              />
            ))
          : undefined}
      </Document>
    </Box>
  );
}

export default PdfPreview;
