import {
  S as ee,
  q as W,
  v as g,
  x,
  y as _,
  z as T,
  A as z,
  B as V,
  C as se,
  D as F,
  E as re,
  F as ie,
  G as J,
  H as Q,
  I as X,
  J as ne,
  r as f,
  K as L,
  e as v,
  a as ae,
  s as l,
} from "./index-DUcMANMA.js";
var oe = class extends ee {
  constructor(e, t) {
    (super(),
      (this.options = t),
      (this.#s = e),
      (this.#o = null),
      (this.#a = W()),
      this.bindMethods(),
      this.setOptions(t));
  }
  #s;
  #e = void 0;
  #r = void 0;
  #t = void 0;
  #i;
  #n;
  #a;
  #o;
  #g;
  #d;
  #f;
  #u;
  #h;
  #c;
  #p = new Set();
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    this.listeners.size === 1 &&
      (this.#e.addObserver(this),
      Y(this.#e, this.options) ? this.#l() : this.updateResult(),
      this.#v());
  }
  onUnsubscribe() {
    this.hasListeners() || this.destroy();
  }
  shouldFetchOnReconnect() {
    return k(this.#e, this.options, this.options.refetchOnReconnect);
  }
  shouldFetchOnWindowFocus() {
    return k(this.#e, this.options, this.options.refetchOnWindowFocus);
  }
  destroy() {
    ((this.listeners = new Set()), this.#R(), this.#S(), this.#e.removeObserver(this));
  }
  setOptions(e) {
    const t = this.options,
      s = this.#e;
    if (
      ((this.options = this.#s.defaultQueryOptions(e)),
      this.options.enabled !== void 0 &&
        typeof this.options.enabled != "boolean" &&
        typeof this.options.enabled != "function" &&
        typeof g(this.options.enabled, this.#e) != "boolean")
    )
      throw new Error("Expected enabled to be a boolean or a callback that returns a boolean");
    (this.#w(),
      this.#e.setOptions(this.options),
      t._defaulted &&
        !x(this.options, t) &&
        this.#s
          .getQueryCache()
          .notify({ type: "observerOptionsUpdated", query: this.#e, observer: this }));
    const r = this.hasListeners();
    (r && Z(this.#e, s, this.options, t) && this.#l(),
      this.updateResult(),
      r &&
        (this.#e !== s ||
          g(this.options.enabled, this.#e) !== g(t.enabled, this.#e) ||
          _(this.options.staleTime, this.#e) !== _(t.staleTime, this.#e)) &&
        this.#y());
    const i = this.#m();
    r &&
      (this.#e !== s ||
        g(this.options.enabled, this.#e) !== g(t.enabled, this.#e) ||
        i !== this.#c) &&
      this.#b(i);
  }
  getOptimisticResult(e) {
    const t = this.#s.getQueryCache().build(this.#s, e),
      s = this.createResult(t, e);
    return (ue(this, s) && ((this.#t = s), (this.#n = this.options), (this.#i = this.#e.state)), s);
  }
  getCurrentResult() {
    return this.#t;
  }
  trackResult(e, t) {
    return new Proxy(e, {
      get: (s, r) => (
        this.trackProp(r),
        t?.(r),
        r === "promise" &&
          (this.trackProp("data"),
          !this.options.experimental_prefetchInRender &&
            this.#a.status === "pending" &&
            this.#a.reject(new Error("experimental_prefetchInRender feature flag is not enabled"))),
        Reflect.get(s, r)
      ),
    });
  }
  trackProp(e) {
    this.#p.add(e);
  }
  getCurrentQuery() {
    return this.#e;
  }
  refetch({ ...e } = {}) {
    return this.fetch({ ...e });
  }
  fetchOptimistic(e) {
    const t = this.#s.defaultQueryOptions(e),
      s = this.#s.getQueryCache().build(this.#s, t);
    return s.fetch().then(() => this.createResult(s, t));
  }
  fetch(e) {
    return this.#l({ ...e, cancelRefetch: e.cancelRefetch ?? !0 }).then(
      () => (this.updateResult(), this.#t),
    );
  }
  #l(e) {
    this.#w();
    let t = this.#e.fetch(this.options, e);
    return (e?.throwOnError || (t = t.catch(T)), t);
  }
  #y() {
    this.#R();
    const e = _(this.options.staleTime, this.#e);
    if (z.isServer() || this.#t.isStale || !V(e)) return;
    const s = se(this.#t.dataUpdatedAt, e) + 1;
    this.#u = F.setTimeout(() => {
      this.#t.isStale || this.updateResult();
    }, s);
  }
  #m() {
    return (
      (typeof this.options.refetchInterval == "function"
        ? this.options.refetchInterval(this.#e)
        : this.options.refetchInterval) ?? !1
    );
  }
  #b(e) {
    (this.#S(),
      (this.#c = e),
      !(z.isServer() || g(this.options.enabled, this.#e) === !1 || !V(this.#c) || this.#c === 0) &&
        (this.#h = F.setInterval(() => {
          (this.options.refetchIntervalInBackground || re.isFocused()) && this.#l();
        }, this.#c)));
  }
  #v() {
    (this.#y(), this.#b(this.#m()));
  }
  #R() {
    this.#u !== void 0 && (F.clearTimeout(this.#u), (this.#u = void 0));
  }
  #S() {
    this.#h !== void 0 && (F.clearInterval(this.#h), (this.#h = void 0));
  }
  createResult(e, t) {
    const s = this.#e,
      r = this.options,
      i = this.#t,
      o = this.#i,
      n = this.#n,
      S = e !== s ? e.state : this.#r,
      { state: h } = e;
    let a = { ...h },
      w = !1,
      c;
    if (t._optimisticResults) {
      const p = this.hasListeners(),
        O = !p && Y(e, t),
        E = p && Z(e, s, t, r);
      ((O || E) && (a = { ...a, ...ie(h.data, e.options) }),
        t._optimisticResults === "isRestoring" && (a.fetchStatus = "idle"));
    }
    let { error: I, errorUpdatedAt: j, status: b } = a;
    c = a.data;
    let N = !1;
    if (t.placeholderData !== void 0 && c === void 0 && b === "pending") {
      let p;
      (i?.isPlaceholderData && t.placeholderData === n?.placeholderData
        ? ((p = i.data), (N = !0))
        : (p =
            typeof t.placeholderData == "function"
              ? t.placeholderData(this.#f?.state.data, this.#f)
              : t.placeholderData),
        p !== void 0 && ((b = "success"), (c = J(i?.data, p, t)), (w = !0)));
    }
    if (t.select && c !== void 0 && !N)
      if (i && c === o?.data && t.select === this.#g) c = this.#d;
      else
        try {
          ((this.#g = t.select),
            (c = t.select(c)),
            (c = J(i?.data, c, t)),
            (this.#d = c),
            (this.#o = null));
        } catch (p) {
          this.#o = p;
        }
    this.#o && ((I = this.#o), (c = this.#d), (j = Date.now()), (b = "error"));
    const D = a.fetchStatus === "fetching",
      U = b === "pending",
      K = b === "error",
      B = U && D,
      G = c !== void 0,
      m = {
        status: b,
        fetchStatus: a.fetchStatus,
        isPending: U,
        isSuccess: b === "success",
        isError: K,
        isInitialLoading: B,
        isLoading: B,
        data: c,
        dataUpdatedAt: a.dataUpdatedAt,
        error: I,
        errorUpdatedAt: j,
        failureCount: a.fetchFailureCount,
        failureReason: a.fetchFailureReason,
        errorUpdateCount: a.errorUpdateCount,
        isFetched: e.isFetched(),
        isFetchedAfterMount:
          a.dataUpdateCount > S.dataUpdateCount || a.errorUpdateCount > S.errorUpdateCount,
        isFetching: D,
        isRefetching: D && !U,
        isLoadingError: K && !G,
        isPaused: a.fetchStatus === "paused",
        isPlaceholderData: w,
        isRefetchError: K && G,
        isStale: A(e, t),
        refetch: this.refetch,
        promise: this.#a,
        isEnabled: g(t.enabled, e) !== !1,
      };
    if (this.options.experimental_prefetchInRender) {
      const p = m.data !== void 0,
        O = m.status === "error" && !p,
        E = (M) => {
          O ? M.reject(m.error) : p && M.resolve(m.data);
        },
        H = () => {
          const M = (this.#a = m.promise = W());
          E(M);
        },
        q = this.#a;
      switch (q.status) {
        case "pending":
          e.queryHash === s.queryHash && E(q);
          break;
        case "fulfilled":
          (O || m.data !== q.value) && H();
          break;
        case "rejected":
          (!O || m.error !== q.reason) && H();
          break;
      }
    }
    return m;
  }
  updateResult() {
    const e = this.#t,
      t = this.createResult(this.#e, this.options);
    if (
      ((this.#i = this.#e.state),
      (this.#n = this.options),
      this.#i.data !== void 0 && (this.#f = this.#e),
      x(t, e))
    )
      return;
    this.#t = t;
    const s = () => {
      if (!e) return !0;
      const { notifyOnChangeProps: r } = this.options,
        i = typeof r == "function" ? r() : r;
      if (i === "all" || (!i && !this.#p.size)) return !0;
      const o = new Set(i ?? this.#p);
      return (
        this.options.throwOnError && o.add("error"),
        Object.keys(this.#t).some((n) => {
          const u = n;
          return this.#t[u] !== e[u] && o.has(u);
        })
      );
    };
    this.#O({ listeners: s() });
  }
  #w() {
    const e = this.#s.getQueryCache().build(this.#s, this.options);
    if (e === this.#e) return;
    const t = this.#e;
    ((this.#e = e),
      (this.#r = e.state),
      this.hasListeners() && (t?.removeObserver(this), e.addObserver(this)));
  }
  onQueryUpdate() {
    (this.updateResult(), this.hasListeners() && this.#v());
  }
  #O(e) {
    Q.batch(() => {
      (e.listeners &&
        this.listeners.forEach((t) => {
          t(this.#t);
        }),
        this.#s.getQueryCache().notify({ query: this.#e, type: "observerResultsUpdated" }));
    });
  }
};
function ce(e, t) {
  return (
    g(t.enabled, e) !== !1 &&
    e.state.data === void 0 &&
    !(e.state.status === "error" && t.retryOnMount === !1)
  );
}
function Y(e, t) {
  return ce(e, t) || (e.state.data !== void 0 && k(e, t, t.refetchOnMount));
}
function k(e, t, s) {
  if (g(t.enabled, e) !== !1 && _(t.staleTime, e) !== "static") {
    const r = typeof s == "function" ? s(e) : s;
    return r === "always" || (r !== !1 && A(e, t));
  }
  return !1;
}
function Z(e, t, s, r) {
  return (
    (e !== t || g(r.enabled, e) === !1) && (!s.suspense || e.state.status !== "error") && A(e, s)
  );
}
function A(e, t) {
  return g(t.enabled, e) !== !1 && e.isStaleByTime(_(t.staleTime, e));
}
function ue(e, t) {
  return !x(e.getCurrentResult(), t);
}
var he = class extends ee {
    #s;
    #e = void 0;
    #r;
    #t;
    constructor(e, t) {
      (super(), (this.#s = e), this.setOptions(t), this.bindMethods(), this.#i());
    }
    bindMethods() {
      ((this.mutate = this.mutate.bind(this)), (this.reset = this.reset.bind(this)));
    }
    setOptions(e) {
      const t = this.options;
      ((this.options = this.#s.defaultMutationOptions(e)),
        x(this.options, t) ||
          this.#s
            .getMutationCache()
            .notify({ type: "observerOptionsUpdated", mutation: this.#r, observer: this }),
        t?.mutationKey &&
        this.options.mutationKey &&
        X(t.mutationKey) !== X(this.options.mutationKey)
          ? this.reset()
          : this.#r?.state.status === "pending" && this.#r.setOptions(this.options));
    }
    onUnsubscribe() {
      this.hasListeners() || this.#r?.removeObserver(this);
    }
    onMutationUpdate(e) {
      (this.#i(), this.#n(e));
    }
    getCurrentResult() {
      return this.#e;
    }
    reset() {
      (this.#r?.removeObserver(this), (this.#r = void 0), this.#i(), this.#n());
    }
    mutate(e, t) {
      return (
        (this.#t = t),
        this.#r?.removeObserver(this),
        (this.#r = this.#s.getMutationCache().build(this.#s, this.options)),
        this.#r.addObserver(this),
        this.#r.execute(e)
      );
    }
    #i() {
      const e = this.#r?.state ?? ne();
      this.#e = {
        ...e,
        isPending: e.status === "pending",
        isSuccess: e.status === "success",
        isError: e.status === "error",
        isIdle: e.status === "idle",
        mutate: this.mutate,
        reset: this.reset,
      };
    }
    #n(e) {
      Q.batch(() => {
        if (this.#t && this.hasListeners()) {
          const t = this.#e.variables,
            s = this.#e.context,
            r = { client: this.#s, meta: this.options.meta, mutationKey: this.options.mutationKey };
          if (e?.type === "success") {
            try {
              this.#t.onSuccess?.(e.data, t, s, r);
            } catch (i) {
              Promise.reject(i);
            }
            try {
              this.#t.onSettled?.(e.data, null, t, s, r);
            } catch (i) {
              Promise.reject(i);
            }
          } else if (e?.type === "error") {
            try {
              this.#t.onError?.(e.error, t, s, r);
            } catch (i) {
              Promise.reject(i);
            }
            try {
              this.#t.onSettled?.(void 0, e.error, t, s, r);
            } catch (i) {
              Promise.reject(i);
            }
          }
        }
        this.listeners.forEach((t) => {
          t(this.#e);
        });
      });
    }
  },
  te = f.createContext(!1),
  le = () => f.useContext(te);
te.Provider;
function de() {
  let e = !1;
  return {
    clearReset: () => {
      e = !1;
    },
    reset: () => {
      e = !0;
    },
    isReset: () => e,
  };
}
var fe = f.createContext(de()),
  pe = () => f.useContext(fe),
  ge = (e, t, s) => {
    const r =
      s?.state.error && typeof e.throwOnError == "function"
        ? L(e.throwOnError, [s.state.error, s])
        : e.throwOnError;
    (e.suspense || e.experimental_prefetchInRender || r) && (t.isReset() || (e.retryOnMount = !1));
  },
  ye = (e) => {
    f.useEffect(() => {
      e.clearReset();
    }, [e]);
  },
  me = ({ result: e, errorResetBoundary: t, throwOnError: s, query: r, suspense: i }) =>
    e.isError &&
    !t.isReset() &&
    !e.isFetching &&
    r &&
    ((i && e.data === void 0) || L(s, [e.error, r])),
  be = (e) => {
    if (e.suspense) {
      const s = (i) => (i === "static" ? i : Math.max(i ?? 1e3, 1e3)),
        r = e.staleTime;
      ((e.staleTime = typeof r == "function" ? (...i) => s(r(...i)) : s(r)),
        typeof e.gcTime == "number" && (e.gcTime = Math.max(e.gcTime, 1e3)));
    }
  },
  ve = (e, t) => e.isLoading && e.isFetching && !t,
  Re = (e, t) => e?.suspense && t.isPending,
  $ = (e, t, s) =>
    t.fetchOptimistic(e).catch(() => {
      s.clearReset();
    });
function Se(e, t, s) {
  const r = le(),
    i = pe(),
    o = v(),
    n = o.defaultQueryOptions(e);
  o.getDefaultOptions().queries?._experimental_beforeQuery?.(n);
  const u = o.getQueryCache().get(n.queryHash);
  ((n._optimisticResults = r ? "isRestoring" : "optimistic"), be(n), ge(n, i, u), ye(i));
  const S = !o.getQueryCache().get(n.queryHash),
    [h] = f.useState(() => new t(o, n)),
    a = h.getOptimisticResult(n),
    w = !r && e.subscribed !== !1;
  if (
    (f.useSyncExternalStore(
      f.useCallback(
        (c) => {
          const I = w ? h.subscribe(Q.batchCalls(c)) : T;
          return (h.updateResult(), I);
        },
        [h, w],
      ),
      () => h.getCurrentResult(),
      () => h.getCurrentResult(),
    ),
    f.useEffect(() => {
      h.setOptions(n);
    }, [n, h]),
    Re(n, a))
  )
    throw $(n, h, i);
  if (
    me({
      result: a,
      errorResetBoundary: i,
      throwOnError: n.throwOnError,
      query: u,
      suspense: n.suspense,
    })
  )
    throw a.error;
  return (
    o.getDefaultOptions().queries?._experimental_afterQuery?.(n, a),
    n.experimental_prefetchInRender &&
      !z.isServer() &&
      ve(a, r) &&
      (S ? $(n, h, i) : u?.promise)?.catch(T).finally(() => {
        h.updateResult();
      }),
    n.notifyOnChangeProps ? a : h.trackResult(a)
  );
}
function y(e, t) {
  return Se(e, oe);
}
function P(e, t) {
  const s = v(),
    [r] = f.useState(() => new he(s, e));
  f.useEffect(() => {
    r.setOptions(e);
  }, [r, e]);
  const i = f.useSyncExternalStore(
      f.useCallback((n) => r.subscribe(Q.batchCalls(n)), [r]),
      () => r.getCurrentResult(),
      () => r.getCurrentResult(),
    ),
    o = f.useCallback(
      (n, u) => {
        r.mutate(n, u).catch(T);
      },
      [r],
    );
  if (i.error && L(r.options.throwOnError, [i.error])) throw i.error;
  return { ...i, mutate: o, mutateAsync: i.mutate };
}
function d() {
  const { profile: e } = ae();
  return e?.organization_id ?? null;
}
function Ce() {
  const e = d();
  return y({
    queryKey: ["organization", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("organizations")
        .select("*")
        .eq("id", e)
        .maybeSingle();
      if (s) throw s;
      return t;
    },
  });
}
function Ie() {
  const e = d();
  return y({
    queryKey: ["units", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("units")
        .select("*")
        .eq("organization_id", e)
        .order("created_at", { ascending: !1 });
      if (s) throw s;
      return t ?? [];
    },
  });
}
function Ee() {
  const e = d();
  return y({
    queryKey: ["screens", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("screens")
        .select("*")
        .eq("organization_id", e)
        .order("created_at", { ascending: !1 });
      if (s) throw s;
      return t ?? [];
    },
  });
}
function qe() {
  const e = d();
  return y({
    queryKey: ["screen_groups", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("screen_groups")
        .select("*")
        .eq("organization_id", e)
        .order("created_at", { ascending: !1 });
      if (s) throw s;
      return t ?? [];
    },
  });
}
function Me() {
  const e = d();
  return y({
    queryKey: ["media", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("media_assets")
        .select("*")
        .eq("organization_id", e)
        .order("created_at", { ascending: !1 });
      if (s) throw s;
      return t ?? [];
    },
  });
}
function Fe() {
  const e = d();
  return y({
    queryKey: ["playlists", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("playlists")
        .select("*")
        .eq("organization_id", e)
        .order("created_at", { ascending: !1 });
      if (s) throw s;
      return t ?? [];
    },
  });
}
function xe() {
  const e = d();
  return y({
    queryKey: ["campaigns", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("campaigns")
        .select("*")
        .eq("organization_id", e)
        .order("created_at", { ascending: !1 });
      if (s) throw s;
      return t ?? [];
    },
  });
}
function Te() {
  const e = d();
  return y({
    queryKey: ["campaign_schedules", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("campaign_schedules")
        .select("*, campaigns!inner(organization_id, name)")
        .eq("campaigns.organization_id", e)
        .order("created_at", { ascending: !1 });
      if (s) throw s;
      return t ?? [];
    },
  });
}
function Qe() {
  const e = d();
  return y({
    queryKey: ["alerts", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("alerts")
        .select("*")
        .eq("organization_id", e)
        .order("created_at", { ascending: !1 })
        .limit(100);
      if (s) throw s;
      return t ?? [];
    },
  });
}
function Pe() {
  const e = d();
  return y({
    queryKey: ["audit_logs", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("audit_logs")
        .select("*")
        .eq("organization_id", e)
        .order("created_at", { ascending: !1 })
        .limit(100);
      if (s) throw s;
      return t ?? [];
    },
  });
}
function De() {
  const e = d();
  return y({
    queryKey: ["users_profiles", e],
    enabled: !!e,
    queryFn: async () => {
      const { data: t, error: s } = await l
        .from("profiles")
        .select("*")
        .eq("organization_id", e)
        .order("created_at", { ascending: !1 });
      if (s) throw s;
      return t ?? [];
    },
  });
}
function C(e, t) {
  const s = v(),
    r = d();
  return P({
    mutationFn: async (i) => {
      if (!r) throw new Error("Sem organização ativa.");
      const o = { ...i, organization_id: r },
        { data: n, error: u } = await l.from(e).insert(o).select().single();
      if (u) throw u;
      return n;
    },
    onSuccess: () => s.invalidateQueries({ queryKey: [t, r] }),
  });
}
function we(e, t) {
  const s = v(),
    r = d();
  return P({
    mutationFn: async ({ id: i, ...o }) => {
      const { data: n, error: u } = await l.from(e).update(o).eq("id", i).select().single();
      if (u) throw u;
      return n;
    },
    onSuccess: () => s.invalidateQueries({ queryKey: [t, r] }),
  });
}
function R(e, t) {
  const s = v(),
    r = d();
  return P({
    mutationFn: async (i) => {
      const { error: o } = await l.from(e).delete().eq("id", i);
      if (o) throw o;
      return i;
    },
    onSuccess: () => s.invalidateQueries({ queryKey: [t, r] }),
  });
}
const Ue = () => C("units", "units"),
  Ke = () => R("units", "units"),
  ze = () => R("screens", "screens"),
  ke = () => C("screen_groups", "screen_groups"),
  Le = () => R("screen_groups", "screen_groups"),
  Ae = () => C("playlists", "playlists"),
  je = () => R("playlists", "playlists"),
  Ne = () => C("campaigns", "campaigns"),
  Be = () => we("campaigns", "campaigns"),
  Ge = () => R("campaigns", "campaigns"),
  He = () => C("media_assets", "media"),
  We = () => R("media_assets", "media");
function Ve() {
  const e = v(),
    t = d();
  return P({
    mutationFn: async (s) => {
      const { error: r } = await l
        .from("alerts")
        .update({ resolved_at: new Date().toISOString(), status: "inactive" })
        .eq("id", s);
      if (r) throw r;
    },
    onSuccess: () => e.invalidateQueries({ queryKey: ["alerts", t] }),
  });
}
export {
  xe as a,
  Ee as b,
  Qe as c,
  Fe as d,
  De as e,
  P as f,
  Ie as g,
  Ue as h,
  Ke as i,
  ze as j,
  Ae as k,
  je as l,
  He as m,
  We as n,
  qe as o,
  ke as p,
  Le as q,
  Ce as r,
  Ne as s,
  Be as t,
  Me as u,
  Ge as v,
  Pe as w,
  Ve as x,
  Te as y,
};
