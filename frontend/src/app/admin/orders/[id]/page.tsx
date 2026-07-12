'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrderDetails, useUpdateOrderStatus, Order } from '@/hooks/useOrders';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: order, isLoading, error } = useOrderDetails(id as string);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  if (isLoading) return <div>Đang tải chi tiết đơn hàng...</div>;
  if (error || !order) return <div>Lỗi tải đơn hàng.</div>;

  const handleUpdateStatus = () => {
    if (!selectedStatus) return;
    updateStatus(
      { id: order.id, status: selectedStatus },
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Chi tiết Đơn hàng: {order.orderCode}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Thông tin khách hàng</h2>
          <div>
            <p className="text-sm text-gray-500">Người nhận</p>
            <p className="font-medium">{order.receiverName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ngày đặt</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng tiền</p>
            <p className="font-medium text-lg text-indigo-600">{order.totalAmount.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Cập nhật trạng thái</h2>
          <div>
            <p className="text-sm text-gray-500 mb-2">Trạng thái hiện tại: <strong>{order.orderStatus}</strong></p>
            <div className="flex gap-2">
              <select 
                className="flex-1 border border-gray-300 rounded-md p-2"
                value={selectedStatus || order.orderStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="WaitingProduction">WaitingProduction</option>
                <option value="Producing">Producing</option>
                <option value="ReadyToShip">ReadyToShip</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button 
                onClick={handleUpdateStatus}
                disabled={isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hiển thị chi tiết các sản phẩm & NFC */}
      <h2 className="text-xl font-semibold mt-8">Sản phẩm trong đơn ({order.items?.length || 0})</h2>
      <div className="space-y-4">
        {order.items?.map((item: any) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{item.productName} (x{item.quantity})</h3>
                <p className="text-sm text-gray-500">Loại: {item.productType} | Đơn giá: {item.unitPrice.toLocaleString('vi-VN')} đ</p>
              </div>
              <p className="font-semibold text-lg">{item.subTotal.toLocaleString('vi-VN')} đ</p>
            </div>
            
            {item.gift && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-md space-y-3">
                <h4 className="font-semibold text-indigo-800 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Dữ liệu NFC & Quà tặng
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tiêu đề:</span> <span className="font-medium">{item.gift.giftTitle || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">NFC Tag Code:</span> <span className="font-medium">{item.gift.nfcTagCode || 'Chưa gán'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Trạng thái NFC:</span> <span className="font-medium">{item.gift.status || 'N/A'}</span>
                  </div>
                </div>
                
                {/* HIỂN THỊ SECRET LINK ĐỂ GHI VÀO NFC */}
                {item.gift.secretKey && order.orderStatus === 'ReadyToShip' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800 font-medium mb-1">🔥 SECRET URL (Dùng để ghi vào thẻ NFC):</p>
                    <p className="font-mono text-sm break-all select-all bg-white p-2 border border-green-100 rounded">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/gift/scan/{item.gift.secretKey}
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Vui lòng copy đường link trên, mở app NFC Tools và ghi (Write URL) vào thẻ vật lý tương ứng. Sau khi ghi xong, đổi trạng thái đơn thành Shipped.
                    </p>
                  </div>
                )}
                
                {item.gift.secretKey && order.orderStatus !== 'ReadyToShip' && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    (Secret URL sẽ hiển thị khi đơn hàng chuyển sang trạng thái <strong>ReadyToShip</strong>)
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
