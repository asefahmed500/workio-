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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  UserPlus,
  Shield,
  Mail,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { members: number };
}

interface TeamMember {
  id: string;
  role: string;
  user: { id: string; name: string; email: string; image: string | null };
}

const roleColors: Record<string, string> = {
  owner: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  editor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  viewer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function TeamManager() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("viewer");

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data.map((m: any) => m.team));
      }
    } catch {
      toast.error("Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMembers(teamId: string) {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch {
      toast.error("Failed to load members");
    }
  }

  async function handleCreateTeam() {
    if (!formName || !formSlug) {
      toast.error("Name and slug are required");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          slug: formSlug.toLowerCase().replace(/\s+/g, "-"),
          description: formDescription,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create team");
      }

      toast.success("Team created");
      setFormName("");
      setFormSlug("");
      setFormDescription("");
      fetchTeams();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAddMember() {
    if (!selectedTeam || !formEmail) return;

    setIsAddingMember(true);
    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail, role: formRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add member");
      }

      toast.success("Member added");
      setFormEmail("");
      setFormRole("viewer");
      fetchMembers(selectedTeam.id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAddingMember(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!selectedTeam) return;
    if (!confirm("Remove this member from the team?")) return;

    try {
      const res = await fetch(
        `/api/teams/${selectedTeam.id}/members?memberId=${memberId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to remove member");

      toast.success("Member removed");
      fetchMembers(selectedTeam.id);
    } catch {
      toast.error("Failed to remove member");
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
      {/* Teams List */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Teams</h2>
          <p className="text-sm text-muted-foreground">
            Collaborate with your team on workflows
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team</DialogTitle>
              <DialogDescription>
                Create a new team to share workflows and collaborate
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Name</Label>
                <Input
                  id="team-name"
                  placeholder="Engineering"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-slug">Slug</Label>
                <Input
                  id="team-slug"
                  placeholder="engineering"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-desc">Description</Label>
                <Input
                  id="team-desc"
                  placeholder="Team description (optional)"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {}}>Cancel</Button>
              <Button onClick={handleCreateTeam} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">No teams yet</p>
            <p className="text-sm text-muted-foreground">
              Create a team to start collaborating
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedTeam(team);
                fetchMembers(team.id);
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {team._count.members} member{team._count.members !== 1 ? "s" : ""}
                </div>
                <p className="text-xs text-muted-foreground mt-1">/{team.slug}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Members Panel */}
      {selectedTeam && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedTeam.name} — Members</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage team members and their roles
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            {/* Add Member */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Email address"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="max-w-xs"
              />
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddMember} disabled={isAddingMember}>
                {isAddingMember ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-sky-500 text-xs font-bold text-white">
                        {member.user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={roleColors[member.role]}
                    >
                      <Shield className="mr-1 h-3 w-3" />
                      {member.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No members yet. Add someone above.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
