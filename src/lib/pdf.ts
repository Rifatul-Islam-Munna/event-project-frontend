import * as pdfjs from 'pdfjs-dist/webpack.mjs';

export async function pdfToPng(file: File): Promise<File> {
  const pdf = await pdfjs.getDocument(await file.arrayBuffer()).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 3 });
  
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: canvas.getContext('2d')!,
    viewport
  }).promise;
  
  const blob = await new Promise<Blob>(r => canvas.toBlob(b => r(b!), 'image/png'));
  return new File([blob], file.name.replace('.pdf', '.png'), { type: 'image/png' });
}
