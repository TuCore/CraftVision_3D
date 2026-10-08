"use client";

import React, { useState, useEffect } from 'react';
import { Wand2, Sparkles, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGreetingStore } from '../store/useGreetingStore';
import { GreetingApi } from '../services/GreetingApi';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AIGiftWidgetProps {
  receiverName: string;
  senderName: string;
  value: string; // The generated message
  onChange: (message: string) => void;
}

export const AIGiftWidget: React.FC<AIGiftWidgetProps> = ({ receiverName, senderName, value, onChange }) => {
  const store = useGreetingStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync value back if user types manually in the text area
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleGenerate = async () => {
    store.setStatus('generating');
    try {
      const data = await GreetingApi.generate({
        tone: store.tone || 'sincere',
        occasion: store.occasion || 'birthday',
        length: store.messageLength || 'medium',
        recipientTrait: store.recipientTrait || 'friend',
        giftType: store.giftType || 'nfc_card',
        visualStyle: store.visualStyle || 'Minimalist',
        senderName: store.senderName || senderName || 'Người tặng',
        receiverName: store.receiverName || receiverName || 'Người nhận',
        specialMemory: store.specialMemory || ''
      });
      store.setResult(data);
      onChange(data.message);
      toast.success("Đã tạo lời chúc thành công!");
    } catch (error) {
      store.setStatus('error', 'Lỗi khi tạo lời chúc');
      toast.error("Đã xảy ra lỗi khi tạo lời chúc.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Basic Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tên món quà (Tuỳ chọn)</label>
          <input 
            type="text"
            value={store.giftTitle}
            onChange={(e) => store.setField('giftTitle', e.target.value)}
            placeholder="VD: Bản Giao Hưởng Từ Đất Sét..."
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Người gửi</label>
          <input 
            type="text"
            value={store.senderName}
            onChange={(e) => store.setField('senderName', e.target.value)}
            placeholder="Tên của bạn..."
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Người nhận</label>
          <input 
            type="text"
            value={store.receiverName}
            onChange={(e) => store.setField('receiverName', e.target.value)}
            placeholder="Tên người nhận..."
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Dịp tặng *</label>
          <Select value={store.occasion} onValueChange={(val) => store.setField('occasion', val)}>
            <SelectTrigger className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 h-[46px] outline-none hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm">
              <SelectValue placeholder="Chọn dịp..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-border bg-white shadow-xl p-1.5 animate-in fade-in-80 zoom-in-95">
              <SelectItem value="birthday" className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-primary/10 focus:text-primary font-medium transition-colors">Sinh nhật</SelectItem>
              <SelectItem value="anniversary" className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-primary/10 focus:text-primary font-medium transition-colors">Kỷ niệm</SelectItem>
              <SelectItem value="valentine" className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-primary/10 focus:text-primary font-medium transition-colors">Valentine</SelectItem>
              <SelectItem value="graduation" className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-primary/10 focus:text-primary font-medium transition-colors">Tốt nghiệp</SelectItem>
              <SelectItem value="just_because" className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-primary/10 focus:text-primary font-medium transition-colors">Tặng không nhân dịp gì</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground flex justify-between">
          <span>Kỷ niệm đáng nhớ (Giúp AI viết hay hơn)</span>
          <span className="text-xs">{store.specialMemory.length}/300</span>
        </label>
        <textarea 
          value={store.specialMemory} 
          onChange={(e) => store.setField('specialMemory', e.target.value.substring(0, 300))} 
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 h-20 resize-none outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
          placeholder="VD: Lần đầu gặp nhau..." 
        />
      </div>

      {/* Advanced Options Toggle */}
      <div className="border border-border/50 rounded-xl overflow-hidden bg-white/30 dark:bg-card/30">
        <button 
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Tùy chỉnh AI (Tone, Độ dài...)
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {showAdvanced && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-t border-border/50 space-y-4 bg-background/50">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tone & Cảm xúc</label>
                  <div className="flex flex-wrap gap-2">
                    {['romantic', 'funny', 'sincere', 'encouraging'].map(t => (
                      <button 
                        key={t} onClick={() => store.setField('tone', t)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${store.tone === t ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/50'}`}
                      >
                        {t === 'romantic' ? 'Lãng mạn' : t === 'funny' ? 'Hài hước' : t === 'sincere' ? 'Chân thành' : 'Động viên'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Độ dài</label>
                  <div className="flex flex-wrap gap-2">
                    {['short', 'medium', 'long'].map(l => (
                      <button 
                        key={l} onClick={() => store.setField('messageLength', l)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${store.messageLength === l ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/50'}`}
                      >
                        {l === 'short' ? 'Ngắn gọn' : l === 'medium' ? 'Vừa phải' : 'Dài & Sâu sắc'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Message Area */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-primary">Lời chúc AI</h3>
            {store.result && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
                <Check className="w-3 h-3" /> Q: {store.result.metadata.qualityScore}
              </span>
            )}
          </div>
          <button 
            type="button"
            onClick={handleGenerate} 
            disabled={store.status === 'generating'} 
            className="btn-hero px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {store.status === 'generating' ? (
              <span className="flex items-center gap-2 animate-pulse">
                <Wand2 className="w-4 h-4 animate-spin" /> Đang tạo...
              </span>
            ) : (
              <><Wand2 className="w-4 h-4" /> Tạo tự động</>
            )}
          </button>
        </div>
        
        <div className="relative">
          <textarea 
            value={value}
            onChange={handleTextChange}
            placeholder="Lời chúc sẽ hiển thị ở đây. Bạn cũng có thể tự chỉnh sửa trực tiếp..."
            className="w-full bg-white/60 dark:bg-card/60 border border-primary/30 rounded-xl px-4 py-3 min-h-[120px] resize-y text-sm leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner" 
          />
          {store.status === 'generating' && (
            <div className="absolute inset-0 bg-white/40 dark:bg-card/40 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-10 border border-primary/30">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}/>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}/>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}/>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
