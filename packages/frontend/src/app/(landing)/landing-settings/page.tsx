"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PublicSettingsPage() {
  return (
    <div className="max-w-[1400px] mx-auto py-12 px-4 pb-16 md:pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Configurações</h1>
        <p className="text-lg text-muted-foreground">
          Personalize sua experiência no AgroScope
        </p>
      </div>

      <Tabs defaultValue="language">
        <TabsList className="mb-6">
          <TabsTrigger value="language">Idioma</TabsTrigger>
          <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
        </TabsList>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>Idioma</CardTitle>
              <CardDescription>
                Escolha o idioma de sua preferência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lang-pt">Português (Brasil)</Label>
                  <Switch id="lang-pt" checked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lang-en">English</Label>
                  <Switch id="lang-en" checked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lang-es">Español</Label>
                  <Switch id="lang-es" checked={false} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Nota: Mais idiomas serão adicionados em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Acessibilidade</CardTitle>
              <CardDescription>
                Ajuste as configurações de acessibilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast">Alto Contraste</Label>
                  <Switch id="high-contrast" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="text-size">Tamanho do Texto Aumentado</Label>
                  <Switch id="text-size" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-motion">Reduzir Animações</Label>
                  <Switch id="reduce-motion" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">
          Para salvar suas configurações e acessar mais recursos, crie uma conta
          ou faça login.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/signup"
            className="bg-primaryGreen hover:bg-lightGreen text-white px-4 py-2 rounded-md"
          >
            Criar Conta Grátis
          </a>
          <a
            href="/login"
            className="border border-primaryGreen text-primaryGreen hover:bg-primaryGreen/10 px-4 py-2 rounded-md"
          >
            Entrar na Plataforma
          </a>
        </div>
      </div>
    </div>
  );
}
