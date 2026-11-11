"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { KeyRound, Monitor, Moon, Sun, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import UpdateProfileAPI from "@/api/user/UpdateProfile";
import DeleteAccountAPI from "@/api/user/DeleteAccount";
import { formatPersonName, NAME_MAX_LENGTH } from "@/lib/user-profile";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { useAuth } from "../../../contexts/auth-context";
import { useLimit } from "../../../hooks/use-limit";
import {
  hasPlanFeature,
  PLAN_FEATURE_REPORT_GENERATION,
} from "../../../lib/plan-features";
import { cn } from "../../../lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium break-all">{value}</span>
    </div>
  );
}

function UsageBar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={used >= total ? "text-red-500" : "text-muted-foreground"}>
          {used}/{total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full", used >= total ? "bg-red-500" : "bg-primaryGreen")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { auth, refreshAuth, logout } = useAuth();
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (auth?.name) setName(auth.name);
  }, [auth?.name]);

  const nameChanged =
    formatPersonName(name) !== (auth?.name ?? "") && formatPersonName(name).length >= 2;

  const handleSaveName = async () => {
    setSavingName(true);
    const result = await UpdateProfileAPI(formatPersonName(name));
    setSavingName(false);

    if (!result.success) {
      toast.error(result.message || "Não foi possível salvar o nome.");
      return;
    }
    toast.success("Nome atualizado.");
    await refreshAuth();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const ok = await DeleteAccountAPI();
    setDeleting(false);

    if (!ok) {
      toast.error("Não foi possível excluir a conta. Tente novamente.");
      return;
    }
    setDeleteOpen(false);
    toast.success("Sua conta e seus dados foram excluídos.");
    logout();
  };
  const { limit } = useLimit();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const canGenerateReport = hasPlanFeature(
    limit?.featureFlags,
    PLAN_FEATURE_REPORT_GENERATION
  );

  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-xl md:text-2xl">Configurações</h1>
        <p className="text-muted-foreground">
          Seus dados de acesso, o uso do plano e a aparência do AgroScope
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="plan">Plano</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Minha Conta</CardTitle>
              <CardDescription>Seus dados pessoais e de acesso ao AgroScope</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Nome completo</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="settings-name"
                    value={name}
                    maxLength={NAME_MAX_LENGTH}
                    autoCapitalize="words"
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setName(formatPersonName(name))}
                  />
                  <Button
                    onClick={handleSaveName}
                    disabled={!nameChanged || savingName}
                    className="bg-primaryGreen hover:bg-lightGreen"
                  >
                    {savingName ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
              <InfoRow label="E-mail" value={auth?.email || "—"} />
            </CardContent>
            <CardFooter>
              <Link href="/forgot-password">
                <Button variant="outline" className="gap-2">
                  <KeyRound size={16} />
                  Alterar senha
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="mt-6 border-red-500/40">
            <CardHeader>
              <CardTitle className="text-red-600">Excluir conta</CardTitle>
              <CardDescription>
                Remove sua conta, o histórico de análises (com as imagens) e as
                conversas com a Íris. Essa ação não pode ser desfeita.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => {
                  setDeleteConfirm("");
                  setDeleteOpen(true);
                }}
              >
                <Trash2 size={16} />
                Excluir minha conta
              </Button>
            </CardFooter>
          </Card>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Excluir conta definitivamente?</DialogTitle>
                <DialogDescription>
                  Todos os seus dados serão apagados. Para confirmar, digite{" "}
                  <span className="font-semibold">EXCLUIR</span> abaixo.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="EXCLUIR"
                aria-label="Digite EXCLUIR para confirmar"
              />
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirm.trim().toUpperCase() !== "EXCLUIR" || deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? "Excluindo..." : "Excluir conta"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle>Uso do Plano</CardTitle>
              <CardDescription>
                Os limites são renovados no dia 1º de cada mês
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {limit ? (
                <>
                  <UsageBar
                    label="Análises de imagem"
                    used={limit.imageRequests}
                    total={limit.imageLimit}
                  />
                  <UsageBar
                    label="Mensagens à Íris"
                    used={limit.chatRequests}
                    total={limit.chatLimit}
                  />
                  <p className="text-sm text-muted-foreground">
                    Relatório em PDF:{" "}
                    <span className={canGenerateReport ? "text-primaryGreen font-medium" : ""}>
                      {canGenerateReport ? "disponível" : "disponível nos planos pagos"}
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Carregando uso do plano...</p>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/plans">
                <Button className="bg-primaryGreen hover:bg-lightGreen">Ver Planos</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Escolha o tema da interface</CardDescription>
            </CardHeader>
            <CardContent>
              <Label className="sr-only">Tema</Label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const active = mounted && theme === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      aria-pressed={active}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                        active
                          ? "border-primaryGreen bg-primaryGreen/10 text-primaryGreen font-medium"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      <Icon size={20} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
