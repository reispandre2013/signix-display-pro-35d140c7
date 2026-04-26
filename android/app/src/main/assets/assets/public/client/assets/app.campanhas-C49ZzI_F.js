import { r as h, j as e, L as M } from "./index-DUcMANMA.js";
import { P as E } from "./PageHeader-C0iFmY02.js";
import { P as I } from "./Panel-0HKdxBPL.js";
import { S as g } from "./StatusBadge-Deydaofp.js";
import { L, a as F, E as O } from "./States-snX8_8k6.js";
import { P as u, M as T, F as r, T as l, a as R } from "./FormControls-CVqdqSiZ.js";
import { a as q, d as A, s as B, t as U, v as $ } from "./use-supabase-data-neXhdC03.js";
import { P as y } from "./plus-Cunu08C7.js";
import { M as j } from "./megaphone-CoxL7Qo6.js";
import { L as H } from "./layers-9cNZ3afn.js";
import { c as w } from "./createLucideIcon-BDYLgomD.js";
import { f as v } from "./format-Ca9zXj_K.js";
import { p as f } from "./pt-BR-B79SV-js.js";
import { E as z } from "./eye-Cgf46zt5.js";
import { P as G } from "./play-E0OUE_5_.js";
import { T as J } from "./trash-2-DoR7LW8e.js";
import "./utils-BQHNewu7.js";
import "./loader-circle-BffduC8P.js";
import "./x-Dpfm6mfs.js";
import "./en-US-DfnapdEA.js";
const K = [
    ["path", { d: "M8 2v4", key: "1cmpym" }],
    ["path", { d: "M16 2v4", key: "4m81vk" }],
    ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
    ["path", { d: "M3 10h18", key: "8toen8" }],
  ],
  b = w("calendar", K);
const Q = [
    ["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1", key: "kaeet6" }],
    ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1", key: "1wsw3u" }],
  ],
  V = w("pause", Q),
  W = {
    active: "success",
    scheduled: "primary",
    paused: "warning",
    ended: "neutral",
    draft: "neutral",
  },
  N = {
    active: "Ativa",
    scheduled: "Agendada",
    paused: "Pausada",
    ended: "Encerrada",
    draft: "Rascunho",
  };
function ye() {
  const { data: i = [], isLoading: c, error: n } = q(),
    { data: x = [] } = A(),
    m = B(),
    C = U(),
    P = $(),
    [_, o] = h.useState(!1),
    [t, s] = h.useState({
      name: "",
      description: "",
      playlist_id: "",
      priority: 5,
      start_at: new Date().toISOString().slice(0, 16),
      end_at: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16),
    }),
    S = async (a) => {
      (a.preventDefault(),
        t.playlist_id &&
          (await m.mutateAsync({
            name: t.name,
            description: t.description,
            playlist_id: t.playlist_id,
            priority: t.priority,
            start_at: new Date(t.start_at).toISOString(),
            end_at: new Date(t.end_at).toISOString(),
            status: "scheduled",
          }),
          o(!1),
          s({ ...t, name: "", description: "" })));
    },
    k = (a, p) => {
      C.mutate({ id: a, status: p === "paused" ? "active" : "paused" });
    },
    D = (a) => x.find((p) => p.id === a)?.name ?? "—";
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsx(E, {
        title: "Campanhas",
        subtitle: "Crie, programe e veicule playlists em grupos de telas e unidades.",
        actions: e.jsxs(u, {
          onClick: () => o(!0),
          children: [e.jsx(y, { className: "h-3.5 w-3.5" }), " Nova campanha"],
        }),
      }),
      c
        ? e.jsx(L, {})
        : n
          ? e.jsx(F, { error: n })
          : i.length === 0
            ? e.jsx(I, {
                children: e.jsx(O, {
                  icon: j,
                  title: "Nenhuma campanha criada",
                  description:
                    "Crie sua primeira campanha vinculando uma playlist a telas e horários.",
                  action: e.jsxs(u, {
                    onClick: () => o(!0),
                    children: [e.jsx(y, { className: "h-3.5 w-3.5" }), " Nova campanha"],
                  }),
                }),
              })
            : e.jsx("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4",
                children: i.map((a) =>
                  e.jsxs(
                    "article",
                    {
                      className:
                        "group rounded-xl border border-border bg-card overflow-hidden shadow-card hover:border-primary/40 hover:shadow-glow transition-smooth",
                      children: [
                        e.jsxs("div", {
                          className: "relative h-32 bg-gradient-primary overflow-hidden",
                          children: [
                            e.jsx("div", {
                              className:
                                "absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent",
                            }),
                            e.jsxs("div", {
                              className: "absolute top-3 left-3 flex items-center gap-2",
                              children: [
                                e.jsx(g, { tone: W[a.status], label: N[a.status].toUpperCase() }),
                                e.jsx(g, {
                                  tone: "primary",
                                  label: `PRIO ${a.priority}`,
                                  withDot: !1,
                                }),
                              ],
                            }),
                            e.jsx("div", {
                              className: "absolute bottom-3 left-3 right-3",
                              children: e.jsx("h3", {
                                className: "font-display text-lg font-bold leading-tight",
                                children: a.name,
                              }),
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "p-4 space-y-3",
                          children: [
                            e.jsx("p", {
                              className: "text-xs text-muted-foreground line-clamp-2",
                              children: a.description ?? "—",
                            }),
                            e.jsxs("div", {
                              className: "grid grid-cols-2 gap-2 text-[11px]",
                              children: [
                                e.jsx(d, { icon: H, label: "Playlist", value: D(a.playlist_id) }),
                                e.jsx(d, { icon: j, label: "Status", value: N[a.status] }),
                                e.jsx(d, {
                                  icon: b,
                                  label: "Início",
                                  value: v(new Date(a.start_at), "dd/MM/yyyy", { locale: f }),
                                }),
                                e.jsx(d, {
                                  icon: b,
                                  label: "Fim",
                                  value: v(new Date(a.end_at), "dd/MM/yyyy", { locale: f }),
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "flex items-center gap-1.5 pt-3 border-t border-border",
                              children: [
                                e.jsxs(M, {
                                  to: "/app/preview",
                                  className:
                                    "flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-accent transition-smooth",
                                  children: [e.jsx(z, { className: "h-3 w-3" }), " Preview"],
                                }),
                                e.jsx("button", {
                                  onClick: () => k(a.id, a.status),
                                  className:
                                    "flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-1.5 text-xs hover:bg-primary/20 transition-smooth",
                                  children:
                                    a.status === "paused"
                                      ? e.jsxs(e.Fragment, {
                                          children: [
                                            e.jsx(G, { className: "h-3 w-3" }),
                                            " Retomar",
                                          ],
                                        })
                                      : e.jsxs(e.Fragment, {
                                          children: [e.jsx(V, { className: "h-3 w-3" }), " Pausar"],
                                        }),
                                }),
                                e.jsx("button", {
                                  onClick: () =>
                                    confirm("Excluir esta campanha?") && P.mutate(a.id),
                                  className:
                                    "h-7 w-7 grid place-items-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
                                  children: e.jsx(J, { className: "h-3.5 w-3.5" }),
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    },
                    a.id,
                  ),
                ),
              }),
      e.jsx(T, {
        open: _,
        onClose: () => o(!1),
        title: "Nova campanha",
        children: e.jsxs("form", {
          onSubmit: S,
          className: "space-y-3",
          children: [
            e.jsx(r, {
              label: "Nome",
              children: e.jsx(l, {
                required: !0,
                value: t.name,
                onChange: (a) => s({ ...t, name: a.target.value }),
              }),
            }),
            e.jsx(r, {
              label: "Descrição",
              children: e.jsx(R, {
                value: t.description,
                onChange: (a) => s({ ...t, description: a.target.value }),
              }),
            }),
            e.jsx(r, {
              label: "Playlist",
              children: e.jsxs("select", {
                required: !0,
                value: t.playlist_id,
                onChange: (a) => s({ ...t, playlist_id: a.target.value }),
                className: "w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm",
                children: [
                  e.jsx("option", { value: "", children: "Selecione…" }),
                  x.map((a) => e.jsx("option", { value: a.id, children: a.name }, a.id)),
                ],
              }),
            }),
            e.jsxs("div", {
              className: "grid grid-cols-2 gap-3",
              children: [
                e.jsx(r, {
                  label: "Início",
                  children: e.jsx(l, {
                    type: "datetime-local",
                    required: !0,
                    value: t.start_at,
                    onChange: (a) => s({ ...t, start_at: a.target.value }),
                  }),
                }),
                e.jsx(r, {
                  label: "Fim",
                  children: e.jsx(l, {
                    type: "datetime-local",
                    required: !0,
                    value: t.end_at,
                    onChange: (a) => s({ ...t, end_at: a.target.value }),
                  }),
                }),
              ],
            }),
            e.jsx(r, {
              label: "Prioridade (1-10)",
              children: e.jsx(l, {
                type: "number",
                min: 1,
                max: 10,
                value: t.priority,
                onChange: (a) => s({ ...t, priority: Number(a.target.value) }),
              }),
            }),
            e.jsx(u, {
              type: "submit",
              disabled: m.isPending,
              children: m.isPending ? "Salvando…" : "Criar campanha",
            }),
          ],
        }),
      }),
    ],
  });
}
function d({ icon: i, label: c, value: n }) {
  return e.jsxs("div", {
    className: "rounded-md bg-surface/50 px-2.5 py-1.5",
    children: [
      e.jsxs("div", {
        className: "flex items-center gap-1 text-muted-foreground",
        children: [e.jsx(i, { className: "h-3 w-3" }), " ", c],
      }),
      e.jsx("div", { className: "text-foreground font-medium truncate mt-0.5", children: n }),
    ],
  });
}
export { ye as component };
