import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Radio, Loader2, Save, Trash2, Play, Pause, Search, Volume2 } from "lucide-react";
import { Panel } from "@/components/ui-kit/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listScreensWithRadio,
  upsertRadioStream,
  deleteRadioStream,
  toggleRadioActive,
  type ScreenWithRadio,
} from "@/lib/server/radio.functions";
import { withAuthHeader } from "@/lib/server/with-auth-header";

/**
 * Seção de Rádio Online — embutida na Biblioteca de mídias.
 * Renderiza somente para super_admin (controle feito pelo chamador).
 */
export function RadioOnlineSection() {
  const qc = useQueryClient();
  const listFn = useServerFn(listScreensWithRadio);
  const upsertFn = useServerFn(upsertRadioStream);
  const deleteFn = useServerFn(deleteRadioStream);
  const toggleFn = useServerFn(toggleRadioActive);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ScreenWithRadio | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["midias-radio-screens"],
    queryFn: () => withAuthHeader(() => listFn({ data: undefined as never })),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (r) =>
        r.screen_name.toLowerCase().includes(q) ||
        (r.organization_name ?? "").toLowerCase().includes(q) ||
        (r.radio?.radio_name ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  const toggle = useMutation({
    mutationFn: (vars: { screen_id: string; is_active: boolean }) =>
      withAuthHeader(() => toggleFn({ data: vars })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["midias-radio-screens"] });
      toast.success("Estado atualizado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha"),
  });

  const remove = useMutation({
    mutationFn: (screen_id: string) => withAuthHeader(() => deleteFn({ data: { screen_id } })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["midias-radio-screens"] });
      toast.success("Rádio removida");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha"),
  });

  const ativas = data.filter((r) => r.radio?.is_active).length;
  const configuradas = data.filter((r) => r.radio).length;

  return (
    <Panel
      title="Rádio Online (Super Admin)"
      actions={
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5" /> {configuradas} configuradas
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-500">
            <Play className="h-3.5 w-3.5" /> {ativas} tocando
          </span>
        </div>
      }
    >
      <p className="text-xs text-muted-foreground mb-3">
        Stream de áudio em background por tela. Não interrompe vídeos, imagens nem playlists.
      </p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por tela, empresa ou rádio…"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          Nenhuma tela encontrada.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <th className="py-2 px-2">Tela / Empresa</th>
                <th className="py-2 px-2">Rádio</th>
                <th className="py-2 px-2">URL</th>
                <th className="py-2 px-2">Vol</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const r = row.radio;
                return (
                  <tr key={row.screen_id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-2">
                      <div className="font-medium">{row.screen_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.organization_name ?? "—"}
                      </div>
                    </td>
                    <td className="py-2 px-2">{r?.radio_name ?? "—"}</td>
                    <td className="py-2 px-2 max-w-[260px]">
                      <div className="truncate text-xs font-mono text-muted-foreground">
                        {r?.stream_url ?? "—"}
                      </div>
                    </td>
                    <td className="py-2 px-2">{r ? `${Math.round(r.volume * 100)}%` : "—"}</td>
                    <td className="py-2 px-2">
                      {!r ? (
                        <span className="text-xs text-muted-foreground">Sem rádio</span>
                      ) : r.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                          Pausado
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex justify-end gap-2">
                        {r && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toggle.mutate({ screen_id: row.screen_id, is_active: !r.is_active })
                            }
                            disabled={toggle.isPending}
                          >
                            {r.is_active ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                        <Button size="sm" onClick={() => setEditing(row)}>
                          {r ? "Editar" : "Configurar"}
                        </Button>
                        {r && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Remover rádio desta tela?"))
                                remove.mutate(row.screen_id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <RadioEditDialog
          row={editing}
          onClose={() => setEditing(null)}
          upsertFn={upsertFn}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["midias-radio-screens"] });
            setEditing(null);
          }}
        />
      )}
    </Panel>
  );
}

function RadioEditDialog({
  row,
  onClose,
  upsertFn,
  onSaved,
}: {
  row: ScreenWithRadio;
  onClose: () => void;
  upsertFn: ReturnType<typeof useServerFn<typeof upsertRadioStream>>;
  onSaved: () => void;
}) {
  const [name, setName] = useState(row.radio?.radio_name ?? "Rádio Ambiente");
  const [url, setUrl] = useState(row.radio?.stream_url ?? "");
  const [volume, setVolume] = useState<number>(row.radio?.volume ?? 0.8);
  const [isActive, setIsActive] = useState<boolean>(row.radio?.is_active ?? true);
  const [testing, setTesting] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      withAuthHeader(() =>
        upsertFn({
          data: {
            screen_id: row.screen_id,
            radio_name: name,
            stream_url: url,
            volume,
            is_active: isActive,
          },
        }),
      ),
    onSuccess: () => {
      toast.success("Rádio salva. As TVs vão receber em segundos.");
      onSaved();
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
        toast.success("Tocando teste no navegador…");
      })
      .catch((e) => toast.error(`Falha: ${e instanceof Error ? e.message : "erro"}`));
  };

  useEffect(
    () => () => {
      const el = (window as unknown as { __radioTest?: HTMLAudioElement }).__radioTest;
      el?.pause();
      (window as unknown as { __radioTest?: HTMLAudioElement }).__radioTest = undefined;
    },
    [],
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Rádio — {row.screen_name}
          </DialogTitle>
          <DialogDescription>
            {row.organization_name ?? "Tela"} · O áudio toca em background sem afetar a playlist
            visual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rname">Nome da rádio</Label>
            <Input
              id="rname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rurl">URL do stream (MP3, AAC, ou .m3u8 / HLS)</Label>
            <Input
              id="rurl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://stream.exemplo.com/radio.mp3"
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Volume — {Math.round(volume * 100)}%</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <div className="text-sm font-medium">Status</div>
              <div className="text-xs text-muted-foreground">
                {isActive ? "Tocando nas TVs" : "Pausado nas TVs"}
              </div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleTest}>
            {testing ? <Pause className="h-4 w-4 mr-1.5" /> : <Play className="h-4 w-4 mr-1.5" />}
            {testing ? "Parar teste" : "Testar"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !url}>
            {save.isPending ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
