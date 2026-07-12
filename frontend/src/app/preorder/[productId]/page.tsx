'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import { useGenerate3DPrompt, useGenerate3DModel, useCreateOrder } from '@/hooks/usePreOrder';
import { Check, Wand2, Upload, MessageSquare, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';

function ModelViewer({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Canvas shadows camera={{ position: [0, 0, 150], fov: 40 }}>
      <Stage environment="city" intensity={0.6}>
        <primitive object={scene} />
      </Stage>
      <OrbitControls makeDefault />
    </Canvas>
  );
}

export default function PreOrderWizardPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(productId as string);
  
  const [step, setStep] = useState(1);
  
  // Form State
  const [designPrompt, setDesignPrompt] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [giftTitle, setGiftTitle] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [message, setMessage] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Mutations
  const { mutate: generatePrompt, isPending: isGeneratingPrompt } = useGenerate3DPrompt();
  const { mutate: generateModel, isPending: isGeneratingModel } = useGenerate3DModel();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  if (isLoading || !product) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  const handleGenerate3D = () => {
    if (!designPrompt) {
      toast.error('Vui lòng nhập ý tưởng thiết kế');
      return;
    }
    
    generatePrompt({ categoryId: 'mock-cat', designPrompt }, {
      onSuccess: (res) => {
        toast.info('Đã tối ưu prompt bằng AI. Đang dựng 3D...');
        generateModel(res.prompt, {
          onSuccess: (modelRes) => {
            setModelUrl(modelRes.modelUrl);
            toast.success('Dựng 3D thành công!');
          },
          onError: () => toast.error('Lỗi khi dựng 3D')
        });
      },
      onError: () => toast.error('Lỗi tối ưu prompt')
    });
  };

  const handleCheckout = () => {
    if (!shippingAddress || !phone || !senderName || !receiverName) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng & quà tặng');
      return;
    }

    const payload = {
      receiverName: receiverName,
      receiverPhone: phone,
      receiverAddress: shippingAddress,
      items: [
        {
          productId: product.id,
          quantity: 1,
          wantNfc: product.supportsNfc,
          gift: {
            giftTitle: giftTitle || 'Quà Tặng 3D',
            senderName,
            receiverName,
            message,
            messageSource: 'Manual',
            threeDModelUrl: modelUrl,
            threeDPrompt: designPrompt
          }
        }
      ]
    };

    createOrder(payload, {
      onSuccess: (data) => {
        toast.success('Đặt hàng thành công!');
        router.push(`/products`); // Or to an order success page
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Có lỗi khi đặt hàng');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tạo Quà 3D: {product.name}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
          <span className={step >= 1 ? 'text-indigo-600' : ''}>1. Tạo 3D</span>
          <span className="w-8 h-px bg-gray-300"></span>
          <span className={step >= 2 ? 'text-indigo-600' : ''}>2. Nội Dung NFC</span>
          <span className="w-8 h-px bg-gray-300"></span>
          <span className={step >= 3 ? 'text-indigo-600' : ''}>3. Đặt Hàng</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700 min-h-[500px]">
        {/* STEP 1: AI 3D GENERATE */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-600" />
              Thiết kế mô hình 3D bằng AI
            </h2>
            <p className="text-gray-500">Miêu tả ý tưởng bạn muốn tạo thành quà tặng 3D. AI sẽ tự động tối ưu và dựng hình cho bạn.</p>
            
            <textarea
              className="w-full h-32 border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-900"
              placeholder="VD: Một con rồng nhỏ màu đỏ đang ôm trái tim..."
              value={designPrompt}
              onChange={(e) => setDesignPrompt(e.target.value)}
            />

            <button
              onClick={handleGenerate3D}
              disabled={isGeneratingPrompt || isGeneratingModel}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
            >
              {(isGeneratingPrompt || isGeneratingModel) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {isGeneratingPrompt ? 'Đang tối ưu Prompt...' : isGeneratingModel ? 'Đang tạo 3D (Mất khoảng 30s)...' : 'Tạo Mô Hình 3D'}
            </button>

            {modelUrl && (
              <div className="mt-8">
                <h3 className="font-semibold mb-4 text-center">Bản xem trước 3D</h3>
                <div className="w-full h-80 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden cursor-move border border-gray-200 dark:border-gray-700">
                  <ModelViewer url={modelUrl} />
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 mt-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800"
                >
                  Tiếp Tục &gt;
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: NFC CONTENT */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Nội dung thông điệp kỹ thuật số
            </h2>
            <p className="text-gray-500">Thông điệp này sẽ hiển thị khi người nhận chạm điện thoại vào sản phẩm (NFC).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên Người Gửi</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-900"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên Người Nhận</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-900"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="VD: Trần Thị B"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu Đề Quà Tặng</label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-900"
                value={giftTitle}
                onChange={(e) => setGiftTitle(e.target.value)}
                placeholder="VD: Quà Sinh Nhật Tuổi 20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lời Chúc</label>
              <textarea
                className="w-full h-32 border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-900"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Viết lời chúc ý nghĩa của bạn ở đây..."
              />
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Quay lại</button>
              <button onClick={() => setStep(3)} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">Tiếp Tục &gt;</button>
            </div>
          </div>
        )}

        {/* STEP 3: CHECKOUT */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Thông tin nhận hàng & Thanh toán
            </h2>

            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl mb-6 flex justify-between items-center">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Thiết kế 3D cá nhân hóa + NFC</p>
              </div>
              <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{product.price.toLocaleString('vi-VN')} đ</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ nhận hàng</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-900"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="VD: 123 Đường ABC, Quận X, TP Y"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0987654321"
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Quay lại</button>
              <button 
                onClick={handleCheckout} 
                disabled={isCreatingOrder}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isCreatingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Xác nhận Đặt hàng (COD)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
