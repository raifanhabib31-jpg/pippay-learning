export interface ExtractedFileResult {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'pptx' | 'docx' | 'txt' | 'text';
  fileSize: string;
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
    const text = await extractTextFromPDF(file);
    return { text, fileName, fileType: 'pdf', fileSize };
  } else if (ext === 'docx') {
    const text = await extractTextFromDocx(file);
    return { text, fileName, fileType: 'docx', fileSize };
  } else if (ext === 'pptx') {
    const text = await extractTextFromPptx(file);
    return { text, fileName, fileType: 'pptx', fileSize };
  } else {
    // txt, md, html, json, etc.
    const text = await file.text();
    return { text, fileName, fileType: 'txt', fileSize };
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamic import to prevent bundle crashing on initial page load / unsupported browsers
    const pdfjsLib = await import('pdfjs-dist');
    
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += `\n--- Halaman ${i} ---\n` + pageText;
    }

    return fullText.trim() || 'Teks tidak ditemukan atau dokumen berupa pindaian gambar.';
  } catch (error) {
    console.error('PDF parsing error:', error);
    // Fallback simple raw text extraction
    try {
      const rawText = await file.text();
      const clean = rawText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean.length > 50) return clean;
    } catch {
      // ignore
    }
    return `[Gagal mengekstrak teks PDF secara otomatis. Silakan salin dan tempel teks dari file ${file.name} ke kolom input manual jika diperlukan.]`;
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

async function extractTextFromPptx(file: File): Promise<string> {
  try {
    const JSZip = (await import('jszip')).default || (await import('jszip'));
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    let fullText = '';
    let slideIndex = 1;

    // Search slide XML files
    const slideEntries: string[] = [];
    zip.forEach((relativePath) => {
      if (relativePath.match(/^ppt\/slides\/slide[0-9]+\.xml$/)) {
        slideEntries.push(relativePath);
      }
    });

    // Sort slides numerically
    slideEntries.sort((a, b) => {
      const numA = parseInt(a.match(/slide([0-9]+)\.xml/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide([0-9]+)\.xml/)?.[1] || '0', 10);
      return numA - numB;
    });

    for (const slidePath of slideEntries) {
      const slideXml = await zip.file(slidePath)?.async('text');
      if (slideXml) {
        // Extract text inside <a:t>...</a:t>
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

    return fullText.trim() || 'Teks presentasi kosong atau berbasis gambar saja.';
  } catch (error) {
    console.error('PPTX parsing error:', error);
    return `[Gagal mengekstrak PPTX: ${error instanceof Error ? error.message : 'Error'}]`;
  }
}
