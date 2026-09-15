export interface ExtractedFileResult {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'pptx' | 'docx' | 'txt' | 'text';
  fileSize: string;
  images?: string[]; // base64 data URLs of extracted page/slide images
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export async function parseDocumentFile(file: File): Promise<ExtractedFileResult> {
  const fileName = file.name;
  const fileSize = formatFileSize(file.size);
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf') {
    const { text, images } = await extractTextAndImagesFromPDF(file);
    return { text, fileName, fileType: 'pdf', fileSize, images };
  } else if (ext === 'docx') {
    const text = await extractTextFromDocx(file);
    return { text, fileName, fileType: 'docx', fileSize };
  } else if (ext === 'pptx') {
    const { text, images } = await extractTextAndImagesFromPptx(file);
    return { text, fileName, fileType: 'pptx', fileSize, images };
  } else {
    // txt, md, html, json, etc.
    const text = await file.text();
    return { text, fileName, fileType: 'txt', fileSize };
  }
}

async function extractTextAndImagesFromPDF(file: File): Promise<{ text: string; images: string[] }> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    const images: string[] = [];

    // Render up to 8 pages max to avoid large localStorage usage
    const maxPages = Math.min(pdf.numPages, 8);

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      // Extract text
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += `\n--- Halaman ${i} ---\n` + pageText;

      // Render page to canvas image (only first maxPages pages)
      if (i <= maxPages) {
        try {
          const scale = 1.2;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;
            images.push(canvas.toDataURL('image/jpeg', 0.75));
          }
        } catch {
          // Page render failed, skip image for this page
        }
      }
    }

    return {
      text: fullText.trim() || 'Teks tidak ditemukan atau dokumen berupa pindaian gambar.',
      images,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    try {
      const rawText = await file.text();
      const clean = rawText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean.length > 50) return { text: clean, images: [] };
    } catch {
      // ignore
    }
    return {
      text: `[Gagal mengekstrak teks PDF secara otomatis. Silakan salin dan tempel teks dari file ${file.name} ke kolom input manual jika diperlukan.]`,
      images: [],
    };
  }
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const mammoth = (await import('mammoth')).default || (await import('mammoth'));
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim() || 'Dokumen kosong.';
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return `[Gagal mengekstrak DOCX: ${error instanceof Error ? error.message : 'Error'}]`;
  }
}

async function extractTextAndImagesFromPptx(file: File): Promise<{ text: string; images: string[] }> {
  try {
    const JSZip = (await import('jszip')).default || (await import('jszip'));
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    let fullText = '';
    let slideIndex = 1;
    const images: string[] = [];

    // Extract slide texts
    const slideEntries: string[] = [];
    zip.forEach((relativePath) => {
      if (relativePath.match(/^ppt\/slides\/slide[0-9]+\.xml$/)) {
        slideEntries.push(relativePath);
      }
    });

    slideEntries.sort((a, b) => {
      const numA = parseInt(a.match(/slide([0-9]+)\.xml/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide([0-9]+)\.xml/)?.[1] || '0', 10);
      return numA - numB;
    });

    for (const slidePath of slideEntries) {
      const slideXml = await zip.file(slidePath)?.async('text');
      if (slideXml) {
        const matches = slideXml.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [];
        const slideText = matches
          .map((m) => m.replace(/<\/?a:t>/g, ''))
          .join(' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");

        if (slideText.trim()) {
          fullText += `\n--- Slide ${slideIndex} ---\n` + slideText.trim() + '\n';
        }
      }
      slideIndex++;
    }

    // Extract embedded images from ppt/media/ (max 8 images)
    const imageEntries: string[] = [];
    zip.forEach((relativePath) => {
      if (relativePath.match(/^ppt\/media\/.*\.(png|jpg|jpeg|gif|bmp|webp)$/i)) {
        imageEntries.push(relativePath);
      }
    });

    const maxImages = Math.min(imageEntries.length, 8);
    for (let i = 0; i < maxImages; i++) {
      try {
        const imgData = await zip.file(imageEntries[i])?.async('base64');
        const ext = imageEntries[i].split('.').pop()?.toLowerCase() || 'png';
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
        if (imgData) {
          images.push(`data:${mimeType};base64,${imgData}`);
        }
      } catch {
        // skip failed image
      }
    }

    return {
      text: fullText.trim() || 'Teks presentasi kosong atau berbasis gambar saja.',
      images,
    };
  } catch (error) {
    console.error('PPTX parsing error:', error);
    return {
      text: `[Gagal mengekstrak PPTX: ${error instanceof Error ? error.message : 'Error'}]`,
      images: [],
    };
  }
}
