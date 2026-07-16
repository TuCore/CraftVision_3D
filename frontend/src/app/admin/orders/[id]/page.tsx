'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrderDetails, useUpdateOrderStatus, Order } from '@/hooks/useOrders';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, RefreshCw, User, Package, Calendar, DollarSign, Gift, ChevronDown, CheckCircle2, Clock, Truck, XCircle, Hammer } from 'lucide-react';
import { toast } from 'sonner';

const getOrderStatusConfig = (status: string) => {
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

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: order, isLoading, error } = useOrderDetails(id as string);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Đang tải chi tiết đơn hàng...</p>
    </div>
  );

  if (error || !order) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-2 shadow-sm">
        <Package className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-extrabold font-display">Không tìm thấy đơn hàng</h3>
      <p className="text-muted-foreground font-medium">Có lỗi xảy ra hoặc đơn hàng không tồn tại trong hệ thống.</p>
      <Link href="/admin/orders" className="btn-hero px-6 py-2.5 rounded-xl font-bold mt-4 shadow-sm">
        Quay lại danh sách
      </Link>
    </div>
  );

  const handleUpdateStatus = () => {
    const statusToUpdate = selectedStatus || order.orderStatus;
    if (!statusToUpdate || statusToUpdate === order.orderStatus) return;
    
    updateStatus(
      { id: order.id, status: statusToUpdate },
      {
        onSuccess: () => {
          toast.success('Cập nhật trạng thái thành công!');
        },
        onError: () => {
          toast.error('Lỗi khi cập nhật trạng thái.');
        }
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-page pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="p-3 bg-white border border-border rounded-full hover:bg-gray-50 shadow-sm transition-all group">
          <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold font-display text-foreground">Chi tiết đơn hàng</h1>
          <p className="text-primary font-mono font-semibold mt-1 bg-primary/10 px-3 py-0.5 rounded-md inline-block">{order.orderCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info Card */}
        <div className="glass-card p-6 md:p-8 rounded-3xl shadow-soft space-y-6">
          <h2 className="text-xl font-bold font-display flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" /> Thông tin khách hàng
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Người nhận
              </p>
              <p className="font-extrabold text-foreground text-lg truncate" title={order.receiverName}>{order.receiverName}</p>
            </div>
            
            <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Ngày đặt
              </p>
              <p className="font-semibold text-foreground">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            
            <div className="bg-white/60 p-4 rounded-2xl border border-white shadow-sm sm:col-span-2 flex flex-col justify-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Tổng tiền
              </p>
              <p className="font-extrabold text-2xl text-primary">{order.totalAmount.toLocaleString('vi-VN')} đ</p>
            </div>
          </div>
        </div>

        {/* Status Update Card */}
        <div className="glass-card p-6 md:p-8 rounded-3xl shadow-soft flex flex-col gap-6">
          <h2 className="text-xl font-bold font-display flex items-center gap-2 text-foreground flex-none">
            <RefreshCw className="w-5 h-5 text-primary" /> Cập nhật trạng thái
          </h2>
          
            <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm flex-1 flex flex-col gap-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-border shadow-sm flex-none">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Trạng thái hiện tại</p>
                {(() => {
                  const currentStatus = getOrderStatusConfig(order.orderStatus);
                  const StatusIcon = currentStatus.icon;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-extrabold border ${currentStatus.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {currentStatus.label}
                    </span>
                  );
                })()}
              </div>
              
              <div className="flex flex-col gap-3 mt-auto">
                <div className="relative">
                  <select 
                    className="w-full bg-white border border-border rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm cursor-pointer appearance-none"
                    value={selectedStatus || order.orderStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="Pending">Chờ xử lý</option>
                    <option value="Processing">Đang xử lý</option>
                    <option value="WaitingProduction">Chờ sản xuất</option>
                    <option value="Producing">Đang sản xuất</option>
                    <option value="ReadyToShip">Chờ lấy hàng</option>
                    <option value="Shipped">Đang giao</option>
                    <option value="Delivered">Đã giao</option>
                    <option value="Cancelled">Đã hủy</option>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
                <button 
                  onClick={handleUpdateStatus}
                  disabled={isPending || ((selectedStatus || order.orderStatus) === order.orderStatus)}
                  className="btn-hero text-white w-full py-3.5 rounded-xl font-bold shadow-coral-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Lưu Thay Đổi'}
                </button>
              </div>
            </div>
        </div>
      </div>

      {/* Products List Section */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold font-display flex items-center gap-2 text-foreground">
            <Package className="w-6 h-6 text-primary" /> Sản phẩm trong đơn
          </h2>
          <span className="px-4 py-1.5 bg-muted rounded-full text-sm font-bold text-muted-foreground border border-border shadow-sm">
            {order.items?.length || 0} sản phẩm
          </span>
        </div>

        <div className="space-y-5">
          {order.items?.map((item: any) => (
            <div key={item.id} className="glass-card p-6 md:p-8 rounded-[2rem] shadow-soft hover:shadow-lg transition-shadow border border-white/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-extrabold text-xl text-foreground mb-2 flex items-center gap-3">
                    {item.productName} 
                    <span className="text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-lg text-sm border border-primary/20">x{item.quantity}</span>
                  </h3>
                  <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                    <span className="bg-muted px-3 py-1 rounded-full border border-border">Loại: <strong className="text-foreground">{item.productType}</strong></span>
                    <span>Đơn giá: <strong className="text-foreground">{item.unitPrice.toLocaleString('vi-VN')} đ</strong></span>
                  </div>
                </div>
                <div className="bg-primary/5 px-6 py-4 rounded-2xl border border-primary/10">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Thành tiền</p>
                  <p className="font-extrabold text-2xl text-primary">{item.subTotal.toLocaleString('vi-VN')} đ</p>
                </div>
              </div>
              
              {item.gift && (
                <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100/60 rounded-3xl space-y-5 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none transform rotate-12">
                    <Gift className="w-48 h-48" />
                  </div>
                  
                  <h4 className="font-extrabold text-indigo-900 flex items-center gap-2 text-lg">
                    <ExternalLink className="w-5 h-5 text-indigo-500" /> Dữ liệu NFC & Quà tặng
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                      <span className="block text-xs font-extrabold text-indigo-400 uppercase tracking-wider mb-1.5">Tiêu đề quà</span>
                      <span className="font-bold text-indigo-950 text-base">{item.gift.giftTitle || 'N/A'}</span>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                      <span className="block text-xs font-extrabold text-indigo-400 uppercase tracking-wider mb-1.5">NFC Tag Code</span>
                      <span className="font-bold text-indigo-950 text-base font-mono">{item.gift.nfcTagCode || 'Chưa gán'}</span>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                      <span className="block text-xs font-extrabold text-indigo-400 uppercase tracking-wider mb-1.5">Trạng thái NFC</span>
                      <span className="font-bold text-indigo-950 text-base">{item.gift.status || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* HIỂN THỊ SECRET LINK ĐỂ GHI VÀO NFC */}
                  {item.gift.secretKey && order.orderStatus === 'ReadyToShip' && (
                    <div className="mt-4 p-6 bg-white border border-emerald-200/60 rounded-2xl shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-500"></div>
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <p className="text-emerald-800 font-extrabold tracking-tight">SECRET URL (Dùng để ghi vào thẻ NFC)</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="text" 
                          readOnly 
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/gift/scan/${item.gift.secretKey}`}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/gift/scan/${item.gift.secretKey}`);
                            toast.success("Đã copy Secret URL!");
                          }}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex-shrink-0"
                        >
                          Copy URL
                        </button>
                      </div>
                      <p className="text-sm text-emerald-700/80 mt-4 font-medium leading-relaxed bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        Vui lòng copy đường link trên, mở app <strong>NFC Tools</strong> và ghi (Write URL) vào thẻ vật lý tương ứng. Sau khi ghi xong thành công, hãy đổi trạng thái đơn hàng thành <strong>Shipped</strong>.
                      </p>
                    </div>
                  )}
                  
                  {item.gift.secretKey && order.orderStatus !== 'ReadyToShip' && (
                    <div className="mt-4 flex items-start gap-3 p-4 bg-white/50 rounded-2xl border border-white/80 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-indigo-900/70 font-medium leading-relaxed">
                        Secret URL sẽ hiển thị khi đơn hàng được chuyển sang trạng thái <strong className="text-indigo-950 bg-indigo-100 px-2 py-0.5 rounded-md">ReadyToShip</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
