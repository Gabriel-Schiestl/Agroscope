"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { KeyRound, Monitor, Moon, Sun } from "lucide-react";
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
  const { auth } = useAuth();
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
              <CardDescription>Dados usados para acessar o AgroScope</CardDescription>
            </CardHeader>
            <CardContent>
              <InfoRow label="Nome" value={auth?.name || "—"} />
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
