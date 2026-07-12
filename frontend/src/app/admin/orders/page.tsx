'use client';

import { useOrders } from '@/hooks/useOrders';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const { data, isLoading, error } = useOrders(1, 50);

  if (isLoading) return <div>Đang tải danh sách đơn hàng...</div>;
  if (error) return <div>Lỗi tải đơn hàng</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý Đơn hàng</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300">Mã Đơn</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300">Người nhận</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300">Trạng thái</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300">Tổng tiền</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data?.items.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">{order.orderCode}</td>
                <td className="px-6 py-4">{order.receiverName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.orderStatus === 'ReadyToShip' ? 'bg-yellow-100 text-yellow-800' :
                    order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="px-6 py-4">{order.totalAmount.toLocaleString('vi-VN')} đ</td>
                <td className="px-6 py-4">
                  <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">
                    Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
