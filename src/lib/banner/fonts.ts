let cachedInterFont: ArrayBuffer | null = null;

export async function getInterFont(): Promise<ArrayBuffer> {
  if (cachedInterFont) return cachedInterFont;

  try {
    const res = await fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/inter-ui/3.19.3/Inter-Bold.woff"
    );
    if (!res.ok) {
      throw new Error("Failed to load font from CDN");
    }
    cachedInterFont = await res.arrayBuffer();
    return cachedInterFont;
  } catch (e) {
    // Fallback: minimal valid font buffer or retry from Google font
    const res = await fetch(
      "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf"
    );
    cachedInterFont = await res.arrayBuffer();
    return cachedInterFont;
  }
}
