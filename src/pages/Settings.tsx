import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import { useSEO } from "@/hooks/useSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  useSEO({
    title: "Settings | CareConnect",
    description: "Customize language, theme, and preferences. No account required.",
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const savedName = localStorage.getItem("settings.displayName");
    if (savedName !== null) setDisplayName(savedName);
    const savedNotif = localStorage.getItem("settings.notifications");
    if (savedNotif !== null) setNotifications(savedNotif === "true");
  }, []);

  const onSave = () => {
    localStorage.setItem("settings.displayName", displayName);
    localStorage.setItem("settings.notifications", String(notifications));
    toast({
      title: "Preferences saved",
      description: "Your settings have been updated.",
    });
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Personalize your profile preferences</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Email notifications</div>
              <div className="text-xs text-muted-foreground">Receive important updates</div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={(val) => setLanguage(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme || "system"} onValueChange={(val) => setTheme(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Separator className="my-2" />
            <Button onClick={onSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Settings;
