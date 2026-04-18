import { U as jsxRuntimeExports } from "./worker-entry-CFvqOeOX.js";
import { P as PageHeader } from "./PageHeader-Dkx9-OAF.js";
import { P as Panel } from "./Panel-iDal3y1F.js";
import { S as StatusBadge } from "./StatusBadge-CQeJIG5P.js";
import { L as LoadingState, a as ErrorState, E as EmptyState } from "./States-BZKT3Fib.js";
import { y as useCampaignSchedules } from "./use-supabase-data-DWtjSxP7.js";
import { C as CalendarClock } from "./calendar-clock-X0nhAw5S.js";
import { C as Clock } from "./clock-VTGEDSoC.js";
import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { G as Globe } from "./globe-CZTrqLgi.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-Bz4m9VPB.js";
import "./loader-circle-DWZmQ-AH.js";
import "./router-BfC5KUx0.js";
import "./index-Cf78ubZ7.js";
const __iconNode = [
  ["path", { d: "m17 2 4 4-4 4", key: "nntrym" }],
  ["path", { d: "M3 11v-1a4 4 0 0 1 4-4h14", key: "84bu3i" }],
  ["path", { d: "m7 22-4-4 4-4", key: "1wqhfi" }],
  ["path", { d: "M21 13v1a4 4 0 0 1-4 4H3", key: "1rx37r" }]
];
const Repeat = createLucideIcon("repeat", __iconNode);
const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
function SchedulePage() {
  const {
    data: schedules = [],
    isLoading,
    error
  } = useCampaignSchedules();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Agendamentos", subtitle: "Programe quando cada campanha será exibida nas suas telas." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { className: "lg:col-span-2", title: "Calendário semanal", description: "Distribuição de campanhas ao longo da semana.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[700px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-8 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Hora" }),
          days.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: d }, d))
        ] }),
        Array.from({
          length: 12
        }).map((_, h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-8 gap-1 mb-1 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground font-mono", children: [
            (7 + h).toString().padStart(2, "0"),
            ":00"
          ] }),
          days.map((d, di) => {
            const hourLabel = `${(7 + h).toString().padStart(2, "0")}:00`;
            const match = schedules.find((s) => {
              const startH = parseInt(s.start_time.slice(0, 2), 10);
              const endH = parseInt(s.end_time.slice(0, 2), 10);
              const dow = s.day_of_week;
              const inHour = 7 + h >= startH && 7 + h < endH;
              const inDay = dow === null || dow === di;
              return inHour && inDay;
            });
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-8 rounded-md border ${match ? "bg-primary/20 border-primary/40" : "border-border/40 bg-surface/30"}`, children: match && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-foreground/80 px-1.5 py-1 truncate", children: "Camp" }) }, d + hourLabel);
          })
        ] }, h))
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Próximos agendamentos", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingState, {}) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error }) : schedules.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: CalendarClock, title: "Nenhum agendamento", description: "Os agendamentos aparecem aqui ao vincular horários a campanhas." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: schedules.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-lg border border-border bg-surface/50 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: s.campaigns?.name ?? "Campanha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { tone: s.is_active ? "success" : "warning", label: s.is_active ? "Ativa" : "Pausada" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2 text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
            " ",
            s.start_time.slice(0, 5),
            " – ",
            s.end_time.slice(0, 5)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat, { className: "h-3 w-3" }),
            " ",
            s.recurrence_rule ?? "Diária"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3 w-3" }),
            " ",
            s.timezone
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1", children: s.day_of_week === null ? "Todos os dias" : days[s.day_of_week] })
        ] })
      ] }, s.id)) }) })
    ] })
  ] });
}
export {
  SchedulePage as component
};
