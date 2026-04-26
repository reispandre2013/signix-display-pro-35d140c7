import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/ui-kit/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdminMaster, listOrganizationsForAdmin } from "@/lib/server/saas-admin.functions";
import { withAuthHeader } from "@/lib/server/with-auth-header";

export function CreateAdminMasterPanel() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState<string>("");

  const orgsQuery = useQuery({
    queryKey: ["admin-saas", "orgs-for-admin"],
    queryFn: () => withAuthHeader(() => listOrganizationsForAdmin()),
  });

  const createMutation = useMutation({
    mutationFn: (input: {
      email: string;
      password: string;
      name: string;
      organization_id: string;
    }) => withAuthHeader(() => createAdminMaster({ data: input })),
    onSuccess: (res) => {
      toast.success(`Admin master criado (user_id: ${res.user_id.slice(0, 8)}…)`);
      setEmail("");
      setPassword("");
      setName("");
      setOrgId("");
      qc.invalidateQueries({ queryKey: ["saas"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Falha ao criar admin master.");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) {
      toast.error("Selecione uma organização.");
      return;
    }
    createMutation.mutate({ email, password, name, organization_id: orgId });
  };

  const orgs = orgsQuery.data?.organizations ?? [];

  return (
    <Panel
      title="Criar usuário Admin Master"
      description="Cria um usuário com acesso /app (telas, playlists, campanhas) vinculado a uma organização existente."
    >
      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="adm-name">Nome completo</Label>
          <Input
            id="adm-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Admin"
            required
            minLength={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="adm-email">Email</Label>
          <Input
            id="adm-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@empresa.com"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="adm-password">Senha (min. 8)</Label>
          <Input
            id="adm-password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="senha forte"
            required
            minLength={8}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Organização</Label>
          <Select value={orgId} onValueChange={setOrgId}>
            <SelectTrigger>
              <SelectValue
                placeholder={orgsQuery.isLoading ? "Carregando organizações…" : "Selecione…"}
              />
            </SelectTrigger>
            <SelectContent>
              {orgs.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name} <span className="text-muted-foreground">({o.slug})</span>
                </SelectItem>
              ))}
              {orgs.length === 0 && !orgsQuery.isLoading && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Nenhuma organização cadastrada.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-2 flex items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-muted-foreground">
            Se o email já existir no auth, a senha será atualizada e o usuário será promovido a
            admin_master nessa organização.
          </p>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Criar Admin Master
          </Button>
        </div>
      </form>
    </Panel>
  );
}
