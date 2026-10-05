import Link from "next/link";
import { ArrowLeft, Truck, MapPin, CheckCircle2 } from "lucide-react";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center border-b sticky top-0 z-10">
        <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
        {/* Status Banner */}
        <div className="bg-gradient-to-r from-rose-500 to-orange-400 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Đang giao hàng</h2>
          <p className="text-white/90">Đơn hàng dự kiến giao vào ngày mai</p>
        </div>

        {/* Shipping Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="text-rose-500" size={24} />
            <h3 className="text-lg font-bold text-gray-900">Thông tin vận chuyển</h3>
          </div>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {/* Step 1 */}
            <div className="relative flex items-start gap-4">
              <div className="bg-rose-500 rounded-full p-1 ring-4 ring-white z-10 mt-1">
                <CheckCircle2 className="text-white" size={16} />
              </div>
              <div>
                <h4 className="font-bold text-rose-500">Đang giao hàng</h4>
                <p className="text-gray-600 mt-1">Shipper đang trên đường giao hàng.</p>
                <p className="text-sm text-gray-400 mt-1">09:00, 2 Thg 10</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative flex items-start gap-4">
              <div className="bg-gray-300 rounded-full p-1 ring-4 ring-white z-10 mt-1">
                <div className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Đã lấy hàng</h4>
                <p className="text-gray-600 mt-1">Đơn hàng đã được bàn giao cho đơn vị vận chuyển.</p>
                <p className="text-sm text-gray-400 mt-1">15:30, 1 Thg 10</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start gap-4">
              <div className="bg-gray-300 rounded-full p-1 ring-4 ring-white z-10 mt-1">
                <div className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Đã xác nhận</h4>
                <p className="text-gray-600 mt-1">Người bán đang chuẩn bị hàng.</p>
                <p className="text-sm text-gray-400 mt-1">08:00, 1 Thg 10</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="text-rose-500" size={24} />
            <h3 className="text-lg font-bold text-gray-900">Địa chỉ nhận hàng</h3>
          </div>
          
          <div className="text-gray-900">
            <p className="font-bold text-lg">Nguyễn Văn A</p>
            <p className="text-gray-700 mt-2">0123456789</p>
            <p className="text-gray-500 mt-1 leading-relaxed">Số 1, Đường 2, Phường 3, Quận 4, TP.HCM</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Link href="/">
            <button className="w-full py-4 rounded-xl font-bold text-rose-500 border-2 border-rose-500 hover:bg-rose-50 transition-colors">
              Quay lại trang chủ
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
