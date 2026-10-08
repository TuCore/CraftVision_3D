'use client';

import { useOrders, useDeleteOrder } from '@/hooks/useOrders';
import Link from 'next/link';
import { Package, Search, ChevronRight, Calendar, User, DollarSign, Clock, Truck, CheckCircle2, XCircle, Hammer, ChevronLeft, Trash2, Gift } from 'lucide-react';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export const getOrderStatusConfig = (status: string) => {
  switch (status) {
    case 'Pending': return { label: 'Chờ xử lý', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: Clock };
    case 'Processing': return { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package };
    case 'WaitingProduction': return { label: 'Chờ sản xuất', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Clock };
    case 'Producing': return { label: 'Đang sản xuất', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Hammer };
    case 'ReadyToShip': return { label: 'Chờ lấy hàng', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Package };
    case 'Shipped': return { label: 'Đang giao', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: Truck };
    case 'Delivered': return { label: 'Đã giao', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 };
    case 'Cancelled': return { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: XCircle };
    default: return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Package };
  }
};

export const getPaymentStatusConfig = (method: string, status: string) => {
  if (method === 'Cod') return { label: 'COD (Chưa TT)', color: 'bg-slate-100 text-slate-800 border-slate-200' };
  if (status === 'Paid') return { label: 'Đã thanh toán (QR)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  return { label: 'Chưa thanh toán (QR)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useOrders(page, 5);
  const deleteMutation = useDeleteOrder();
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteOrderId) return;
    await deleteMutation.mutateAsync(deleteOrderId, {
      onSuccess: () => {
        toast.success('Đã xóa đơn hàng thành công!');
        setDeleteOrderId(null);
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi xóa đơn hàng.');
        setDeleteOrderId(null);
      }
    });
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Đang tải danh sách đơn hàng...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-2 shadow-sm">
        <Package className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-extrabold font-display">Lỗi tải dữ liệu</h3>
      <p className="text-muted-foreground font-medium">Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-page pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-foreground">Quản lý Đơn hàng</h1>
          <p className="text-muted-foreground mt-2 font-medium">Theo dõi và xử lý các đơn hàng trên hệ thống</p>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden shadow-soft border border-white/40 p-2 md:p-4 bg-white/60">
        
        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {data?.items.map((order) => {
            const statusConfig = getOrderStatusConfig(order.orderStatus);
            const payConfig = getPaymentStatusConfig(order.paymentMethod, order.paymentStatus);
            const StatusIcon = statusConfig.icon;
            return (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1.5 items-start">
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md text-sm">
                      {order.orderCode}
                    </span>
                    {order.items?.some((i: any) => i.gift) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                        <Gift className="w-3 h-3" /> Có thiệp 3D
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${payConfig.color}`}>
                      {payConfig.label}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{order.receiverName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[color:var(--coral)]">
                    <DollarSign className="w-4 h-4" />
                    {order.totalAmount.toLocaleString('vi-VN')} đ
                  </div>
                </div>
                <Link 
                  href={`/admin/orders/${order.id}`} 
                  className="flex items-center justify-center w-full py-2.5 rounded-xl bg-gray-50 border border-border hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
                >
                  Xem chi tiết <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider">Mã Đơn</th>
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider">Ngày đặt</th>
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-5 font-bold text-sm text-muted-foreground uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {data?.items.map((order) => {
                const statusConfig = getOrderStatusConfig(order.orderStatus);
                const payConfig = getPaymentStatusConfig(order.paymentMethod, order.paymentStatus);
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={order.id} className="hover:bg-white/60 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 items-start">
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md text-sm">
                          {order.orderCode}
                        </span>
                        {order.items?.some((i: any) => i.gift) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                            <Gift className="w-3 h-3" /> Có thiệp 3D
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">{order.receiverName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border ${payConfig.color}`}>
                          {payConfig.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 font-extrabold text-[color:var(--coral)]">
                        {order.totalAmount.toLocaleString('vi-VN')} đ
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/orders/${order.id}`} 
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-muted-foreground hover:text-primary group-hover:bg-primary/5"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteOrderId(order.id)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-border shadow-sm hover:shadow-md hover:border-red-500/30 transition-all text-muted-foreground hover:text-red-500 hover:bg-red-50"
                          title="Xóa vĩnh viễn đơn hàng"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {!data?.items?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="w-12 h-12 mb-3 opacity-20" />
                      <p className="font-medium">Chưa có đơn hàng nào trong hệ thống.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-end mt-4 px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.hasPreviousPage}
                className="p-2 rounded-xl border border-border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-medium px-2">
                Trang {data.page} / {data.totalPages}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={!data.hasNextPage}
                className="p-2 rounded-xl border border-border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteOrderId} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
        <AlertDialogContent className="rounded-3xl p-6 sm:p-8 max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold font-display text-center text-gray-800">
              Xóa vĩnh viễn
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-500 font-medium text-base">
              Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3 sm:gap-3 flex-col sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-1/2 rounded-xl py-3 border border-gray-200 font-bold hover:bg-gray-50 m-0">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-1/2 rounded-xl py-3 bg-red-600 hover:bg-red-700 text-white font-bold border-none m-0 flex justify-center items-center gap-2"
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa ngay'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
