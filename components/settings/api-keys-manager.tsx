"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, KeyRound } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  service: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const services = [
  { value: "resend", label: "Resend (Email)" },
  { value: "slack", label: "Slack" },
  { value: "discord", label: "Discord" },
  { value: "openai", label: "OpenAI" },
  { value: "http", label: "HTTP / Custom API" },
  { value: "crm", label: "CRM / Database" },
];

const serviceColors: Record<string, string> = {
  resend: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  slack: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  discord: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  openai: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  http: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  crm: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

export function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formService, setFormService] = useState("");
  const [formKey, setFormKey] = useState("");

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    try {
      const res = await fetch("/api/api-keys");
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data);
      }
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!formName || !formService || !formKey) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          service: formService,
          key: formKey,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("API key added");
      setFormName("");
      setFormService("");
      setFormKey("");
      setIsDialogOpen(false);
      fetchApiKeys();
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/api-keys/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(current ? "API key disabled" : "API key enabled");
      fetchApiKeys();
    } catch {
      toast.error("Failed to update API key");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this API key?")) return;

    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      toast.success("API key deleted");
      fetchApiKeys();
    } catch {
      toast.error("Failed to delete API key");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage credentials for external service integrations
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add API Key</DialogTitle>
              <DialogDescription>
                Store a credential for an external service
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Production Resend Key"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select value={formService} onValueChange={setFormService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">API Key / Token</Label>
                <Input
                  id="key"
                  type="password"
                  placeholder="sk-..."
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <KeyRound className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">No API keys configured</p>
            <p className="text-sm text-muted-foreground">
              Add credentials to connect external services to your workflows
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-sky-500/10 p-2">
                    <KeyRound className="h-4 w-4 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={serviceColors[key.service] || "bg-gray-100 text-gray-700"}
                      >
                        {services.find((s) => s.value === key.service)?.label || key.service}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Added {formatDistanceToNow(new Date(key.createdAt))} ago
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(key.id, key.isActive)}
                    title={key.isActive ? "Disable" : "Enable"}
                  >
                    {key.isActive ? (
                      <ToggleRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(key.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
