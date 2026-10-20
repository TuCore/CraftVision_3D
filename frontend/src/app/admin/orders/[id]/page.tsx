'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrderDetails, useUpdateOrderStatus, useDeleteOrder, useUpdatePaymentStatus, Order } from '@/hooks/useOrders';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, RefreshCw, User, Package, Calendar, DollarSign, Gift, ChevronDown, CheckCircle2, Clock, Truck, XCircle, Hammer, Trash2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

const getPaymentStatusConfig = (status: string) => {
  switch (status) {
    case 'Unpaid': return { label: 'Chưa thanh toán', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: Clock };
    case 'Paid': return { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 };
    case 'Failed': return { label: 'Thất bại', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: XCircle };
    case 'Refunded': return { label: 'Đã hoàn tiền', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: RefreshCw };
    default: return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CreditCard };
  }
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: order, isLoading, error } = useOrderDetails(id as string);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const deleteMutation = useDeleteOrder();
  const { mutate: updatePaymentStatus, isPending: isPaymentPending } = useUpdatePaymentStatus();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('');
  
  // Custom dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionLabel, setActionLabel] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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
      <Link href="/admin/orders" className="btn-hero text-black px-6 py-2.5 rounded-xl font-bold mt-4 shadow-sm">
        Quay lại danh sách
      </Link>
    </div>
  );

  const handleUpdateStatus = () => {
    const statusToUpdate = selectedStatus || order.orderStatus;
    if (!statusToUpdate || statusToUpdate === order.orderStatus) return;
    
    if (statusToUpdate === 'Cancelled' || statusToUpdate === 'Delivered') {
      const actionName = statusToUpdate === 'Cancelled' ? 'HỦY' : 'ĐÁNH DẤU LÀ ĐÃ GIAO';
      setActionLabel(actionName);
      setIsConfirmOpen(true);
      return;
    }

    executeStatusUpdate();
  };

  const executeStatusUpdate = () => {
    const statusToUpdate = selectedStatus || order.orderStatus;
    updateStatus(
      { id: order.id, status: statusToUpdate },
      {
        onSuccess: () => {
          toast.success('Cập nhật trạng thái thành công!');
          setIsConfirmOpen(false);
        },
        onError: () => {
          toast.error('Lỗi khi cập nhật trạng thái.');
          setIsConfirmOpen(false);
        }
      }
    );
  };

  const handleUpdatePaymentStatus = () => {
    const statusToUpdate = selectedPaymentStatus || order.paymentStatus;
    if (!statusToUpdate || statusToUpdate === order.paymentStatus) return;
    
    updatePaymentStatus(
      { id: order.id, status: statusToUpdate },
      {
        onSuccess: () => {
          toast.success('Cập nhật trạng thái thanh toán thành công!');
        },
        onError: () => {
          toast.error('Lỗi khi cập nhật trạng thái thanh toán.');
        }
      }
    );
  };

  const handleDeleteOrderClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteOrder = async () => {
    await deleteMutation.mutateAsync(order.id, {
      onSuccess: () => {
        toast.success('Đã xóa đơn hàng thành công!');
        router.push('/admin/orders');
      },
      onError: () => {
        toast.error('Lỗi khi xóa đơn hàng.');
        setIsDeleteConfirmOpen(false);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-page pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-3 bg-white border border-border rounded-full hover:bg-gray-50 shadow-sm transition-all group">
            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold font-display text-foreground">Chi tiết đơn hàng</h1>
            <p className="text-primary font-mono font-semibold mt-1 bg-primary/10 px-3 py-0.5 rounded-md inline-block">{order.orderCode}</p>
          </div>
        </div>
        <button
          onClick={handleDeleteOrderClick}
          disabled={deleteMutation.isPending}
          className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa đơn hàng'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info Card */}
        <div className="glass-card p-5 rounded-3xl shadow-soft space-y-4 flex flex-col h-fit">
          <h2 className="text-lg font-bold font-display flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" /> Thông tin khách hàng
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-sm flex flex-col justify-center">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Người nhận
              </p>
              <p className="font-extrabold text-foreground text-base truncate" title={order.receiverName}>{order.receiverName}</p>
            </div>
            
            <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-sm flex flex-col justify-center">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Ngày đặt
              </p>
              <p className="font-semibold text-foreground text-sm">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
            
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-sm flex flex-col justify-center sm:col-span-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Thông tin liên hệ & Địa chỉ
              </p>
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground text-sm flex gap-2"><span className="text-muted-foreground w-16">SĐT:</span> {order.receiverPhone || 'Chưa cung cấp'}</p>
                <p className="font-semibold text-foreground text-sm flex gap-2"><span className="text-muted-foreground w-16">Địa chỉ:</span> {order.receiverAddress || 'Chưa cung cấp'}</p>
              </div>
            </div>
            
            <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-sm flex flex-col justify-center">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Thanh toán
              </p>
              <div className="flex flex-col gap-1.5">
                <p className="font-semibold text-foreground text-sm">
                  {order.paymentMethod === 'Cod' ? 'Thanh toán khi nhận hàng (COD)' : 
                   order.paymentMethod === 'BankTransfer' ? 'Chuyển khoản (QR)' : order.paymentMethod}
                </p>
                {order.paymentMethod === 'BankTransfer' && (
                  <span className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border w-fit ${
                    order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                  }`}>
                    {order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-sm flex flex-col justify-center">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Tổng tiền
              </p>
              <p className="font-extrabold text-xl text-primary">{order.totalAmount.toLocaleString('vi-VN')} đ</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Update Card */}
          <div className="glass-card p-5 rounded-3xl shadow-soft flex flex-col gap-4">
            <h2 className="text-lg font-bold font-display flex items-center gap-2 text-foreground flex-none">
              <RefreshCw className="w-5 h-5 text-primary" /> Trạng thái đơn hàng
            </h2>
            
            <div className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-white shadow-sm flex-none">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hiện tại</p>
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
            
            <div className="flex flex-col gap-3 mt-1">
              <Select value={selectedStatus || order.orderStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full h-11 bg-white/80 border-2 border-white hover:border-primary/40 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/20 shadow-sm transition-all data-[state=open]:border-primary/50">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60 shadow-xl bg-white/95 backdrop-blur-xl z-50">
                  <SelectItem value="Pending" className="rounded-lg font-bold cursor-pointer py-2.5 hover:bg-muted focus:bg-muted transition-colors">Chờ xử lý</SelectItem>
                  <SelectItem value="ReadyToShip" className="rounded-lg font-bold cursor-pointer py-2.5 hover:bg-amber-50 focus:bg-amber-50 transition-colors">Chờ lấy hàng</SelectItem>
                  <SelectItem value="Shipped" className="rounded-lg font-bold cursor-pointer py-2.5 hover:bg-cyan-50 focus:bg-cyan-50 transition-colors">Đang giao</SelectItem>
                  <SelectItem value="Delivered" className="rounded-lg font-bold cursor-pointer py-2.5 hover:bg-emerald-50 focus:bg-emerald-50 text-emerald-700 transition-colors">Đã giao</SelectItem>
                  <SelectItem value="Cancelled" className="rounded-lg font-bold cursor-pointer py-2.5 hover:bg-rose-50 focus:bg-rose-50 text-rose-600 transition-colors">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <button 
                onClick={handleUpdateStatus}
                disabled={isPending || ((selectedStatus || order.orderStatus) === order.orderStatus)}
                className="btn-hero text-black w-full py-2.5 rounded-xl font-bold shadow-coral-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>

          {/* Payment Status Update Card */}
          <div className="glass-card p-5 rounded-3xl shadow-soft flex flex-col gap-4">
            <h2 className="text-lg font-bold font-display flex items-center gap-2 text-foreground flex-none">
              <CreditCard className="w-5 h-5 text-primary" /> Trạng thái thanh toán
            </h2>
            
            <div className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-white shadow-sm flex-none">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hiện tại</p>
              {(() => {
                const currentStatus = getPaymentStatusConfig(order.paymentStatus);
                const StatusIcon = currentStatus.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-extrabold border ${currentStatus.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {currentStatus.label}
                  </span>
                );
              })()}
            </div>
            
            <div className="flex flex-col gap-3 mt-1">
              <Select value={selectedPaymentStatus || order.paymentStatus} onValueChange={setSelectedPaymentStatus}>
                <SelectTrigger className="w-full h-11 bg-white/80 border-2 border-white hover:border-primary/40 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/20 shadow-sm transition-all data-[state=open]:border-primary/50">
                  <SelectValue placeholder="Chọn thanh toán" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60 shadow-xl bg-white/95 backdrop-blur-xl z-50">
                  <SelectItem value="Unpaid" className="rounded-lg font-bold cursor-pointer py-2.5 hover:bg-muted focus:bg-muted transition-colors">Chưa thanh toán</SelectItem>
                  <SelectItem value="Paid" className="rounded-lg font-bold cursor-pointer py-2.5 hover:bg-emerald-50 focus:bg-emerald-50 transition-colors">Đã thanh toán</SelectItem>
                  <SelectItem value="Failed" className="rounded-lg font-bold cursor-pointer py-2.5 hover:bg-rose-50 focus:bg-rose-50 transition-colors">Thất bại</SelectItem>
                  <SelectItem value="Refunded" className="rounded-lg font-bold cursor-pointer py-2.5 hover:bg-indigo-50 focus:bg-indigo-50 text-indigo-700 transition-colors">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
              <button 
                onClick={handleUpdatePaymentStatus}
                disabled={isPaymentPending || ((selectedPaymentStatus || order.paymentStatus) === order.paymentStatus)}
                className="btn-hero text-black w-full py-2.5 rounded-xl font-bold shadow-coral-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isPaymentPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Lưu Thanh Toán'}
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                      <span className="block text-xs font-extrabold text-indigo-400 uppercase tracking-wider mb-1.5">Tiêu đề quà</span>
                      <span className="font-bold text-indigo-950 text-base">{item.gift.giftTitle || 'N/A'}</span>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                      <span className="block text-xs font-extrabold text-indigo-400 uppercase tracking-wider mb-1.5">Người gửi</span>
                      <span className="font-bold text-indigo-950 text-base">{item.gift.senderName || 'N/A'}</span>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                      <span className="block text-xs font-extrabold text-indigo-400 uppercase tracking-wider mb-1.5">Người nhận</span>
                      <span className="font-bold text-indigo-950 text-base">{item.gift.receiverName || 'N/A'}</span>
                    </div>
                    <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                      <span className="block text-xs font-extrabold text-indigo-400 uppercase tracking-wider mb-1.5">NFC Tag Code</span>
                      <span className="font-bold text-indigo-950 text-base font-mono">{item.gift.nfcTagCode || 'Chưa gán'}</span>
                    </div>
                  </div>
                  
                  {/* HIỂN THỊ SECRET LINK ĐỂ GHI VÀO NFC */}
                  {item.gift.secretKey && ['ReadyToShip', 'Shipped', 'Delivered'].includes(order.orderStatus) && (
                    <div className="mt-4 p-6 bg-white border border-emerald-200/60 rounded-2xl shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-500"></div>
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <p className="text-emerald-800 font-extrabold tracking-tight">Đường dẫn bí mật (Dùng để ghi vào thẻ NFC)</p>
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
                            toast.success("Đã copy đường dẫn bí mật!");
                          }}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex-shrink-0"
                        >
                          Copy URL
                        </button>
                      </div>
                      <p className="text-sm text-emerald-700/80 mt-4 font-medium leading-relaxed bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        Vui lòng copy đường link trên, mở app <strong>NFC Tools</strong> và ghi (Write URL) vào thẻ vật lý tương ứng. Sau khi ghi xong thành công, hãy đổi trạng thái đơn hàng thành <strong>Đang giao</strong>.
                      </p>
                    </div>
                  )}
                  
                  {item.gift.secretKey && !['ReadyToShip', 'Shipped', 'Delivered'].includes(order.orderStatus) && (
                    <div className="mt-4 flex items-start gap-3 p-4 bg-white/50 rounded-2xl border border-white/80 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-indigo-900/70 font-medium leading-relaxed">
                        Đường dẫn bí mật sẽ hiển thị khi đơn hàng được chuyển sang trạng thái <strong className="text-indigo-950 bg-indigo-100 px-2 py-0.5 rounded-md">Chờ lấy hàng</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Xác nhận thao tác</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Bạn có chắc chắn muốn <strong>{actionLabel}</strong> đơn hàng này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl px-6 font-bold">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeStatusUpdate} 
              className={`rounded-xl px-6 font-bold ${selectedStatus === 'Cancelled' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              Đồng ý
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
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
              onClick={confirmDeleteOrder}
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
