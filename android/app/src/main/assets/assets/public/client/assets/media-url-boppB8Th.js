function c(o) {
  if (!o) return "";
  const e = o.trim(),
    r = /(?:drive|docs)\.google\.com|googleusercontent\.com/.test(e),
    t =
      e.match(/drive\.google\.com\/file\/d\/([^/?]+)/)?.[1] ||
      e.match(/drive\.google\.com\/thumbnail\?id=([^&]+)/)?.[1] ||
      e.match(/lh3\.googleusercontent\.com\/d\/([^=/?]+)/)?.[1] ||
      (r ? e.match(/[?&]id=([^&]+)/)?.[1] : void 0);
  if (t) return `https://lh3.googleusercontent.com/d/${t}=w1600`;
  if (e.includes("dropbox.com")) {
    const n = e.replace(/[?&](dl|raw)=\d/g, "");
    return n.concat(n.includes("?") ? "&raw=1" : "?raw=1");
  }
  return e;
}
function a(...o) {
  return Array.from(new Set(o.map((e) => c(e)).filter(Boolean)));
}
function s(o) {
  const e = JSON.parse(o.dataset.sources ?? "[]"),
    r = Number(o.dataset.sourceIndex ?? "0"),
    t = e[r + 1];
  if (!t) {
    o.style.display = "none";
    return;
  }
  ((o.style.display = ""), (o.dataset.sourceIndex = String(r + 1)), (o.src = t));
}
export { s as a, a as g };
