'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function AdminNfcPage() {
  const [tagCodesInput, setTagCodesInput] = useState('');

  const { mutate: importTags, isPending } = useMutation({
    mutationFn: async (codes: string[]) => {
      const { data } = await api.post('/api/nfc-tags/batch', { tagCodes: codes });
      return data; // returns NfcImportResultDto { totalImported, importedTags, errors }
    },
    onSuccess: (data) => {
      if (data.totalImported > 0) {
        toast.success(`Đã import thành công ${data.totalImported} thẻ NFC!`);
        setTagCodesInput('');
      }
      if (data.errors && data.errors.length > 0) {
        toast.error(`Có ${data.errors.length} thẻ bị lỗi (đã tồn tại).`);
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Có lỗi xảy ra khi import NFC');
    }
  });

  const handleImport = () => {
    const codes = tagCodesInput
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (codes.length === 0) {
      toast.error('Vui lòng nhập ít nhất 1 mã NFC');
      return;
    }

    importTags(codes);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Quản lý Kho NFC</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          Import Lô Thẻ NFC
        </h2>
        <p className="text-sm text-gray-500">
          Nhập danh sách mã Tag Code được in trên phôi thẻ NFC. Mỗi mã nằm trên 1 dòng. 
          Các thẻ sau khi import sẽ có trạng thái <strong>Available</strong>.
        </p>
        
        <textarea
          className="w-full h-48 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md p-3 font-mono text-sm"
          placeholder="Ví dụ:
NFC-10001
NFC-10002
NFC-10003"
          value={tagCodesInput}
          onChange={(e) => setTagCodesInput(e.target.value)}
          disabled={isPending}
        />
        
        <div className="flex justify-end">
          <button
            onClick={handleImport}
            disabled={isPending || tagCodesInput.trim().length === 0}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Bắt đầu Import'}
          </button>
        </div>
      </div>
      
      {/* 
        Sau này có thể thêm 1 component Danh sách các thẻ NFC đang có trong kho ở đây.
        Để lấy danh sách NFC, ta cần bổ sung thêm API GET /api/nfc-tags ở backend.
      */}
    </div>
  );
}
