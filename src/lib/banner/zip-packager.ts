import JSZip from "jszip";
import { renderMatchBannerToPng } from "./renderer";
import { MatchBannerData, BannerSize } from "./types";

export interface BatchBannerItem {
  filename: string;
  data: MatchBannerData;
  templateId?: string;
  size?: BannerSize;
}

export async function createBatchBannersZip(
  items: BatchBannerItem[]
): Promise<Buffer> {
  const zip = new JSZip();

  for (const item of items) {
    try {
      const pngBuffer = await renderMatchBannerToPng(item.data, {
        templateId: item.templateId || "modern-bold",
        size: item.size || "SQUARE_1080x1080",
      });
      zip.file(item.filename, pngBuffer);
    } catch (err) {
      console.error(`Failed to render banner for ${item.filename}:`, err);
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return zipBuffer;
}
