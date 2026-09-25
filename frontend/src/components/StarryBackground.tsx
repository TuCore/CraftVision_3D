import React from "react";

export function StarryBackground() {
  return (
    <>
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none" 
        style={{ backgroundImage: "url('/dreamy-hero-bg.jpg')" }} 
      />
      
      {/* Subtle twilight mauve & purple depth overlays for optimal text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2b1023]/40 via-[#3d1630]/25 to-[#240a1b]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#200c1a]/30 to-[#12050e]/60 pointer-events-none" />

      {/* Whimsical Hand-drawn SVG Doodles (Crescent moon, stars, constellations) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45" xmlns="http://www.w3.org/2000/svg">
        {/* Trăng khuyết doodle góc trên bên trái */}
        <path d="M 120 70 A 35 35 0 0 0 170 125 A 40 40 0 1 1 120 70 Z" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" className="animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Ngôi sao doodle 5 cánh vẽ tay góc trên giữa */}
        <path d="M 480 45 L 485 60 L 500 62 L 488 72 L 492 87 L 480 77 L 468 87 L 472 72 L 460 62 L 475 60 Z" fill="none" stroke="white" strokeWidth="1.2" opacity="0.7" />
        
        {/* Ngôi sao doodle vẽ tay lớn góc dưới bên phải */}
        <path d="M 850 380 L 870 420 L 915 425 L 880 455 L 890 500 L 850 475 L 810 500 L 820 455 L 785 425 L 830 420 Z" fill="none" stroke="white" strokeWidth="1.6" opacity="0.6" />
        
        {/* Các hạt sao lấp lánh rải rác */}
        <path d="M 260 200 L 263 210 L 273 213 L 263 216 L 260 226 L 257 216 L 247 213 L 257 210 Z" fill="white" opacity="0.7" />
        <path d="M 720 140 L 723 148 L 731 150 L 723 152 L 720 160 L 717 152 L 709 150 L 717 148 Z" fill="white" opacity="0.6" />
        <path d="M 980 220 L 982 228 L 990 230 L 982 232 L 980 240 L 978 232 L 970 230 L 978 228 Z" fill="white" opacity="0.5" />
        <path d="M 160 380 L 162 386 L 168 388 L 162 390 L 160 396 L 158 390 L 152 388 L 158 386 Z" fill="white" opacity="0.5" />

        {/* Đường nét vẽ mây bồng bềnh */}
        <path d="M 50 420 Q 90 390 140 410 Q 190 390 230 425" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.35" />
        <path d="M 780 80 Q 820 50 870 70 Q 920 50 960 85" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.3" />
      </svg>
    </>
  );
}
