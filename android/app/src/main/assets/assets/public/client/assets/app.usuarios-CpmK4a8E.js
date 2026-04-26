import {
  f as yt,
  r as a,
  j as c,
  R as Ae,
  g as bt,
  h as xt,
  _ as j,
  i as Te,
  k as Et,
  a as Ct,
  e as St,
  t as te,
  s as wt,
} from "./index-DUcMANMA.js";
import { P as Nt } from "./PageHeader-C0iFmY02.js";
import { P as Rt } from "./Panel-0HKdxBPL.js";
import { S as ge } from "./StatusBadge-Deydaofp.js";
import { L as Pt, a as Dt, E as jt } from "./States-snX8_8k6.js";
import { e as Ot, f as At } from "./use-supabase-data-neXhdC03.js";
import { u as Tt } from "./useServerFn-DoQM4vzC.js";
import { c as Mt } from "./createServerFn-CVG1bUiD.js";
import { c as W } from "./utils-BQHNewu7.js";
import { X as It } from "./x-Dpfm6mfs.js";
import { c as _t } from "./createLucideIcon-BDYLgomD.js";
import { U as kt } from "./users-CTV-MLrk.js";
import { M as Lt } from "./mail-Dxt7XpX_.js";
import { L as Ft } from "./loader-circle-BffduC8P.js";
const Wt = [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
    ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
    ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
    ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }],
  ],
  Ut = _t("user-plus", Wt),
  $t = Mt({ method: "POST" }).handler(
    yt("87d50a556753addcefbdda31b8f189739a7e7ba567a86abb808902c789a15842"),
  );
function O(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return function (o) {
    if ((e?.(o), n === !1 || !o.defaultPrevented)) return t?.(o);
  };
}
function ye(e, t) {
  if (typeof e == "function") return e(t);
  e != null && (e.current = t);
}
function fe(...e) {
  return (t) => {
    let n = !1;
    const r = e.map((o) => {
      const s = ye(o, t);
      return (!n && typeof s == "function" && (n = !0), s);
    });
    if (n)
      return () => {
        for (let o = 0; o < r.length; o++) {
          const s = r[o];
          typeof s == "function" ? s() : ye(e[o], null);
        }
      };
  };
}
function M(...e) {
  return a.useCallback(fe(...e), e);
}
function Bt(e, t) {
  const n = a.createContext(t),
    r = (s) => {
      const { children: l, ...i } = s,
        m = a.useMemo(() => i, Object.values(i));
      return c.jsx(n.Provider, { value: m, children: l });
    };
  r.displayName = e + "Provider";
  function o(s) {
    const l = a.useContext(n);
    if (l) return l;
    if (t !== void 0) return t;
    throw new Error(`\`${s}\` must be used within \`${e}\``);
  }
  return [r, o];
}
function Vt(e, t = []) {
  let n = [];
  function r(s, l) {
    const i = a.createContext(l),
      m = n.length;
    n = [...n, l];
    const u = (p) => {
      const { scope: v, children: g, ...S } = p,
        d = v?.[e]?.[m] || i,
        y = a.useMemo(() => S, Object.values(S));
      return c.jsx(d.Provider, { value: y, children: g });
    };
    u.displayName = s + "Provider";
    function f(p, v) {
      const g = v?.[e]?.[m] || i,
        S = a.useContext(g);
      if (S) return S;
      if (l !== void 0) return l;
      throw new Error(`\`${p}\` must be used within \`${s}\``);
    }
    return [u, f];
  }
  const o = () => {
    const s = n.map((l) => a.createContext(l));
    return function (i) {
      const m = i?.[e] || s;
      return a.useMemo(() => ({ [`__scope${e}`]: { ...i, [e]: m } }), [i, m]);
    };
  };
  return ((o.scopeName = e), [r, Ht(o, ...t)]);
}
function Ht(...e) {
  const t = e[0];
  if (e.length === 1) return t;
  const n = () => {
    const r = e.map((o) => ({ useScope: o(), scopeName: o.scopeName }));
    return function (s) {
      const l = r.reduce((i, { useScope: m, scopeName: u }) => {
        const p = m(s)[`__scope${u}`];
        return { ...i, ...p };
      }, {});
      return a.useMemo(() => ({ [`__scope${t.scopeName}`]: l }), [l]);
    };
  };
  return ((n.scopeName = t.scopeName), n);
}
var $ = globalThis?.document ? a.useLayoutEffect : () => {},
  zt = Ae[" useId ".trim().toString()] || (() => {}),
  Kt = 0;
function ne(e) {
  const [t, n] = a.useState(zt());
  return (
    $(() => {
      n((r) => r ?? String(Kt++));
    }, [e]),
    e || (t ? `radix-${t}` : "")
  );
}
var Gt = Ae[" useInsertionEffect ".trim().toString()] || $;
function qt({ prop: e, defaultProp: t, onChange: n = () => {}, caller: r }) {
  const [o, s, l] = Xt({ defaultProp: t, onChange: n }),
    i = e !== void 0,
    m = i ? e : o;
  {
    const f = a.useRef(e !== void 0);
    a.useEffect(() => {
      const p = f.current;
      (p !== i &&
        console.warn(
          `${r} is changing from ${p ? "controlled" : "uncontrolled"} to ${i ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`,
        ),
        (f.current = i));
    }, [i, r]);
  }
  const u = a.useCallback(
    (f) => {
      if (i) {
        const p = Yt(f) ? f(e) : f;
        p !== e && l.current?.(p);
      } else s(f);
    },
    [i, e, s, l],
  );
  return [m, u];
}
function Xt({ defaultProp: e, onChange: t }) {
  const [n, r] = a.useState(e),
    o = a.useRef(n),
    s = a.useRef(t);
  return (
    Gt(() => {
      s.current = t;
    }, [t]),
    a.useEffect(() => {
      o.current !== n && (s.current?.(n), (o.current = n));
    }, [n, o]),
    [n, r, s]
  );
}
function Yt(e) {
  return typeof e == "function";
}
function Zt(e) {
  const t = Qt(e),
    n = a.forwardRef((r, o) => {
      const { children: s, ...l } = r,
        i = a.Children.toArray(s),
        m = i.find(en);
      if (m) {
        const u = m.props.children,
          f = i.map((p) =>
            p === m
              ? a.Children.count(u) > 1
                ? a.Children.only(null)
                : a.isValidElement(u)
                  ? u.props.children
                  : null
              : p,
          );
        return c.jsx(t, {
          ...l,
          ref: o,
          children: a.isValidElement(u) ? a.cloneElement(u, void 0, f) : null,
        });
      }
      return c.jsx(t, { ...l, ref: o, children: s });
    });
  return ((n.displayName = `${e}.Slot`), n);
}
function Qt(e) {
  const t = a.forwardRef((n, r) => {
    const { children: o, ...s } = n;
    if (a.isValidElement(o)) {
      const l = nn(o),
        i = tn(s, o.props);
      return (o.type !== a.Fragment && (i.ref = r ? fe(r, l) : l), a.cloneElement(o, i));
    }
    return a.Children.count(o) > 1 ? a.Children.only(null) : null;
  });
  return ((t.displayName = `${e}.SlotClone`), t);
}
var Jt = Symbol("radix.slottable");
function en(e) {
  return (
    a.isValidElement(e) &&
    typeof e.type == "function" &&
    "__radixId" in e.type &&
    e.type.__radixId === Jt
  );
}
function tn(e, t) {
  const n = { ...t };
  for (const r in t) {
    const o = e[r],
      s = t[r];
    /^on[A-Z]/.test(r)
      ? o && s
        ? (n[r] = (...i) => {
            const m = s(...i);
            return (o(...i), m);
          })
        : o && (n[r] = o)
      : r === "style"
        ? (n[r] = { ...o, ...s })
        : r === "className" && (n[r] = [o, s].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function nn(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get,
    n = t && "isReactWarning" in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t = Object.getOwnPropertyDescriptor(e, "ref")?.get),
      (n = t && "isReactWarning" in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
var rn = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  P = rn.reduce((e, t) => {
    const n = Zt(`Primitive.${t}`),
      r = a.forwardRef((o, s) => {
        const { asChild: l, ...i } = o,
          m = l ? n : t;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          c.jsx(m, { ...i, ref: s })
        );
      });
    return ((r.displayName = `Primitive.${t}`), { ...e, [t]: r });
  }, {});
function on(e, t) {
  e && bt.flushSync(() => e.dispatchEvent(t));
}
function B(e) {
  const t = a.useRef(e);
  return (
    a.useEffect(() => {
      t.current = e;
    }),
    a.useMemo(
      () =>
        (...n) =>
          t.current?.(...n),
      [],
    )
  );
}
function an(e, t = globalThis?.document) {
  const n = B(e);
  a.useEffect(() => {
    const r = (o) => {
      o.key === "Escape" && n(o);
    };
    return (
      t.addEventListener("keydown", r, { capture: !0 }),
      () => t.removeEventListener("keydown", r, { capture: !0 })
    );
  }, [n, t]);
}
var sn = "DismissableLayer",
  ue = "dismissableLayer.update",
  cn = "dismissableLayer.pointerDownOutside",
  ln = "dismissableLayer.focusOutside",
  be,
  Me = a.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
  }),
  Ie = a.forwardRef((e, t) => {
    const {
        disableOutsidePointerEvents: n = !1,
        onEscapeKeyDown: r,
        onPointerDownOutside: o,
        onFocusOutside: s,
        onInteractOutside: l,
        onDismiss: i,
        ...m
      } = e,
      u = a.useContext(Me),
      [f, p] = a.useState(null),
      v = f?.ownerDocument ?? globalThis?.document,
      [, g] = a.useState({}),
      S = M(t, (x) => p(x)),
      d = Array.from(u.layers),
      [y] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1),
      b = d.indexOf(y),
      h = f ? d.indexOf(f) : -1,
      C = u.layersWithOutsidePointerEventsDisabled.size > 0,
      E = h >= b,
      w = fn((x) => {
        const A = x.target,
          I = [...u.branches].some((U) => U.contains(A));
        !E || I || (o?.(x), l?.(x), x.defaultPrevented || i?.());
      }, v),
      N = mn((x) => {
        const A = x.target;
        [...u.branches].some((U) => U.contains(A)) || (s?.(x), l?.(x), x.defaultPrevented || i?.());
      }, v);
    return (
      an((x) => {
        h === u.layers.size - 1 && (r?.(x), !x.defaultPrevented && i && (x.preventDefault(), i()));
      }, v),
      a.useEffect(() => {
        if (f)
          return (
            n &&
              (u.layersWithOutsidePointerEventsDisabled.size === 0 &&
                ((be = v.body.style.pointerEvents), (v.body.style.pointerEvents = "none")),
              u.layersWithOutsidePointerEventsDisabled.add(f)),
            u.layers.add(f),
            xe(),
            () => {
              n &&
                u.layersWithOutsidePointerEventsDisabled.size === 1 &&
                (v.body.style.pointerEvents = be);
            }
          );
      }, [f, v, n, u]),
      a.useEffect(
        () => () => {
          f && (u.layers.delete(f), u.layersWithOutsidePointerEventsDisabled.delete(f), xe());
        },
        [f, u],
      ),
      a.useEffect(() => {
        const x = () => g({});
        return (document.addEventListener(ue, x), () => document.removeEventListener(ue, x));
      }, []),
      c.jsx(P.div, {
        ...m,
        ref: S,
        style: { pointerEvents: C ? (E ? "auto" : "none") : void 0, ...e.style },
        onFocusCapture: O(e.onFocusCapture, N.onFocusCapture),
        onBlurCapture: O(e.onBlurCapture, N.onBlurCapture),
        onPointerDownCapture: O(e.onPointerDownCapture, w.onPointerDownCapture),
      })
    );
  });
Ie.displayName = sn;
var un = "DismissableLayerBranch",
  dn = a.forwardRef((e, t) => {
    const n = a.useContext(Me),
      r = a.useRef(null),
      o = M(t, r);
    return (
      a.useEffect(() => {
        const s = r.current;
        if (s)
          return (
            n.branches.add(s),
            () => {
              n.branches.delete(s);
            }
          );
      }, [n.branches]),
      c.jsx(P.div, { ...e, ref: o })
    );
  });
dn.displayName = un;
function fn(e, t = globalThis?.document) {
  const n = B(e),
    r = a.useRef(!1),
    o = a.useRef(() => {});
  return (
    a.useEffect(() => {
      const s = (i) => {
          if (i.target && !r.current) {
            let m = function () {
              _e(cn, n, u, { discrete: !0 });
            };
            const u = { originalEvent: i };
            i.pointerType === "touch"
              ? (t.removeEventListener("click", o.current),
                (o.current = m),
                t.addEventListener("click", o.current, { once: !0 }))
              : m();
          } else t.removeEventListener("click", o.current);
          r.current = !1;
        },
        l = window.setTimeout(() => {
          t.addEventListener("pointerdown", s);
        }, 0);
      return () => {
        (window.clearTimeout(l),
          t.removeEventListener("pointerdown", s),
          t.removeEventListener("click", o.current));
      };
    }, [t, n]),
    { onPointerDownCapture: () => (r.current = !0) }
  );
}
function mn(e, t = globalThis?.document) {
  const n = B(e),
    r = a.useRef(!1);
  return (
    a.useEffect(() => {
      const o = (s) => {
        s.target && !r.current && _e(ln, n, { originalEvent: s }, { discrete: !1 });
      };
      return (t.addEventListener("focusin", o), () => t.removeEventListener("focusin", o));
    }, [t, n]),
    { onFocusCapture: () => (r.current = !0), onBlurCapture: () => (r.current = !1) }
  );
}
function xe() {
  const e = new CustomEvent(ue);
  document.dispatchEvent(e);
}
function _e(e, t, n, { discrete: r }) {
  const o = n.originalEvent.target,
    s = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n });
  (t && o.addEventListener(e, t, { once: !0 }), r ? on(o, s) : o.dispatchEvent(s));
}
var re = "focusScope.autoFocusOnMount",
  oe = "focusScope.autoFocusOnUnmount",
  Ee = { bubbles: !1, cancelable: !0 },
  pn = "FocusScope",
  ke = a.forwardRef((e, t) => {
    const { loop: n = !1, trapped: r = !1, onMountAutoFocus: o, onUnmountAutoFocus: s, ...l } = e,
      [i, m] = a.useState(null),
      u = B(o),
      f = B(s),
      p = a.useRef(null),
      v = M(t, (d) => m(d)),
      g = a.useRef({
        paused: !1,
        pause() {
          this.paused = !0;
        },
        resume() {
          this.paused = !1;
        },
      }).current;
    (a.useEffect(() => {
      if (r) {
        let d = function (C) {
            if (g.paused || !i) return;
            const E = C.target;
            i.contains(E) ? (p.current = E) : D(p.current, { select: !0 });
          },
          y = function (C) {
            if (g.paused || !i) return;
            const E = C.relatedTarget;
            E !== null && (i.contains(E) || D(p.current, { select: !0 }));
          },
          b = function (C) {
            if (document.activeElement === document.body)
              for (const w of C) w.removedNodes.length > 0 && D(i);
          };
        (document.addEventListener("focusin", d), document.addEventListener("focusout", y));
        const h = new MutationObserver(b);
        return (
          i && h.observe(i, { childList: !0, subtree: !0 }),
          () => {
            (document.removeEventListener("focusin", d),
              document.removeEventListener("focusout", y),
              h.disconnect());
          }
        );
      }
    }, [r, i, g.paused]),
      a.useEffect(() => {
        if (i) {
          Se.add(g);
          const d = document.activeElement;
          if (!i.contains(d)) {
            const b = new CustomEvent(re, Ee);
            (i.addEventListener(re, u),
              i.dispatchEvent(b),
              b.defaultPrevented ||
                (vn(xn(Le(i)), { select: !0 }), document.activeElement === d && D(i)));
          }
          return () => {
            (i.removeEventListener(re, u),
              setTimeout(() => {
                const b = new CustomEvent(oe, Ee);
                (i.addEventListener(oe, f),
                  i.dispatchEvent(b),
                  b.defaultPrevented || D(d ?? document.body, { select: !0 }),
                  i.removeEventListener(oe, f),
                  Se.remove(g));
              }, 0));
          };
        }
      }, [i, u, f, g]));
    const S = a.useCallback(
      (d) => {
        if ((!n && !r) || g.paused) return;
        const y = d.key === "Tab" && !d.altKey && !d.ctrlKey && !d.metaKey,
          b = document.activeElement;
        if (y && b) {
          const h = d.currentTarget,
            [C, E] = hn(h);
          C && E
            ? !d.shiftKey && b === E
              ? (d.preventDefault(), n && D(C, { select: !0 }))
              : d.shiftKey && b === C && (d.preventDefault(), n && D(E, { select: !0 }))
            : b === h && d.preventDefault();
        }
      },
      [n, r, g.paused],
    );
    return c.jsx(P.div, { tabIndex: -1, ...l, ref: v, onKeyDown: S });
  });
ke.displayName = pn;
function vn(e, { select: t = !1 } = {}) {
  const n = document.activeElement;
  for (const r of e) if ((D(r, { select: t }), document.activeElement !== n)) return;
}
function hn(e) {
  const t = Le(e),
    n = Ce(t, e),
    r = Ce(t.reverse(), e);
  return [n, r];
}
function Le(e) {
  const t = [],
    n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (r) => {
        const o = r.tagName === "INPUT" && r.type === "hidden";
        return r.disabled || r.hidden || o
          ? NodeFilter.FILTER_SKIP
          : r.tabIndex >= 0
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
      },
    });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function Ce(e, t) {
  for (const n of e) if (!gn(n, { upTo: t })) return n;
}
function gn(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function yn(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function D(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement;
    (e.focus({ preventScroll: !0 }), e !== n && yn(e) && t && e.select());
  }
}
var Se = bn();
function bn() {
  let e = [];
  return {
    add(t) {
      const n = e[0];
      (t !== n && n?.pause(), (e = we(e, t)), e.unshift(t));
    },
    remove(t) {
      ((e = we(e, t)), e[0]?.resume());
    },
  };
}
function we(e, t) {
  const n = [...e],
    r = n.indexOf(t);
  return (r !== -1 && n.splice(r, 1), n);
}
function xn(e) {
  return e.filter((t) => t.tagName !== "A");
}
var En = "Portal",
  Fe = a.forwardRef((e, t) => {
    const { container: n, ...r } = e,
      [o, s] = a.useState(!1);
    $(() => s(!0), []);
    const l = n || (o && globalThis?.document?.body);
    return l ? xt.createPortal(c.jsx(P.div, { ...r, ref: t }), l) : null;
  });
Fe.displayName = En;
function Cn(e, t) {
  return a.useReducer((n, r) => t[n][r] ?? n, e);
}
var Q = (e) => {
  const { present: t, children: n } = e,
    r = Sn(t),
    o = typeof n == "function" ? n({ present: r.isPresent }) : a.Children.only(n),
    s = M(r.ref, wn(o));
  return typeof n == "function" || r.isPresent ? a.cloneElement(o, { ref: s }) : null;
};
Q.displayName = "Presence";
function Sn(e) {
  const [t, n] = a.useState(),
    r = a.useRef(null),
    o = a.useRef(e),
    s = a.useRef("none"),
    l = e ? "mounted" : "unmounted",
    [i, m] = Cn(l, {
      mounted: { UNMOUNT: "unmounted", ANIMATION_OUT: "unmountSuspended" },
      unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
      unmounted: { MOUNT: "mounted" },
    });
  return (
    a.useEffect(() => {
      const u = H(r.current);
      s.current = i === "mounted" ? u : "none";
    }, [i]),
    $(() => {
      const u = r.current,
        f = o.current;
      if (f !== e) {
        const v = s.current,
          g = H(u);
        (e
          ? m("MOUNT")
          : g === "none" || u?.display === "none"
            ? m("UNMOUNT")
            : m(f && v !== g ? "ANIMATION_OUT" : "UNMOUNT"),
          (o.current = e));
      }
    }, [e, m]),
    $(() => {
      if (t) {
        let u;
        const f = t.ownerDocument.defaultView ?? window,
          p = (g) => {
            const d = H(r.current).includes(CSS.escape(g.animationName));
            if (g.target === t && d && (m("ANIMATION_END"), !o.current)) {
              const y = t.style.animationFillMode;
              ((t.style.animationFillMode = "forwards"),
                (u = f.setTimeout(() => {
                  t.style.animationFillMode === "forwards" && (t.style.animationFillMode = y);
                })));
            }
          },
          v = (g) => {
            g.target === t && (s.current = H(r.current));
          };
        return (
          t.addEventListener("animationstart", v),
          t.addEventListener("animationcancel", p),
          t.addEventListener("animationend", p),
          () => {
            (f.clearTimeout(u),
              t.removeEventListener("animationstart", v),
              t.removeEventListener("animationcancel", p),
              t.removeEventListener("animationend", p));
          }
        );
      } else m("ANIMATION_END");
    }, [t, m]),
    {
      isPresent: ["mounted", "unmountSuspended"].includes(i),
      ref: a.useCallback((u) => {
        ((r.current = u ? getComputedStyle(u) : null), n(u));
      }, []),
    }
  );
}
function H(e) {
  return e?.animationName || "none";
}
function wn(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get,
    n = t && "isReactWarning" in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t = Object.getOwnPropertyDescriptor(e, "ref")?.get),
      (n = t && "isReactWarning" in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
var ae = 0;
function Nn() {
  a.useEffect(() => {
    const e = document.querySelectorAll("[data-radix-focus-guard]");
    return (
      document.body.insertAdjacentElement("afterbegin", e[0] ?? Ne()),
      document.body.insertAdjacentElement("beforeend", e[1] ?? Ne()),
      ae++,
      () => {
        (ae === 1 &&
          document.querySelectorAll("[data-radix-focus-guard]").forEach((t) => t.remove()),
          ae--);
      }
    );
  }, []);
}
function Ne() {
  const e = document.createElement("span");
  return (
    e.setAttribute("data-radix-focus-guard", ""),
    (e.tabIndex = 0),
    (e.style.outline = "none"),
    (e.style.opacity = "0"),
    (e.style.position = "fixed"),
    (e.style.pointerEvents = "none"),
    e
  );
}
var X = "right-scroll-bar-position",
  Y = "width-before-scroll-bar",
  Rn = "with-scroll-bars-hidden",
  Pn = "--removed-body-scroll-bar-size";
function se(e, t) {
  return (typeof e == "function" ? e(t) : e && (e.current = t), e);
}
function Dn(e, t) {
  var n = a.useState(function () {
    return {
      value: e,
      callback: t,
      facade: {
        get current() {
          return n.value;
        },
        set current(r) {
          var o = n.value;
          o !== r && ((n.value = r), n.callback(r, o));
        },
      },
    };
  })[0];
  return ((n.callback = t), n.facade);
}
var jn = typeof window < "u" ? a.useLayoutEffect : a.useEffect,
  Re = new WeakMap();
function On(e, t) {
  var n = Dn(null, function (r) {
    return e.forEach(function (o) {
      return se(o, r);
    });
  });
  return (
    jn(
      function () {
        var r = Re.get(n);
        if (r) {
          var o = new Set(r),
            s = new Set(e),
            l = n.current;
          (o.forEach(function (i) {
            s.has(i) || se(i, null);
          }),
            s.forEach(function (i) {
              o.has(i) || se(i, l);
            }));
        }
        Re.set(n, e);
      },
      [e],
    ),
    n
  );
}
function An(e) {
  return e;
}
function Tn(e, t) {
  t === void 0 && (t = An);
  var n = [],
    r = !1,
    o = {
      read: function () {
        if (r)
          throw new Error(
            "Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.",
          );
        return n.length ? n[n.length - 1] : e;
      },
      useMedium: function (s) {
        var l = t(s, r);
        return (
          n.push(l),
          function () {
            n = n.filter(function (i) {
              return i !== l;
            });
          }
        );
      },
      assignSyncMedium: function (s) {
        for (r = !0; n.length; ) {
          var l = n;
          ((n = []), l.forEach(s));
        }
        n = {
          push: function (i) {
            return s(i);
          },
          filter: function () {
            return n;
          },
        };
      },
      assignMedium: function (s) {
        r = !0;
        var l = [];
        if (n.length) {
          var i = n;
          ((n = []), i.forEach(s), (l = n));
        }
        var m = function () {
            var f = l;
            ((l = []), f.forEach(s));
          },
          u = function () {
            return Promise.resolve().then(m);
          };
        (u(),
          (n = {
            push: function (f) {
              (l.push(f), u());
            },
            filter: function (f) {
              return ((l = l.filter(f)), n);
            },
          }));
      },
    };
  return o;
}
function Mn(e) {
  e === void 0 && (e = {});
  var t = Tn(null);
  return ((t.options = j({ async: !0, ssr: !1 }, e)), t);
}
var We = function (e) {
  var t = e.sideCar,
    n = Te(e, ["sideCar"]);
  if (!t) throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = t.read();
  if (!r) throw new Error("Sidecar medium not found");
  return a.createElement(r, j({}, n));
};
We.isSideCarExport = !0;
function In(e, t) {
  return (e.useMedium(t), We);
}
var Ue = Mn(),
  ie = function () {},
  J = a.forwardRef(function (e, t) {
    var n = a.useRef(null),
      r = a.useState({ onScrollCapture: ie, onWheelCapture: ie, onTouchMoveCapture: ie }),
      o = r[0],
      s = r[1],
      l = e.forwardProps,
      i = e.children,
      m = e.className,
      u = e.removeScrollBar,
      f = e.enabled,
      p = e.shards,
      v = e.sideCar,
      g = e.noRelative,
      S = e.noIsolation,
      d = e.inert,
      y = e.allowPinchZoom,
      b = e.as,
      h = b === void 0 ? "div" : b,
      C = e.gapMode,
      E = Te(e, [
        "forwardProps",
        "children",
        "className",
        "removeScrollBar",
        "enabled",
        "shards",
        "sideCar",
        "noRelative",
        "noIsolation",
        "inert",
        "allowPinchZoom",
        "as",
        "gapMode",
      ]),
      w = v,
      N = On([n, t]),
      x = j(j({}, E), o);
    return a.createElement(
      a.Fragment,
      null,
      f &&
        a.createElement(w, {
          sideCar: Ue,
          removeScrollBar: u,
          shards: p,
          noRelative: g,
          noIsolation: S,
          inert: d,
          setCallbacks: s,
          allowPinchZoom: !!y,
          lockRef: n,
          gapMode: C,
        }),
      l
        ? a.cloneElement(a.Children.only(i), j(j({}, x), { ref: N }))
        : a.createElement(h, j({}, x, { className: m, ref: N }), i),
    );
  });
J.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
J.classNames = { fullWidth: Y, zeroRight: X };
var _n = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function kn() {
  if (!document) return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = _n();
  return (t && e.setAttribute("nonce", t), e);
}
function Ln(e, t) {
  e.styleSheet ? (e.styleSheet.cssText = t) : e.appendChild(document.createTextNode(t));
}
function Fn(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var Wn = function () {
    var e = 0,
      t = null;
    return {
      add: function (n) {
        (e == 0 && (t = kn()) && (Ln(t, n), Fn(t)), e++);
      },
      remove: function () {
        (e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), (t = null)));
      },
    };
  },
  Un = function () {
    var e = Wn();
    return function (t, n) {
      a.useEffect(
        function () {
          return (
            e.add(t),
            function () {
              e.remove();
            }
          );
        },
        [t && n],
      );
    };
  },
  $e = function () {
    var e = Un(),
      t = function (n) {
        var r = n.styles,
          o = n.dynamic;
        return (e(r, o), null);
      };
    return t;
  },
  $n = { left: 0, top: 0, right: 0, gap: 0 },
  ce = function (e) {
    return parseInt(e || "", 10) || 0;
  },
  Bn = function (e) {
    var t = window.getComputedStyle(document.body),
      n = t[e === "padding" ? "paddingLeft" : "marginLeft"],
      r = t[e === "padding" ? "paddingTop" : "marginTop"],
      o = t[e === "padding" ? "paddingRight" : "marginRight"];
    return [ce(n), ce(r), ce(o)];
  },
  Vn = function (e) {
    if ((e === void 0 && (e = "margin"), typeof window > "u")) return $n;
    var t = Bn(e),
      n = document.documentElement.clientWidth,
      r = window.innerWidth;
    return { left: t[0], top: t[1], right: t[2], gap: Math.max(0, r - n + t[2] - t[0]) };
  },
  Hn = $e(),
  F = "data-scroll-locked",
  zn = function (e, t, n, r) {
    var o = e.left,
      s = e.top,
      l = e.right,
      i = e.gap;
    return (
      n === void 0 && (n = "margin"),
      `
  .`
        .concat(
          Rn,
          ` {
   overflow: hidden `,
        )
        .concat(
          r,
          `;
   padding-right: `,
        )
        .concat(i, "px ")
        .concat(
          r,
          `;
  }
  body[`,
        )
        .concat(
          F,
          `] {
    overflow: hidden `,
        )
        .concat(
          r,
          `;
    overscroll-behavior: contain;
    `,
        )
        .concat(
          [
            t && "position: relative ".concat(r, ";"),
            n === "margin" &&
              `
    padding-left: `
                .concat(
                  o,
                  `px;
    padding-top: `,
                )
                .concat(
                  s,
                  `px;
    padding-right: `,
                )
                .concat(
                  l,
                  `px;
    margin-left:0;
    margin-top:0;
    margin-right: `,
                )
                .concat(i, "px ")
                .concat(
                  r,
                  `;
    `,
                ),
            n === "padding" && "padding-right: ".concat(i, "px ").concat(r, ";"),
          ]
            .filter(Boolean)
            .join(""),
          `
  }
  
  .`,
        )
        .concat(
          X,
          ` {
    right: `,
        )
        .concat(i, "px ")
        .concat(
          r,
          `;
  }
  
  .`,
        )
        .concat(
          Y,
          ` {
    margin-right: `,
        )
        .concat(i, "px ")
        .concat(
          r,
          `;
  }
  
  .`,
        )
        .concat(X, " .")
        .concat(
          X,
          ` {
    right: 0 `,
        )
        .concat(
          r,
          `;
  }
  
  .`,
        )
        .concat(Y, " .")
        .concat(
          Y,
          ` {
    margin-right: 0 `,
        )
        .concat(
          r,
          `;
  }
  
  body[`,
        )
        .concat(
          F,
          `] {
    `,
        )
        .concat(Pn, ": ")
        .concat(
          i,
          `px;
  }
`,
        )
    );
  },
  Pe = function () {
    var e = parseInt(document.body.getAttribute(F) || "0", 10);
    return isFinite(e) ? e : 0;
  },
  Kn = function () {
    a.useEffect(function () {
      return (
        document.body.setAttribute(F, (Pe() + 1).toString()),
        function () {
          var e = Pe() - 1;
          e <= 0 ? document.body.removeAttribute(F) : document.body.setAttribute(F, e.toString());
        }
      );
    }, []);
  },
  Gn = function (e) {
    var t = e.noRelative,
      n = e.noImportant,
      r = e.gapMode,
      o = r === void 0 ? "margin" : r;
    Kn();
    var s = a.useMemo(
      function () {
        return Vn(o);
      },
      [o],
    );
    return a.createElement(Hn, { styles: zn(s, !t, o, n ? "" : "!important") });
  },
  de = !1;
if (typeof window < "u")
  try {
    var z = Object.defineProperty({}, "passive", {
      get: function () {
        return ((de = !0), !0);
      },
    });
    (window.addEventListener("test", z, z), window.removeEventListener("test", z, z));
  } catch {
    de = !1;
  }
var _ = de ? { passive: !1 } : !1,
  qn = function (e) {
    return e.tagName === "TEXTAREA";
  },
  Be = function (e, t) {
    if (!(e instanceof Element)) return !1;
    var n = window.getComputedStyle(e);
    return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !qn(e) && n[t] === "visible");
  },
  Xn = function (e) {
    return Be(e, "overflowY");
  },
  Yn = function (e) {
    return Be(e, "overflowX");
  },
  De = function (e, t) {
    var n = t.ownerDocument,
      r = t;
    do {
      typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
      var o = Ve(e, r);
      if (o) {
        var s = He(e, r),
          l = s[1],
          i = s[2];
        if (l > i) return !0;
      }
      r = r.parentNode;
    } while (r && r !== n.body);
    return !1;
  },
  Zn = function (e) {
    var t = e.scrollTop,
      n = e.scrollHeight,
      r = e.clientHeight;
    return [t, n, r];
  },
  Qn = function (e) {
    var t = e.scrollLeft,
      n = e.scrollWidth,
      r = e.clientWidth;
    return [t, n, r];
  },
  Ve = function (e, t) {
    return e === "v" ? Xn(t) : Yn(t);
  },
  He = function (e, t) {
    return e === "v" ? Zn(t) : Qn(t);
  },
  Jn = function (e, t) {
    return e === "h" && t === "rtl" ? -1 : 1;
  },
  er = function (e, t, n, r, o) {
    var s = Jn(e, window.getComputedStyle(t).direction),
      l = s * r,
      i = n.target,
      m = t.contains(i),
      u = !1,
      f = l > 0,
      p = 0,
      v = 0;
    do {
      if (!i) break;
      var g = He(e, i),
        S = g[0],
        d = g[1],
        y = g[2],
        b = d - y - s * S;
      (S || b) && Ve(e, i) && ((p += b), (v += S));
      var h = i.parentNode;
      i = h && h.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? h.host : h;
    } while ((!m && i !== document.body) || (m && (t.contains(i) || t === i)));
    return (((f && Math.abs(p) < 1) || (!f && Math.abs(v) < 1)) && (u = !0), u);
  },
  K = function (e) {
    return "changedTouches" in e
      ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
      : [0, 0];
  },
  je = function (e) {
    return [e.deltaX, e.deltaY];
  },
  Oe = function (e) {
    return e && "current" in e ? e.current : e;
  },
  tr = function (e, t) {
    return e[0] === t[0] && e[1] === t[1];
  },
  nr = function (e) {
    return `
  .block-interactivity-`
      .concat(
        e,
        ` {pointer-events: none;}
  .allow-interactivity-`,
      )
      .concat(
        e,
        ` {pointer-events: all;}
`,
      );
  },
  rr = 0,
  k = [];
function or(e) {
  var t = a.useRef([]),
    n = a.useRef([0, 0]),
    r = a.useRef(),
    o = a.useState(rr++)[0],
    s = a.useState($e)[0],
    l = a.useRef(e);
  (a.useEffect(
    function () {
      l.current = e;
    },
    [e],
  ),
    a.useEffect(
      function () {
        if (e.inert) {
          document.body.classList.add("block-interactivity-".concat(o));
          var d = Et([e.lockRef.current], (e.shards || []).map(Oe), !0).filter(Boolean);
          return (
            d.forEach(function (y) {
              return y.classList.add("allow-interactivity-".concat(o));
            }),
            function () {
              (document.body.classList.remove("block-interactivity-".concat(o)),
                d.forEach(function (y) {
                  return y.classList.remove("allow-interactivity-".concat(o));
                }));
            }
          );
        }
      },
      [e.inert, e.lockRef.current, e.shards],
    ));
  var i = a.useCallback(function (d, y) {
      if (("touches" in d && d.touches.length === 2) || (d.type === "wheel" && d.ctrlKey))
        return !l.current.allowPinchZoom;
      var b = K(d),
        h = n.current,
        C = "deltaX" in d ? d.deltaX : h[0] - b[0],
        E = "deltaY" in d ? d.deltaY : h[1] - b[1],
        w,
        N = d.target,
        x = Math.abs(C) > Math.abs(E) ? "h" : "v";
      if ("touches" in d && x === "h" && N.type === "range") return !1;
      var A = window.getSelection(),
        I = A && A.anchorNode,
        U = I ? I === N || I.contains(N) : !1;
      if (U) return !1;
      var V = De(x, N);
      if (!V) return !0;
      if ((V ? (w = x) : ((w = x === "v" ? "h" : "v"), (V = De(x, N))), !V)) return !1;
      if ((!r.current && "changedTouches" in d && (C || E) && (r.current = w), !w)) return !0;
      var he = r.current || w;
      return er(he, y, d, he === "h" ? C : E);
    }, []),
    m = a.useCallback(function (d) {
      var y = d;
      if (!(!k.length || k[k.length - 1] !== s)) {
        var b = "deltaY" in y ? je(y) : K(y),
          h = t.current.filter(function (w) {
            return (
              w.name === y.type &&
              (w.target === y.target || y.target === w.shadowParent) &&
              tr(w.delta, b)
            );
          })[0];
        if (h && h.should) {
          y.cancelable && y.preventDefault();
          return;
        }
        if (!h) {
          var C = (l.current.shards || [])
              .map(Oe)
              .filter(Boolean)
              .filter(function (w) {
                return w.contains(y.target);
              }),
            E = C.length > 0 ? i(y, C[0]) : !l.current.noIsolation;
          E && y.cancelable && y.preventDefault();
        }
      }
    }, []),
    u = a.useCallback(function (d, y, b, h) {
      var C = { name: d, delta: y, target: b, should: h, shadowParent: ar(b) };
      (t.current.push(C),
        setTimeout(function () {
          t.current = t.current.filter(function (E) {
            return E !== C;
          });
        }, 1));
    }, []),
    f = a.useCallback(function (d) {
      ((n.current = K(d)), (r.current = void 0));
    }, []),
    p = a.useCallback(function (d) {
      u(d.type, je(d), d.target, i(d, e.lockRef.current));
    }, []),
    v = a.useCallback(function (d) {
      u(d.type, K(d), d.target, i(d, e.lockRef.current));
    }, []);
  a.useEffect(function () {
    return (
      k.push(s),
      e.setCallbacks({ onScrollCapture: p, onWheelCapture: p, onTouchMoveCapture: v }),
      document.addEventListener("wheel", m, _),
      document.addEventListener("touchmove", m, _),
      document.addEventListener("touchstart", f, _),
      function () {
        ((k = k.filter(function (d) {
          return d !== s;
        })),
          document.removeEventListener("wheel", m, _),
          document.removeEventListener("touchmove", m, _),
          document.removeEventListener("touchstart", f, _));
      }
    );
  }, []);
  var g = e.removeScrollBar,
    S = e.inert;
  return a.createElement(
    a.Fragment,
    null,
    S ? a.createElement(s, { styles: nr(o) }) : null,
    g ? a.createElement(Gn, { noRelative: e.noRelative, gapMode: e.gapMode }) : null,
  );
}
function ar(e) {
  for (var t = null; e !== null; )
    (e instanceof ShadowRoot && ((t = e.host), (e = e.host)), (e = e.parentNode));
  return t;
}
const sr = In(Ue, or);
var ze = a.forwardRef(function (e, t) {
  return a.createElement(J, j({}, e, { ref: t, sideCar: sr }));
});
ze.classNames = J.classNames;
var ir = function (e) {
    if (typeof document > "u") return null;
    var t = Array.isArray(e) ? e[0] : e;
    return t.ownerDocument.body;
  },
  L = new WeakMap(),
  G = new WeakMap(),
  q = {},
  le = 0,
  Ke = function (e) {
    return e && (e.host || Ke(e.parentNode));
  },
  cr = function (e, t) {
    return t
      .map(function (n) {
        if (e.contains(n)) return n;
        var r = Ke(n);
        return r && e.contains(r)
          ? r
          : (console.error("aria-hidden", n, "in not contained inside", e, ". Doing nothing"),
            null);
      })
      .filter(function (n) {
        return !!n;
      });
  },
  lr = function (e, t, n, r) {
    var o = cr(t, Array.isArray(e) ? e : [e]);
    q[n] || (q[n] = new WeakMap());
    var s = q[n],
      l = [],
      i = new Set(),
      m = new Set(o),
      u = function (p) {
        !p || i.has(p) || (i.add(p), u(p.parentNode));
      };
    o.forEach(u);
    var f = function (p) {
      !p ||
        m.has(p) ||
        Array.prototype.forEach.call(p.children, function (v) {
          if (i.has(v)) f(v);
          else
            try {
              var g = v.getAttribute(r),
                S = g !== null && g !== "false",
                d = (L.get(v) || 0) + 1,
                y = (s.get(v) || 0) + 1;
              (L.set(v, d),
                s.set(v, y),
                l.push(v),
                d === 1 && S && G.set(v, !0),
                y === 1 && v.setAttribute(n, "true"),
                S || v.setAttribute(r, "true"));
            } catch (b) {
              console.error("aria-hidden: cannot operate on ", v, b);
            }
        });
    };
    return (
      f(t),
      i.clear(),
      le++,
      function () {
        (l.forEach(function (p) {
          var v = L.get(p) - 1,
            g = s.get(p) - 1;
          (L.set(p, v),
            s.set(p, g),
            v || (G.has(p) || p.removeAttribute(r), G.delete(p)),
            g || p.removeAttribute(n));
        }),
          le--,
          le || ((L = new WeakMap()), (L = new WeakMap()), (G = new WeakMap()), (q = {})));
      }
    );
  },
  ur = function (e, t, n) {
    n === void 0 && (n = "data-aria-hidden");
    var r = Array.from(Array.isArray(e) ? e : [e]),
      o = ir(e);
    return o
      ? (r.push.apply(r, Array.from(o.querySelectorAll("[aria-live], script"))),
        lr(r, o, n, "aria-hidden"))
      : function () {
          return null;
        };
  };
function dr(e) {
  const t = fr(e),
    n = a.forwardRef((r, o) => {
      const { children: s, ...l } = r,
        i = a.Children.toArray(s),
        m = i.find(pr);
      if (m) {
        const u = m.props.children,
          f = i.map((p) =>
            p === m
              ? a.Children.count(u) > 1
                ? a.Children.only(null)
                : a.isValidElement(u)
                  ? u.props.children
                  : null
              : p,
          );
        return c.jsx(t, {
          ...l,
          ref: o,
          children: a.isValidElement(u) ? a.cloneElement(u, void 0, f) : null,
        });
      }
      return c.jsx(t, { ...l, ref: o, children: s });
    });
  return ((n.displayName = `${e}.Slot`), n);
}
function fr(e) {
  const t = a.forwardRef((n, r) => {
    const { children: o, ...s } = n;
    if (a.isValidElement(o)) {
      const l = hr(o),
        i = vr(s, o.props);
      return (o.type !== a.Fragment && (i.ref = r ? fe(r, l) : l), a.cloneElement(o, i));
    }
    return a.Children.count(o) > 1 ? a.Children.only(null) : null;
  });
  return ((t.displayName = `${e}.SlotClone`), t);
}
var mr = Symbol("radix.slottable");
function pr(e) {
  return (
    a.isValidElement(e) &&
    typeof e.type == "function" &&
    "__radixId" in e.type &&
    e.type.__radixId === mr
  );
}
function vr(e, t) {
  const n = { ...t };
  for (const r in t) {
    const o = e[r],
      s = t[r];
    /^on[A-Z]/.test(r)
      ? o && s
        ? (n[r] = (...i) => {
            const m = s(...i);
            return (o(...i), m);
          })
        : o && (n[r] = o)
      : r === "style"
        ? (n[r] = { ...o, ...s })
        : r === "className" && (n[r] = [o, s].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function hr(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get,
    n = t && "isReactWarning" in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t = Object.getOwnPropertyDescriptor(e, "ref")?.get),
      (n = t && "isReactWarning" in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
var ee = "Dialog",
  [Ge] = Vt(ee),
  [gr, R] = Ge(ee),
  qe = (e) => {
    const {
        __scopeDialog: t,
        children: n,
        open: r,
        defaultOpen: o,
        onOpenChange: s,
        modal: l = !0,
      } = e,
      i = a.useRef(null),
      m = a.useRef(null),
      [u, f] = qt({ prop: r, defaultProp: o ?? !1, onChange: s, caller: ee });
    return c.jsx(gr, {
      scope: t,
      triggerRef: i,
      contentRef: m,
      contentId: ne(),
      titleId: ne(),
      descriptionId: ne(),
      open: u,
      onOpenChange: f,
      onOpenToggle: a.useCallback(() => f((p) => !p), [f]),
      modal: l,
      children: n,
    });
  };
qe.displayName = ee;
var Xe = "DialogTrigger",
  yr = a.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = R(Xe, n),
      s = M(t, o.triggerRef);
    return c.jsx(P.button, {
      type: "button",
      "aria-haspopup": "dialog",
      "aria-expanded": o.open,
      "aria-controls": o.contentId,
      "data-state": ve(o.open),
      ...r,
      ref: s,
      onClick: O(e.onClick, o.onOpenToggle),
    });
  });
yr.displayName = Xe;
var me = "DialogPortal",
  [br, Ye] = Ge(me, { forceMount: void 0 }),
  Ze = (e) => {
    const { __scopeDialog: t, forceMount: n, children: r, container: o } = e,
      s = R(me, t);
    return c.jsx(br, {
      scope: t,
      forceMount: n,
      children: a.Children.map(r, (l) =>
        c.jsx(Q, {
          present: n || s.open,
          children: c.jsx(Fe, { asChild: !0, container: o, children: l }),
        }),
      ),
    });
  };
Ze.displayName = me;
var Z = "DialogOverlay",
  Qe = a.forwardRef((e, t) => {
    const n = Ye(Z, e.__scopeDialog),
      { forceMount: r = n.forceMount, ...o } = e,
      s = R(Z, e.__scopeDialog);
    return s.modal
      ? c.jsx(Q, { present: r || s.open, children: c.jsx(Er, { ...o, ref: t }) })
      : null;
  });
Qe.displayName = Z;
var xr = dr("DialogOverlay.RemoveScroll"),
  Er = a.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = R(Z, n);
    return c.jsx(ze, {
      as: xr,
      allowPinchZoom: !0,
      shards: [o.contentRef],
      children: c.jsx(P.div, {
        "data-state": ve(o.open),
        ...r,
        ref: t,
        style: { pointerEvents: "auto", ...r.style },
      }),
    });
  }),
  T = "DialogContent",
  Je = a.forwardRef((e, t) => {
    const n = Ye(T, e.__scopeDialog),
      { forceMount: r = n.forceMount, ...o } = e,
      s = R(T, e.__scopeDialog);
    return c.jsx(Q, {
      present: r || s.open,
      children: s.modal ? c.jsx(Cr, { ...o, ref: t }) : c.jsx(Sr, { ...o, ref: t }),
    });
  });
Je.displayName = T;
var Cr = a.forwardRef((e, t) => {
    const n = R(T, e.__scopeDialog),
      r = a.useRef(null),
      o = M(t, n.contentRef, r);
    return (
      a.useEffect(() => {
        const s = r.current;
        if (s) return ur(s);
      }, []),
      c.jsx(et, {
        ...e,
        ref: o,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: O(e.onCloseAutoFocus, (s) => {
          (s.preventDefault(), n.triggerRef.current?.focus());
        }),
        onPointerDownOutside: O(e.onPointerDownOutside, (s) => {
          const l = s.detail.originalEvent,
            i = l.button === 0 && l.ctrlKey === !0;
          (l.button === 2 || i) && s.preventDefault();
        }),
        onFocusOutside: O(e.onFocusOutside, (s) => s.preventDefault()),
      })
    );
  }),
  Sr = a.forwardRef((e, t) => {
    const n = R(T, e.__scopeDialog),
      r = a.useRef(!1),
      o = a.useRef(!1);
    return c.jsx(et, {
      ...e,
      ref: t,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      onCloseAutoFocus: (s) => {
        (e.onCloseAutoFocus?.(s),
          s.defaultPrevented || (r.current || n.triggerRef.current?.focus(), s.preventDefault()),
          (r.current = !1),
          (o.current = !1));
      },
      onInteractOutside: (s) => {
        (e.onInteractOutside?.(s),
          s.defaultPrevented ||
            ((r.current = !0), s.detail.originalEvent.type === "pointerdown" && (o.current = !0)));
        const l = s.target;
        (n.triggerRef.current?.contains(l) && s.preventDefault(),
          s.detail.originalEvent.type === "focusin" && o.current && s.preventDefault());
      },
    });
  }),
  et = a.forwardRef((e, t) => {
    const { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: o, onCloseAutoFocus: s, ...l } = e,
      i = R(T, n),
      m = a.useRef(null),
      u = M(t, m);
    return (
      Nn(),
      c.jsxs(c.Fragment, {
        children: [
          c.jsx(ke, {
            asChild: !0,
            loop: !0,
            trapped: r,
            onMountAutoFocus: o,
            onUnmountAutoFocus: s,
            children: c.jsx(Ie, {
              role: "dialog",
              id: i.contentId,
              "aria-describedby": i.descriptionId,
              "aria-labelledby": i.titleId,
              "data-state": ve(i.open),
              ...l,
              ref: u,
              onDismiss: () => i.onOpenChange(!1),
            }),
          }),
          c.jsxs(c.Fragment, {
            children: [
              c.jsx(wr, { titleId: i.titleId }),
              c.jsx(Rr, { contentRef: m, descriptionId: i.descriptionId }),
            ],
          }),
        ],
      })
    );
  }),
  pe = "DialogTitle",
  tt = a.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = R(pe, n);
    return c.jsx(P.h2, { id: o.titleId, ...r, ref: t });
  });
tt.displayName = pe;
var nt = "DialogDescription",
  rt = a.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = R(nt, n);
    return c.jsx(P.p, { id: o.descriptionId, ...r, ref: t });
  });
rt.displayName = nt;
var ot = "DialogClose",
  at = a.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = R(ot, n);
    return c.jsx(P.button, {
      type: "button",
      ...r,
      ref: t,
      onClick: O(e.onClick, () => o.onOpenChange(!1)),
    });
  });
at.displayName = ot;
function ve(e) {
  return e ? "open" : "closed";
}
var st = "DialogTitleWarning",
  [Xr, it] = Bt(st, { contentName: T, titleName: pe, docsSlug: "dialog" }),
  wr = ({ titleId: e }) => {
    const t = it(st),
      n = `\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;
    return (
      a.useEffect(() => {
        e && (document.getElementById(e) || console.error(n));
      }, [n, e]),
      null
    );
  },
  Nr = "DialogDescriptionWarning",
  Rr = ({ contentRef: e, descriptionId: t }) => {
    const r = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${it(Nr).contentName}}.`;
    return (
      a.useEffect(() => {
        const o = e.current?.getAttribute("aria-describedby");
        t && o && (document.getElementById(t) || console.warn(r));
      }, [r, e, t]),
      null
    );
  },
  Pr = qe,
  Dr = Ze,
  ct = Qe,
  lt = Je,
  ut = tt,
  dt = rt,
  jr = at;
const Or = Pr,
  Ar = Dr,
  ft = a.forwardRef(({ className: e, ...t }, n) =>
    c.jsx(ct, {
      ref: n,
      className: W(
        "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        e,
      ),
      ...t,
    }),
  );
ft.displayName = ct.displayName;
const mt = a.forwardRef(({ className: e, children: t, ...n }, r) =>
  c.jsxs(Ar, {
    children: [
      c.jsx(ft, {}),
      c.jsxs(lt, {
        ref: r,
        className: W(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          e,
        ),
        ...n,
        children: [
          t,
          c.jsxs(jr, {
            className:
              "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            children: [
              c.jsx(It, { className: "h-4 w-4" }),
              c.jsx("span", { className: "sr-only", children: "Close" }),
            ],
          }),
        ],
      }),
    ],
  }),
);
mt.displayName = lt.displayName;
const pt = ({ className: e, ...t }) =>
  c.jsx("div", { className: W("flex flex-col space-y-1.5 text-center sm:text-left", e), ...t });
pt.displayName = "DialogHeader";
const vt = ({ className: e, ...t }) =>
  c.jsx("div", {
    className: W("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", e),
    ...t,
  });
vt.displayName = "DialogFooter";
const ht = a.forwardRef(({ className: e, ...t }, n) =>
  c.jsx(ut, { ref: n, className: W("text-lg font-semibold leading-none tracking-tight", e), ...t }),
);
ht.displayName = ut.displayName;
const gt = a.forwardRef(({ className: e, ...t }, n) =>
  c.jsx(dt, { ref: n, className: W("text-sm text-muted-foreground", e), ...t }),
);
gt.displayName = dt.displayName;
const Tr = {
    admin_master: "Admin Master",
    gestor: "Gestor",
    operador: "Operador",
    visualizador: "Visualizador",
  },
  Mr = { admin_master: "primary", gestor: "success", operador: "warning", visualizador: "neutral" };
function Yr() {
  const e = Ot(),
    t = e.data ?? [],
    { profile: n } = Ct(),
    r = n?.role === "admin_master",
    [o, s] = a.useState(!1);
  return c.jsxs("div", {
    className: "space-y-6",
    children: [
      c.jsx(Nt, {
        title: "Usuários e permissões",
        subtitle: "Quem tem acesso ao painel e em que nível.",
        actions: r
          ? c.jsxs("button", {
              onClick: () => s(!0),
              className:
                "inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95",
              children: [c.jsx(Ut, { className: "h-4 w-4" }), " Adicionar usuário"],
            })
          : null,
      }),
      c.jsx(Rt, {
        bodyClassName: "p-0",
        children: e.isLoading
          ? c.jsx(Pt, {})
          : e.error
            ? c.jsx("div", { className: "p-4", children: c.jsx(Dt, { error: e.error }) })
            : t.length === 0
              ? c.jsx(jt, {
                  title: "Nenhum usuário ainda",
                  description: "Convide pessoas para colaborar na sua organização.",
                  icon: kt,
                })
              : c.jsxs("table", {
                  className: "w-full text-sm",
                  children: [
                    c.jsx("thead", {
                      children: c.jsxs("tr", {
                        className:
                          "border-b border-border bg-surface/50 text-[11px] uppercase tracking-wider text-muted-foreground",
                        children: [
                          c.jsx("th", { className: "px-5 py-3 text-left", children: "Usuário" }),
                          c.jsx("th", { className: "px-5 py-3 text-left", children: "Perfil" }),
                          c.jsx("th", { className: "px-5 py-3 text-left", children: "Status" }),
                        ],
                      }),
                    }),
                    c.jsx("tbody", {
                      children: t.map((l) =>
                        c.jsxs(
                          "tr",
                          {
                            className: "border-b border-border/50 hover:bg-surface/40",
                            children: [
                              c.jsx("td", {
                                className: "px-5 py-3.5",
                                children: c.jsxs("div", {
                                  className: "flex items-center gap-2.5",
                                  children: [
                                    c.jsx("div", {
                                      className:
                                        "h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-xs font-bold text-primary-foreground",
                                      children: l.name
                                        .split(" ")
                                        .map((i) => i[0])
                                        .slice(0, 2)
                                        .join("")
                                        .toUpperCase(),
                                    }),
                                    c.jsxs("div", {
                                      children: [
                                        c.jsx("p", { className: "font-medium", children: l.name }),
                                        c.jsxs("p", {
                                          className:
                                            "text-[11px] text-muted-foreground inline-flex items-center gap-1",
                                          children: [
                                            c.jsx(Lt, { className: "h-3 w-3" }),
                                            " ",
                                            l.email,
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              }),
                              c.jsx("td", {
                                className: "px-5 py-3.5",
                                children: c.jsx(ge, {
                                  tone: Mr[l.role],
                                  label: Tr[l.role],
                                  withDot: !1,
                                }),
                              }),
                              c.jsx("td", {
                                className: "px-5 py-3.5",
                                children: c.jsx(ge, {
                                  tone: l.status === "active" ? "success" : "neutral",
                                  label: l.status,
                                }),
                              }),
                            ],
                          },
                          l.id,
                        ),
                      ),
                    }),
                  ],
                }),
      }),
      c.jsx(Ir, { open: o, onOpenChange: s }),
    ],
  });
}
function Ir({ open: e, onOpenChange: t }) {
  const n = St(),
    r = Tt($t),
    [o, s] = a.useState(""),
    [l, i] = a.useState(""),
    [m, u] = a.useState("operador"),
    [f, p] = a.useState("password"),
    [v, g] = a.useState(""),
    S = () => {
      (s(""), i(""), u("operador"), p("password"), g(""));
    },
    d = At({
      mutationFn: async (h) => {
        const { data: C } = await wt.auth.getSession(),
          E = C.session?.access_token;
        if (!E) throw new Error("Sessão expirada. Entre novamente.");
        return r({ data: h, headers: { Authorization: `Bearer ${E}` } });
      },
      onSuccess: (h) => {
        (te.success(
          h.mode === "invite"
            ? `Convite enviado para ${h.email}.`
            : `Usuário ${h.email} criado com sucesso.`,
        ),
          n.invalidateQueries({ queryKey: ["users_profiles"] }),
          S(),
          t(!1));
      },
      onError: (h) => {
        te.error(h.message ?? "Não foi possível criar o usuário.");
      },
    }),
    y = (h) => {
      if ((h.preventDefault(), f === "password" && v.length < 6)) {
        te.error("Senha deve ter ao menos 6 caracteres.");
        return;
      }
      d.mutate({ name: o, email: l, role: m, mode: f, password: f === "password" ? v : void 0 });
    },
    b = () => {
      const h = Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
      g(h);
    };
  return c.jsx(Or, {
    open: e,
    onOpenChange: t,
    children: c.jsxs(mt, {
      children: [
        c.jsxs(pt, {
          children: [
            c.jsx(ht, { children: "Adicionar usuário" }),
            c.jsx(gt, { children: "O usuário será adicionado à sua organização." }),
          ],
        }),
        c.jsxs("form", {
          onSubmit: y,
          className: "space-y-4",
          children: [
            c.jsxs("div", {
              children: [
                c.jsx("label", {
                  className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                  children: "Nome",
                }),
                c.jsx("input", {
                  required: !0,
                  value: o,
                  onChange: (h) => s(h.target.value),
                  placeholder: "Maria Silva",
                  className:
                    "w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                }),
              ],
            }),
            c.jsxs("div", {
              children: [
                c.jsx("label", {
                  className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                  children: "E-mail",
                }),
                c.jsx("input", {
                  required: !0,
                  type: "email",
                  value: l,
                  onChange: (h) => i(h.target.value),
                  placeholder: "maria@empresa.com",
                  className:
                    "w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                }),
              ],
            }),
            c.jsxs("div", {
              children: [
                c.jsx("label", {
                  className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                  children: "Perfil",
                }),
                c.jsxs("select", {
                  value: m,
                  onChange: (h) => u(h.target.value),
                  className:
                    "w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  children: [
                    c.jsx("option", { value: "admin_master", children: "Admin Master" }),
                    c.jsx("option", { value: "gestor", children: "Gestor" }),
                    c.jsx("option", { value: "operador", children: "Operador" }),
                    c.jsx("option", { value: "visualizador", children: "Visualizador" }),
                  ],
                }),
              ],
            }),
            c.jsxs("div", {
              children: [
                c.jsx("label", {
                  className: "text-xs font-medium text-muted-foreground mb-1.5 block",
                  children: "Forma de acesso",
                }),
                c.jsxs("div", {
                  className: "grid grid-cols-2 gap-2",
                  children: [
                    c.jsx("button", {
                      type: "button",
                      onClick: () => p("password"),
                      className: `rounded-lg border px-3 py-2 text-sm transition ${f === "password" ? "border-primary bg-primary/10 text-foreground" : "border-input bg-surface text-muted-foreground hover:border-primary/50"}`,
                      children: "Senha temporária",
                    }),
                    c.jsx("button", {
                      type: "button",
                      onClick: () => p("invite"),
                      className: `rounded-lg border px-3 py-2 text-sm transition ${f === "invite" ? "border-primary bg-primary/10 text-foreground" : "border-input bg-surface text-muted-foreground hover:border-primary/50"}`,
                      children: "Convite por e-mail",
                    }),
                  ],
                }),
              ],
            }),
            f === "password" &&
              c.jsxs("div", {
                children: [
                  c.jsxs("div", {
                    className: "flex items-center justify-between mb-1.5",
                    children: [
                      c.jsx("label", {
                        className: "text-xs font-medium text-muted-foreground",
                        children: "Senha temporária (mín. 6)",
                      }),
                      c.jsx("button", {
                        type: "button",
                        onClick: b,
                        className: "text-[11px] text-primary hover:underline",
                        children: "Gerar",
                      }),
                    ],
                  }),
                  c.jsx("input", {
                    required: !0,
                    type: "text",
                    value: v,
                    onChange: (h) => g(h.target.value),
                    placeholder: "••••••••",
                    className:
                      "w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring",
                  }),
                  c.jsx("p", {
                    className: "text-[11px] text-muted-foreground mt-1",
                    children: "Compartilhe com o usuário e peça que troque após entrar.",
                  }),
                ],
              }),
            c.jsxs(vt, {
              children: [
                c.jsx("button", {
                  type: "button",
                  onClick: () => t(!1),
                  className:
                    "rounded-lg border border-input bg-surface px-4 py-2 text-sm hover:bg-surface/70",
                  children: "Cancelar",
                }),
                c.jsx("button", {
                  type: "submit",
                  disabled: d.isPending,
                  className:
                    "inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-60",
                  children: d.isPending
                    ? c.jsx(Ft, { className: "h-4 w-4 animate-spin" })
                    : f === "invite"
                      ? "Enviar convite"
                      : "Criar usuário",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
export { Yr as component };
