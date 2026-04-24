import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui-kit/States";
import { Modal, FormField, TextInput, TextArea, PrimaryButton } from "@/components/ui-kit/FormControls";
import {
  usePlaylists,
  useCreatePlaylist,
  useDeletePlaylist,
  useUpdatePlaylist,
  usePlaylistItems,
  useAddPlaylistItem,
  useAddPlaylistItemsBulk,
  useDeletePlaylistItem,
  useSwapPlaylistItemPositions,
  useReorderPlaylistItems,
  useUpdatePlaylistItem,
  useMedia,
} from "@/lib/hooks/use-supabase-data";
import { toast } from "sonner";
import type { Playlist, PlaylistFitMode } from "@/lib/db-types";
import { Plus, ListVideo, Eye, Trash2, ChevronUp, ChevronDown, Pencil, GripVertical } from "lucide-react";

export const Route = createFileRoute("/app/playlists")({
  head: () => ({ meta: [{ title: "Playlists — Signix" }] }),
  component: PlaylistsPage,
});

type PlaylistRow = Playlist & { playlist_items?: { count: number }[] };

function itemCount(p: PlaylistRow): number {
  const agg = p.playlist_items?.[0]?.count;
  return typeof agg === "number" ? agg : 0;
}

function PlaylistsPage() {
  const { data: playlists = [], isLoading, error } = usePlaylists();
  const create = useCreatePlaylist();
  const remove = useDeletePlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [mediaToAdd, setMediaToAdd] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editMeta, setEditMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({ name: "", description: "", status: "draft" as string });

  const current = useMemo(
    () => playlists.find((p) => p.id === (selected ?? playlists[0]?.id)) as PlaylistRow | undefined,
    [playlists, selected],
  );

  const { data: items = [], isLoading: itemsLoading } = usePlaylistItems(current?.id ?? null);
  const { data: media = [] } = useMedia();
  const addItem = useAddPlaylistItem();
  const addBulk = useAddPlaylistItemsBulk();
  const deleteItem = useDeletePlaylistItem();
  const swapPositions = useSwapPlaylistItemPositions();
  const reorderPlaylist = useReorderPlaylistItems();
  const updateItem = useUpdatePlaylistItem();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!selected && playlists[0]?.id) setSelected(playlists[0].id);
  }, [playlists, selected]);

  useEffect(() => {
    if (!current) return;
    setMetaForm({
      name: current.name,
      description: current.description ?? "",
      status: current.status,
    });
  }, [current?.id, current?.name, current?.description, current?.status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ name: form.name, description: form.description, status: "draft" });
    setOpen(false);
    setForm({ name: "", description: "" });
  };

  const mediaOptions = useMemo(() => media.filter((m) => m.status === "active"), [media]);

  const handleAddItem = async () => {
    if (!current?.id || mediaToAdd.length === 0 || isAdding) return;
    const n = mediaToAdd.length;
    setIsAdding(true);
    let timeoutRef: ReturnType<typeof setTimeout> | null = null;
    try {
      const op =
        n === 1
          ? addItem.mutateAsync({ playlistId: current.id, mediaAssetId: mediaToAdd[0]! })
          : addBulk.mutateAsync({ playlistId: current.id, mediaAssetIds: mediaToAdd });

      await Promise.race([
        op,
        new Promise<never>((_, reject) => {
          timeoutRef = setTimeout(
            () => reject(new Error("Tempo excedido ao adicionar mídias. Tente novamente.")),
            12000,
          );
        }),
      ]);
      setMediaToAdd([]);
      toast.success(n === 1 ? "Mídia adicionada." : `${n} mídias adicionadas.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao adicionar mídias.");
    } finally {
      if (timeoutRef) clearTimeout(timeoutRef);
      setIsAdding(false);
    }
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    if (!current?.id) return;
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const a = items[index];
    const b = items[next];
    try {
      await swapPositions.mutateAsync({
        playlistId: current.id,
        itemIdA: a.id,
        itemIdB: b.id,
        posA: a.position,
        posB: b.position,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao reordenar.");
    }
  };

  const fitModes: PlaylistFitMode[] = ["contain", "cover", "stretch", "center", "fit-width", "fit-height"];

  const handleDropOnItem = useCallback(
    async (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      const sourceId = e.dataTransfer.getData("application/x-signix-playlist-item");
      if (!current?.id || !sourceId) return;
      const fromIndex = items.findIndex((i) => i.id === sourceId);
      if (fromIndex < 0 || fromIndex === targetIndex) return;
      const ids = items.map((i) => i.id);
      const [moved] = ids.splice(fromIndex, 1);
      ids.splice(targetIndex, 0, moved);
      try {
        await reorderPlaylist.mutateAsync({ playlistId: current.id, orderedItemIds: ids });
        toast.success("Ordem atualizada.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao reordenar.");
      }
    },
    [current?.id, items, reorderPlaylist],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Playlists"
        subtitle="Sequências de mídias: arraste pela pegada à esquerda de cada linha para reordenar, ou use as setas."
        actions={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Nova playlist
          </PrimaryButton>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : playlists.length === 0 ? (
        <Panel>
          <EmptyState
            icon={ListVideo}
            title="Nenhuma playlist criada"
            description="Crie playlists e adicione mídias da biblioteca para as campanhas reproduzirem na ordem correta."
            action={
              <PrimaryButton onClick={() => setOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Nova playlist
              </PrimaryButton>
            }
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {playlists.map((p) => {
              const row = p as PlaylistRow;
              const active = current?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className={`w-full text-left rounded-lg border ${
                    active ? "border-primary/50 bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/30"
                  } p-4 transition-smooth`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center">
                        <ListVideo className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {itemCount(row)} itens · {p.status}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      tone={p.status === "active" ? "success" : "neutral"}
                      label={p.status}
                      withDot={false}
                    />
                  </div>
                  {p.description && (
                    <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {current && (
              <Panel
                title={current.name}
                description={current.description ?? "Sem descrição"}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => setEditMeta(true)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs hover:bg-accent"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <Link
                      to="/app/preview"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs hover:bg-accent"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Link>
                    <button
                      type="button"
                      onClick={() => confirm("Excluir playlist?") && remove.mutate(current.id)}
                      className="inline-flex items-center gap-1 rounded-md text-destructive hover:bg-destructive/10 px-2.5 py-1.5 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </button>
                  </>
                }
              >
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground">Adicionar mídias (Ctrl+clique para várias)</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        multiple
                        size={Math.min(8, Math.max(4, mediaOptions.length))}
                        value={mediaToAdd}
                        onChange={(e) =>
                          setMediaToAdd(Array.from(e.target.selectedOptions, (o) => o.value).filter(Boolean))
                        }
                        className="flex-1 rounded-md border border-input bg-surface px-2 py-1.5 text-xs min-h-[120px]"
                      >
                        {mediaOptions.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.file_type})
                          </option>
                        ))}
                      </select>
                      <PrimaryButton
                        type="button"
                        disabled={mediaToAdd.length === 0 || isAdding}
                        onClick={() => void handleAddItem()}
                      >
                        {isAdding ? "A adicionar…" : "Adicionar à sequência"}
                      </PrimaryButton>
                    </div>
                    {mediaOptions.length === 0 && (
                      <p className="text-[11px] text-muted-foreground">Não há mídias ativas na biblioteca.</p>
                    )}
                  </div>

                  {itemsLoading ? (
                    <LoadingState />
                  ) : items.length === 0 ? (
                    <EmptyState
                      icon={ListVideo}
                      title="Playlist sem itens"
                      description="Adicione mídias acima. A ordem define a reprodução na campanha (campo position em playlist_items)."
                    />
                  ) : (
                    <ul
                      className="space-y-2"
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverIndex(null);
                      }}
                    >
                      {items.map((row, index) => {
                        const m = row.media_assets;
                        const itemFit = (row.fit_mode as PlaylistFitMode | undefined) ?? "cover";
                        const isDragging = draggingId === row.id;
                        const isOver = dragOverIndex === index && draggingId && draggingId !== row.id;
                        return (
                          <li
                            key={row.id}
                            onDragOver={(ev) => {
                              ev.preventDefault();
                              ev.dataTransfer.dropEffect = "move";
                              setDragOverIndex(index);
                            }}
                            onDrop={(ev) => void handleDropOnItem(ev, index)}
                            className={`flex flex-col gap-2 rounded-md border bg-card px-3 py-2 text-xs transition-colors ${
                              isOver ? "border-primary ring-1 ring-primary/40" : "border-border"
                            } ${isDragging ? "opacity-50" : ""}`}
                          >
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="Arrastar para reordenar"
                                draggable
                                disabled={reorderPlaylist.isPending}
                                onDragStart={(ev) => {
                                  ev.dataTransfer.setData("application/x-signix-playlist-item", row.id);
                                  ev.dataTransfer.effectAllowed = "move";
                                  setDraggingId(row.id);
                                }}
                                className="h-7 w-7 shrink-0 grid place-items-center rounded border border-dashed border-muted-foreground/40 text-muted-foreground hover:bg-accent cursor-grab active:cursor-grabbing disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <GripVertical className="h-4 w-4" />
                              </button>
                              <span className="font-mono text-muted-foreground w-6 shrink-0">{row.position}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{m?.name ?? "Mídia removida?"}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{m?.file_type ?? "—"}</p>
                              </div>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  title="Subir"
                                  disabled={index === 0 || swapPositions.isPending || reorderPlaylist.isPending}
                                  onClick={() => void handleMove(index, -1)}
                                  className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-accent disabled:opacity-40"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Descer"
                                  disabled={
                                    index === items.length - 1 ||
                                    swapPositions.isPending ||
                                    reorderPlaylist.isPending
                                  }
                                  onClick={() => void handleMove(index, 1)}
                                  className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-accent disabled:opacity-40"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Remover da playlist"
                                  disabled={deleteItem.isPending}
                                  onClick={() => {
                                    if (!confirm("Remover este item da playlist?")) return;
                                    void deleteItem.mutateAsync({ id: row.id, playlistId: current.id });
                                  }}
                                  className="h-7 w-7 grid place-items-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-end gap-2 pl-8">
                              <label className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                                Fit
                                <select
                                  className="rounded border border-input bg-surface px-1 py-0.5 text-[11px] text-foreground"
                                  value={itemFit}
                                  onChange={(e) => {
                                    const v = e.target.value as PlaylistFitMode;
                                    void updateItem.mutateAsync({
                                      id: row.id,
                                      playlistId: current.id,
                                      patch: { fit_mode: v },
                                    });
                                  }}
                                >
                                  {fitModes.map((fm) => (
                                    <option key={fm} value={fm}>
                                      {fm}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                                Duração (s)
                                <input
                                  type="number"
                                  min={1}
                                  className="w-20 rounded border border-input bg-surface px-1 py-0.5 text-[11px]"
                                  placeholder="auto"
                                  defaultValue={row.duration_override_seconds ?? ""}
                                  key={`dur-${row.id}-${row.duration_override_seconds ?? "x"}`}
                                  onBlur={(e) => {
                                    const raw = e.target.value.trim();
                                    const v = raw === "" ? null : Number(raw);
                                    if (v != null && (Number.isNaN(v) || v < 1)) return;
                                    void updateItem.mutateAsync({
                                      id: row.id,
                                      playlistId: current.id,
                                      patch: { duration_override_seconds: v },
                                    });
                                  }}
                                />
                              </label>
                              <label className="flex items-center gap-1 text-[10px] text-muted-foreground pb-1">
                                <input
                                  type="checkbox"
                                  checked={row.is_active !== false}
                                  onChange={(e) =>
                                    void updateItem.mutateAsync({
                                      id: row.id,
                                      playlistId: current.id,
                                      patch: { is_active: e.target.checked },
                                    })
                                  }
                                />
                                Ativo
                              </label>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </Panel>
            )}
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova playlist">
        <form onSubmit={submit} className="space-y-3">
          <FormField label="Nome">
            <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Descrição">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <PrimaryButton type="submit" disabled={create.isPending}>
            {create.isPending ? "Salvando…" : "Criar"}
          </PrimaryButton>
        </form>
      </Modal>

      {current && (
        <Modal open={editMeta} onClose={() => setEditMeta(false)} title="Editar playlist">
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await updatePlaylist.mutateAsync({
                  id: current.id,
                  name: metaForm.name.trim(),
                  description: metaForm.description.trim() || null,
                  status: metaForm.status as Playlist["status"],
                });
                toast.success("Playlist atualizada.");
                setEditMeta(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Erro ao guardar.");
              }
            }}
          >
            <FormField label="Nome">
              <TextInput
                required
                value={metaForm.name}
                onChange={(e) => setMetaForm({ ...metaForm, name: e.target.value })}
              />
            </FormField>
            <FormField label="Descrição">
              <TextArea
                value={metaForm.description}
                onChange={(e) => setMetaForm({ ...metaForm, description: e.target.value })}
              />
            </FormField>
            <FormField label="Estado">
              <select
                className="w-full rounded-md border border-input bg-surface px-2 py-1.5 text-xs"
                value={metaForm.status}
                onChange={(e) => setMetaForm({ ...metaForm, status: e.target.value })}
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="archived">archived</option>
              </select>
            </FormField>
            <PrimaryButton type="submit" disabled={updatePlaylist.isPending}>
              {updatePlaylist.isPending ? "A guardar…" : "Guardar"}
            </PrimaryButton>
          </form>
        </Modal>
      )}
    </div>
  );
}
