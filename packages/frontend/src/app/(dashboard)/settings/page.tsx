"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-xl md:text-2xl">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize sua experiência no AgroScope
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="language">Idioma</TabsTrigger>
          <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e preferências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Configurações da conta serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Configurações de notificações serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

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
    </div>
  );
}
