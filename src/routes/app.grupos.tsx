import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui-kit/States";
import {
  Modal,
  FormField,
  TextInput,
  TextArea,
  PrimaryButton,
} from "@/components/ui-kit/FormControls";
import {
  useScreenGroups,
  useCreateScreenGroup,
  useDeleteScreenGroup,
  usePlaylists,
  useScreenGroupPrimaryPlaylistAssignment,
  useSetScreenGroupPrimaryPlaylist,
} from "@/lib/hooks/use-supabase-data";
import { Plus, Layers, Trash2, ListVideo } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/grupos")({
  head: () => ({ meta: [{ title: "Grupos de telas — Signix" }] }),
  component: GroupsPage,
});

type GroupRow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  screen_group_items?: { count: number }[];
};

function GroupPlaylistModal({ group, onClose }: { group: GroupRow; onClose: () => void }) {
  const playlistsQ = usePlaylists();
  const assignQ = useScreenGroupPrimaryPlaylistAssignment(group.id);
  const setAssign = useSetScreenGroupPrimaryPlaylist();
  const [playlistId, setPlaylistId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPlaylistId(assignQ.data?.playlist_id ?? "");
  }, [assignQ.data?.playlist_id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setAssign.mutateAsync({
        screenGroupId: group.id,
        playlistId: playlistId || null,
      });
      toast.success("Atribuição de playlist guardada.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open title={`Playlist do grupo — ${group.name}`} onClose={onClose}>
      <form onSubmit={(e) => void save(e)} className="space-y-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          As telas deste grupo usam esta playlist quando não existir atribuição directa na tela com
          prioridade superior. Ordem global: <strong>tela directa</strong> → <strong>grupo</strong>{" "}
          → <strong>campanha</strong>.
        </p>
        <FormField label="Playlist">
          <select
            value={playlistId}
            onChange={(e) => setPlaylistId(e.target.value)}
            className="w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Nenhuma (só campanhas / outras regras) —</option>
            {(playlistsQ.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>
        {assignQ.isLoading && (
          <p className="text-[11px] text-muted-foreground">A carregar atribuição…</p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:bg-accent"
          >
            Cancelar
          </button>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "A guardar…" : "Guardar"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function GroupsPage() {
  const { data: groups = [], isLoading, error } = useScreenGroups();
  const create = useCreateScreenGroup();
  const remove = useDeleteScreenGroup();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [playlistModalGroup, setPlaylistModalGroup] = useState<GroupRow | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ name: form.name, description: form.description, status: "active" });
    setOpen(false);
    setForm({ name: "", description: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grupos de telas"
        subtitle="Agrupe telas por finalidade para distribuir campanhas em massa."
        actions={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Novo grupo
          </PrimaryButton>
        }
      />
      <Panel bodyClassName="p-0">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : groups.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Nenhum grupo criado"
            description="Crie grupos para enviar campanhas para múltiplas telas de uma vez."
            action={
              <PrimaryButton onClick={() => setOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Novo grupo
              </PrimaryButton>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 text-left">Grupo</th>
                <th className="px-5 py-3 text-left">Descrição</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Playlist</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className="border-b border-border/50 hover:bg-surface/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-md bg-primary/10 grid place-items-center text-primary">
                        <Layers className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{g.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{g.description ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      tone={g.status === "active" ? "success" : "neutral"}
                      label={g.status}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      title="Definir playlist do grupo"
                      onClick={() => setPlaylistModalGroup(g as GroupRow)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] hover:bg-accent"
                    >
                      <ListVideo className="h-3.5 w-3.5" />
                      Playlist
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => confirm("Excluir grupo?") && remove.mutate(g.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo grupo de telas">
        <form onSubmit={submit} className="space-y-3">
          <FormField label="Nome">
            <TextInput
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label="Descrição">
            <TextArea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>
          <PrimaryButton type="submit" disabled={create.isPending}>
            {create.isPending ? "Salvando…" : "Criar grupo"}
          </PrimaryButton>
        </form>
      </Modal>

      {playlistModalGroup && (
        <GroupPlaylistModal
          group={playlistModalGroup}
          onClose={() => setPlaylistModalGroup(null)}
        />
      )}
    </div>
  );
}
