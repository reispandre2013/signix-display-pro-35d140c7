function toDirectMediaUrl(url) {
  if (!url) return "";
  const normalizedUrl = url.trim();
  const isGoogleDrive = /(?:drive|docs)\.google\.com|googleusercontent\.com/.test(normalizedUrl);
  const driveId =
    normalizedUrl.match(/drive\.google\.com\/file\/d\/([^/?]+)/)?.[1] ||
    normalizedUrl.match(/drive\.google\.com\/thumbnail\?id=([^&]+)/)?.[1] ||
    normalizedUrl.match(/lh3\.googleusercontent\.com\/d\/([^=/?]+)/)?.[1] ||
    (isGoogleDrive ? normalizedUrl.match(/[?&]id=([^&]+)/)?.[1] : void 0);
  if (driveId) return `https://lh3.googleusercontent.com/d/${driveId}=w1600`;
  if (normalizedUrl.includes("dropbox.com")) {
    const cleanUrl = normalizedUrl.replace(/[?&](dl|raw)=\d/g, "");
    return cleanUrl.concat(cleanUrl.includes("?") ? "&raw=1" : "?raw=1");
  }
  return normalizedUrl;
}
function getMediaUrlCandidates(...urls) {
  return Array.from(new Set(urls.map((url) => toDirectMediaUrl(url)).filter(Boolean)));
}
function applyMediaFallback(img) {
  const sources = JSON.parse(img.dataset.sources ?? "[]");
  const currentIndex = Number(img.dataset.sourceIndex ?? "0");
  const nextSource = sources[currentIndex + 1];
  if (!nextSource) {
    img.style.display = "none";
    return;
  }
  img.style.display = "";
  img.dataset.sourceIndex = String(currentIndex + 1);
  img.src = nextSource;
}
export { applyMediaFallback as a, getMediaUrlCandidates as g };
