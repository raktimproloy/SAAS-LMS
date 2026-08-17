"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Assistant {
  id: number;
  name: string;
  email: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "assistants", label: "Assistants Team" },
  { id: "courses", label: "Courses & Batches" },
  { id: "students", label: "Student Management" },
  { id: "payments", label: "Student Payment" },
  { id: "exams", label: "Exams Management" },
  { id: "materials", label: "Study Materials & Videos" },
  { id: "content", label: "Website Content (Notices/Hero)" },
];

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssistants = async () => {
    try {
      const res = await fetch("/api/admin/assistants");
      if (res.ok) {
        const data = await res.json();
        setAssistants(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  const handleTogglePerm = (permId: string) => {
    setSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setSelectedPerms([]);
    setIsActive(true);
    setFormError("");
  };

  const handleEditClick = (assistant: Assistant) => {
    setEditingId(assistant.id);
    setName(assistant.name);
    setEmail(assistant.email);
    setPassword(""); // Keep blank if not changing
    setSelectedPerms(assistant.permissions || []);
    setIsActive(assistant.is_active);
    setFormError("");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this assistant?")) return;
    try {
      const res = await fetch(`/api/admin/assistants/${id}`, { method: "DELETE" });
      if (res.ok) fetchAssistants();
      else alert("Failed to delete assistant");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const url = editingId ? `/api/admin/assistants/${editingId}` : "/api/admin/assistants";
    const method = editingId ? "PUT" : "POST";
    
    // Require password for new assistant, optional for edit
    if (!editingId && !password) {
      setFormError("Password is required for new assistants.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, permissions: selectedPerms, is_active: isActive }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save assistant");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAssistants();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assistants Team</h1>
          <p className="text-muted-foreground mt-1">Manage your team and their permissions.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Add Assistant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Assistant" : "Add New Assistant"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                  {formError}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password {editingId && "(Leave blank to keep current)"}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingId} />
              </div>
              
              <div className="pt-2">
                <Label className="mb-2 block font-semibold">Permissions</Label>
                <div className="grid grid-cols-2 gap-3 mt-2 border rounded-md p-4 bg-slate-50 dark:bg-slate-900/50">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${perm.id}`}
                        checked={selectedPerms.includes(perm.id)}
                        onCheckedChange={() => handleTogglePerm(perm.id)}
                      />
                      <Label htmlFor={`perm-${perm.id}`} className="text-sm font-normal cursor-pointer">
                        {perm.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {editingId && (
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(c) => setIsActive(c as boolean)}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Active Account</Label>
                </div>
              )}
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingId ? "Update Assistant" : "Create Assistant"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : assistants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No assistants found. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assistants.map((assistant) => (
                    <TableRow key={assistant.id}>
                      <TableCell className="font-medium">{assistant.name}</TableCell>
                      <TableCell>{assistant.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {assistant.permissions?.slice(0, 3).map((p) => (
                            <Badge key={p} variant="secondary" className="text-[10px]">
                              {p.replace("_", " ")}
                            </Badge>
                          ))}
                          {assistant.permissions?.length > 3 && (
                            <Badge variant="secondary" className="text-[10px]">
                              +{assistant.permissions.length - 3} more
                            </Badge>
                          )}
                          {(!assistant.permissions || assistant.permissions.length === 0) && (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={assistant.is_active ? "default" : "destructive"}>
                          {assistant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground">
  <span className="sr-only">Open menu</span>
  <MoreHorizontal className="h-4 w-4" />
</DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(assistant)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(assistant.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
