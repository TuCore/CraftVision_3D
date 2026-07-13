'use client';

import { useOrders } from '@/hooks/useOrders';
import Link from 'next/link';
import { Package, Search, ChevronRight, Calendar, User, DollarSign } from 'lucide-react';

export default function AdminOrdersPage() {
  const { data, isLoading, error } = useOrders(1, 50);

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

      <div className="glass-card rounded-[2rem] overflow-hidden shadow-soft border border-white/40 p-4">
        <div className="overflow-x-auto custom-scrollbar">
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
              {data?.items.map((order) => (
                <tr key={order.id} className="hover:bg-white/40 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md text-sm">
                      {order.orderCode}
                    </span>
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
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      order.orderStatus === 'ReadyToShip' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      order.orderStatus === 'Cancelled' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 font-extrabold text-foreground">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      {order.totalAmount.toLocaleString('vi-VN')} đ
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link 
                      href={`/admin/orders/${order.id}`} 
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-muted-foreground hover:text-primary group-hover:bg-primary/5"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
              
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
      </div>
    </div>
  );
}
