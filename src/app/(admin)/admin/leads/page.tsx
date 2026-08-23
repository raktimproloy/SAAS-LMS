"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  type: string;
  status: string;
  created_at: string;
  course: { title: string } | null;
}

export default function LeadsAdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin/leads");
      if (res.ok) {
        setLeads(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6" data-aos="fade-up">
      <div className="flex justify-between items-center" data-aos="fade-down">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads & Inquiries</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">Manage form submissions from contact forms and marketing pages.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-x-auto" data-aos="fade-up" data-aos-delay="100">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Contact Info</TableHead>
              <TableHead>Course / Interest</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16 rounded" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[130px] rounded-md" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{lead.name}</span>
                      <span className="text-sm text-muted-foreground">{lead.phone}</span>
                      {lead.email && <span className="text-xs text-muted-foreground">{lead.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{lead.course ? lead.course.title : "General Inquiry"}</span>
                      <span className="text-xs bg-primary/10 text-primary w-fit px-1.5 py-0.5 rounded mt-1">
                        {lead.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-[200px] truncate" title={lead.message || ""}>
                      {lead.message || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={lead.status} 
                      onValueChange={(val) => val && handleStatusChange(lead.id, val)}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">
                          <div className="flex items-center text-amber-600">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="CONTACTED">
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" /> Contacted
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(lead.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
