import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Save, Search, Check, Radio as RadioIcon, Play, Pause } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  listScreensWithRadio,
  upsertRadioStream,
  type ScreenWithRadio,
} from "@/lib/server/radio.functions";
import { withAuthHeader } from "@/lib/server/with-auth-header";

/**
 * Formulário inline de Rádio Online para uso dentro do modal "Adicionar mídia".
 * - Lista todas as telas/unidades com seleção múltipla
 * - Salva a mesma configuração para as telas selecionadas
 * - Sem recarregar a página (invalida a query relevante)
 */
export function RadioInModalForm({ onDone }: { onDone?: () => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listScreensWithRadio);
  const upsertFn = useServerFn(upsertRadioStream);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState("Rádio Ambiente");
  const [url, setUrl] = useState("");
  const [volume, setVolume] = useState(0.8);
  const [isActive, setIsActive] = useState(true);
  const [testing, setTesting] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ["midias-radio-screens"],
    queryFn: () => withAuthHeader(() => listFn({ data: undefined as never })),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (r: ScreenWithRadio) =>
        r.screen_name.toLowerCase().includes(q) ||
        (r.organization_name ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  const toggleScreen = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.screen_id)));
  };

  const save = useMutation({
    mutationFn: async () => {
      const ids = [...selected];
      const results = await Promise.allSettled(
        ids.map((screen_id) =>
          withAuthHeader(() =>
            upsertFn({
              data: {
                screen_id,
                radio_name: name,
                stream_url: url,
                volume,
                is_active: isActive,
              },
            }),
          ),
        ),
      );
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.length - ok;
      return { ok, fail };
    },
    onSuccess: ({ ok, fail }) => {
      qc.invalidateQueries({ queryKey: ["midias-radio-screens"] });
      if (fail === 0) toast.success(`Rádio configurada em ${ok} tela(s).`);
      else toast.warning(`Configurada em ${ok}, falhou em ${fail}.`);
      if (fail === 0) onDone?.();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao salvar"),
  });

  const handleTest = () => {
    if (!url) {
      toast.error("Informe a URL primeiro");
      return;
    }
    if (testing) {
      const el = (window as unknown as { __radioTest?: HTMLAudioElement }).__radioTest;
      el?.pause();
      (window as unknown as { __radioTest?: HTMLAudioElement }).__radioTest = undefined;
      setTesting(false);
      return;
    }
    const a = new Audio();
    a.src = url;
    a.volume = volume;
    a.play()
      .then(() => {
        (window as unknown as { __radioTest?: HTMLAudioElement }).__radioTest = a;
        setTesting(true);
      })
      .catch((e) => toast.error(`Falha: ${e instanceof Error ? e.message : "erro"}`));
  };

  const canSave = url.trim().length > 0 && selected.size > 0 && !save.isPending;

  return (
    <div className="space-y-3 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/20 grid place-items-center text-primary">
          <RadioIcon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Configurar Rádio Online</p>
          <p className="text-[11px] text-muted-foreground">
            Selecione as telas e defina o stream. Toca em background sem afetar a playlist.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Nome da rádio</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">URL do stream</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://stream…/radio.mp3"
            className="font-mono text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
        <div className="space-y-1">
          <Label className="text-xs">Volume — {Math.round(volume * 100)}%</Label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <span className="text-xs">{isActive ? "Ativo" : "Pausado"}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs">
            Telas / Unidades ({selected.size}/{filtered.length} selecionadas)
          </Label>
          <button
            type="button"
            onClick={toggleAll}
            className="text-[11px] text-primary hover:underline"
          >
            {selected.size === filtered.length ? "Limpar" : "Selecionar todas"}
          </button>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tela ou unidade…"
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="max-h-44 overflow-y-auto rounded-md border border-border divide-y divide-border/60">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">
              Nenhuma tela encontrada.
            </p>
          ) : (
            filtered.map((r) => {
              const checked = selected.has(r.screen_id);
              return (
                <button
                  key={r.screen_id}
                  type="button"
                  onClick={() => toggleScreen(r.screen_id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-muted/40 ${
                    checked ? "bg-primary/5" : ""
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded border grid place-items-center shrink-0 ${
                      checked ? "bg-primary border-primary text-white" : "border-input"
                    }`}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="font-medium truncate block">{r.screen_name}</span>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      {r.organization_name ?? "—"}
                      {r.radio ? ` · já tem rádio (${r.radio.radio_name})` : ""}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={handleTest}>
          {testing ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
          {testing ? "Parar" : "Testar"}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => save.mutate()}
          disabled={!canSave}
        >
          {save.isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1" />
          )}
          Salvar em {selected.size || 0} tela(s)
        </Button>
      </div>
    </div>
  );
}
