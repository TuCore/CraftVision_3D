"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Search, Eye, Filter, RefreshCcw, Link as LinkIcon, Power, PowerOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NfcTag = {
  id: string;
  tagCode: string;
  status: string;
  linkedUrl: string | null;
  scanCount: number;
  lastScanAt: string | null;
  createdAt: string;
  gift?: {
    id: string;
    orderItem?: {
      order?: {
        orderCode: string;
        receiverName: string;
      }
    }
  };
};

type DashboardStats = {
  total: number;
  activated: number;
  unused: number;
  disabled: number;
  todayScans: number;
};

export default function NfcManagementPage() {
  const [tags, setTags] = useState<NfcTag[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    activated: 0,
    unused: 0,
    disabled: 0,
    todayScans: 0,
  });
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      
      const res = await api.get("/api/nfc-tags/admin");
      const data: NfcTag[] = res.data;
      
      setTags(data);
      
      setStats({
        total: data.length,
        activated: data.filter(t => t.status === "Active").length,
        unused: data.filter(t => t.status === "Available").length,
        disabled: data.filter(t => t.status === "Disabled").length,
        todayScans: data.reduce((acc, t) => {
          if (!t.lastScanAt) return acc;
          const isToday = new Date(t.lastScanAt).toDateString() === new Date().toDateString();
          return acc + (isToday ? 1 : 0);
        }, 0)
      });

    } catch (error) {
      toast.error("Không thể tải danh sách NFC.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSimulateScan = async (tagCode: string) => {
    try {
      await api.post(`/api/nfc-tags/${tagCode}/simulate`);
      toast.success(`Đã mô phỏng quét thẻ ${tagCode} thành công!`);
      
      setTags(prev => prev.map(t => {
        if (t.tagCode === tagCode) {
          const updated = { ...t, scanCount: t.scanCount + 1, lastScanAt: new Date().toISOString() };
          if (selectedTag?.tagCode === tagCode) setSelectedTag(updated);
          return updated;
        }
        return t;
      }));
      
      setStats(prev => ({...prev, todayScans: prev.todayScans + 1}));
      
    } catch (error) {
      toast.error("Mô phỏng thất bại.");
    }
  };

  const handleUpdateStatus = async (tagCode: string, newStatus: string) => {
    try {
      await api.patch(`/api/nfc-tags/${tagCode}/status-by-code`, { status: newStatus });
      toast.success(`Đã chuyển thẻ ${tagCode} sang trạng thái ${newStatus}`);
      
      setTags(prev => prev.map(t => {
        if (t.tagCode === tagCode) {
          const updated = { ...t, status: newStatus };
          if (selectedTag?.tagCode === tagCode) setSelectedTag(updated);
          return updated;
        }
        return t;
      }));
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại.");
    }
  };

  const handleResetScan = async (tagCode: string) => {
    try {
      await api.post(`/api/nfc-tags/${tagCode}/reset-scan`);
      toast.success(`Đã reset bộ đếm thẻ ${tagCode}`);
      
      setTags(prev => prev.map(t => {
        if (t.tagCode === tagCode) {
          const updated = { ...t, scanCount: 0 };
          if (selectedTag?.tagCode === tagCode) setSelectedTag(updated);
          return updated;
        }
        return t;
      }));
    } catch (error) {
      toast.error("Reset thất bại.");
    }
  };

  const filteredTags = tags.filter(t => {
    const matchSearch = t.tagCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> Active</span>;
      case "Available": return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 w-max">Available</span>;
      case "Disabled": return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> Disabled</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 w-max">{status}</span>;
    }
  };

  return (
    <AppShell active="profile">
      <div className="mx-auto max-w-6xl py-8 px-4 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-display gradient-text">NFC Management</h1>
            <p className="text-muted-foreground mt-1 text-sm">Quản lý và kiểm thử thẻ NFC hệ thống.</p>
          </div>
          <button onClick={fetchTags} className="btn-hero px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Làm mới
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total NFC", value: stats.total, color: "text-blue-600" },
            { label: "Activated", value: stats.activated, color: "text-green-600" },
            { label: "Unused", value: stats.unused, color: "text-gray-600" },
            { label: "Disabled", value: stats.disabled, color: "text-red-600" },
            { label: "Today's Scan", value: stats.todayScans, color: "text-[color:var(--coral)]" }
          ].map((stat, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 flex flex-col justify-center shadow-soft">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</span>
              <span className={`text-3xl font-extrabold font-display ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-soft">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Tìm theo UID (VD: NFC000001)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[color:var(--coral)]/50 outline-none"
            />
          </div>
          <div className="relative w-full md:w-48 shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm appearance-none focus:border-[color:var(--coral)]/50 outline-none font-medium"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Active">Active</option>
              <option value="Available">Available</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-soft border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">UID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Scan</th>
                  <th className="px-6 py-4">Last Scan</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[color:var(--coral)] mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredTags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground font-medium">
                      Không tìm thấy thẻ NFC nào.
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">{tag.tagCode}</td>
                      <td className="px-6 py-4">{getStatusBadge(tag.status)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-[color:var(--coral)]/10 text-[color:var(--coral)] font-bold px-2.5 py-1 rounded-lg">{tag.scanCount}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(tag.lastScanAt)}</td>
                      <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                        <button 
                          onClick={() => handleSimulateScan(tag.tagCode)}
                          className="px-3 py-1.5 bg-[color:var(--coral)]/10 text-[color:var(--coral)] hover:bg-[color:var(--coral)]/20 rounded-lg font-semibold transition-colors flex items-center gap-1.5"
                          title="Simulate Scan"
                        >
                          📱 Scan
                        </button>
                        <button 
                          onClick={() => { setSelectedTag(tag); setIsViewModalOpen(true); }}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4"/> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-6 border border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-display text-foreground border-b border-border pb-4 mb-2">
              Chi tiết NFC
            </DialogTitle>
          </DialogHeader>
          
          {selectedTag && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-muted-foreground font-medium">UID</div>
                <div className="font-bold text-foreground text-right">{selectedTag.tagCode}</div>
                
                <div className="text-muted-foreground font-medium">Status</div>
                <div className="flex justify-end">{getStatusBadge(selectedTag.status)}</div>
                
                <div className="text-muted-foreground font-medium">Linked URL</div>
                <div className="font-medium text-[color:var(--coral)] text-right truncate">
                  {selectedTag.linkedUrl ? (
                    <a href={selectedTag.linkedUrl} target="_blank" rel="noreferrer" className="hover:underline">
                      {selectedTag.linkedUrl}
                    </a>
                  ) : "Chưa có"}
                </div>
                
                <div className="text-muted-foreground font-medium">Created At</div>
                <div className="font-medium text-foreground text-right">{formatDate(selectedTag.createdAt)}</div>
                
                <div className="text-muted-foreground font-medium">Last Scan</div>
                <div className="font-medium text-foreground text-right">{formatDate(selectedTag.lastScanAt)}</div>
                
                <div className="text-muted-foreground font-medium">Total Scans</div>
                <div className="font-bold text-foreground text-right text-lg text-[color:var(--coral)]">{selectedTag.scanCount}</div>
                
                <div className="col-span-2 border-t border-border my-2"></div>
                
                {selectedTag.gift?.orderItem?.order ? (
                  <>
                    <div className="text-muted-foreground font-medium">Linked Order</div>
                    <div className="font-bold text-foreground text-right">#{selectedTag.gift.orderItem.order.orderCode}</div>
                    
                    <div className="text-muted-foreground font-medium">Receiver</div>
                    <div className="font-medium text-foreground text-right">{selectedTag.gift.orderItem.order.receiverName}</div>
                  </>
                ) : (
                  <div className="col-span-2 text-center text-muted-foreground italic py-2">
                    Thẻ chưa được liên kết với đơn hàng nào.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <button 
                  onClick={() => {
                    if (selectedTag.linkedUrl) {
                      navigator.clipboard.writeText(selectedTag.linkedUrl);
                      toast.success("Đã copy Link!");
                    } else {
                      toast.error("Không có link để copy.");
                    }
                  }}
                  className="py-2.5 rounded-xl border border-border hover:bg-gray-50 text-sm font-semibold flex justify-center items-center gap-2 transition-colors"
                >
                  <LinkIcon className="w-4 h-4"/> Copy Link
                </button>
                
                <button 
                  onClick={() => handleResetScan(selectedTag.tagCode)}
                  className="py-2.5 rounded-xl border border-border hover:bg-gray-50 text-sm font-semibold flex justify-center items-center gap-2 transition-colors text-amber-600"
                >
                  <RefreshCcw className="w-4 h-4"/> Reset Scan Count
                </button>

                {selectedTag.status === "Active" ? (
                  <button 
                    onClick={() => handleUpdateStatus(selectedTag.tagCode, "Disabled")}
                    className="py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold flex justify-center items-center gap-2 transition-colors col-span-2"
                  >
                    <PowerOff className="w-4 h-4"/> Disable NFC
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus(selectedTag.tagCode, "Active")}
                    className="py-2.5 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 text-green-600 text-sm font-semibold flex justify-center items-center gap-2 transition-colors col-span-2"
                  >
                    <Power className="w-4 h-4"/> Enable NFC
                  </button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
