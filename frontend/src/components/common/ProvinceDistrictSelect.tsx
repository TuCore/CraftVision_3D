"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import vietnamProvinces from "@/data/vietnam-provinces.json";
import { MapPin, ChevronDown, Search, Check, Building2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface ProvinceDistrictSelectProps {
  province?: string;
  district?: string;
  onProvinceChange: (provinceName: string) => void;
  onDistrictChange: (districtName: string) => void;
  provinceLabel?: string;
  districtLabel?: string;
  className?: string;
}

function normalizeVietnamese(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function ProvinceDistrictSelect({
  province = "",
  district = "",
  onProvinceChange,
  onDistrictChange,
  provinceLabel = "Tỉnh / Thành phố *",
  districtLabel = "Quận / Huyện *",
  className = "",
}: ProvinceDistrictSelectProps) {
  const [openProvince, setOpenProvince] = useState(false);
  const [openDistrict, setOpenDistrict] = useState(false);
  const [searchProvince, setSearchProvince] = useState("");
  const [searchDistrict, setSearchDistrict] = useState("");

  const provinceInputRef = useRef<HTMLInputElement>(null);
  const districtInputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on open
  useEffect(() => {
    if (openProvince) {
      setTimeout(() => provinceInputRef.current?.focus(), 50);
    } else {
      setSearchProvince("");
    }
  }, [openProvince]);

  useEffect(() => {
    if (openDistrict) {
      setTimeout(() => districtInputRef.current?.focus(), 50);
    } else {
      setSearchDistrict("");
    }
  }, [openDistrict]);

  // Find currently active province
  const currentProvinceObj = useMemo(() => {
    if (!province) return undefined;
    const clean = province.toLowerCase().trim();
    const cleanNorm = normalizeVietnamese(province);
    return vietnamProvinces.find(
      (p) =>
        p.name.toLowerCase() === clean ||
        normalizeVietnamese(p.name) === cleanNorm ||
        p.name.toLowerCase().includes(clean) ||
        normalizeVietnamese(p.name).includes(cleanNorm)
    );
  }, [province]);

  // Filtered provinces list
  const filteredProvinces = useMemo(() => {
    if (!searchProvince.trim()) return vietnamProvinces;
    const q = normalizeVietnamese(searchProvince);
    return vietnamProvinces.filter((p) => normalizeVietnamese(p.name).includes(q));
  }, [searchProvince]);

  // Filtered districts list
  const filteredDistricts = useMemo(() => {
    if (!currentProvinceObj) return [];
    if (!searchDistrict.trim()) return currentProvinceObj.districts;
    const q = normalizeVietnamese(searchDistrict);
    return currentProvinceObj.districts.filter((d) => normalizeVietnamese(d.name).includes(q));
  }, [currentProvinceObj, searchDistrict]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Province Selector */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" /> {provinceLabel}
        </Label>
        <Popover open={openProvince} onOpenChange={setOpenProvince}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full h-11 px-3.5 rounded-xl bg-card/80 hover:bg-card border border-border hover:border-primary/40 transition-all flex items-center justify-between text-left text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <span className={`truncate ${province ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {province || "-- Chọn Tỉnh / Thành phố --"}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground opacity-60 shrink-0 ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-[300px] sm:w-[340px] p-0 rounded-2xl bg-white/95 dark:bg-card/95 backdrop-blur-xl border border-primary/20 shadow-2xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          >
            <div className="p-3 border-b border-border/50 bg-muted/20">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={provinceInputRef}
                  type="text"
                  placeholder="Gõ để tìm nhanh tỉnh thành..."
                  value={searchProvince}
                  onChange={(e) => setSearchProvince(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-border/20 custom-scrollbar">
              {filteredProvinces.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Không tìm thấy tỉnh thành nào
                </div>
              ) : (
                filteredProvinces.map((p) => {
                  const isSelected = currentProvinceObj?.code === p.code || province === p.name;
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => {
                        onProvinceChange(p.name);
                        onDistrictChange("");
                        setOpenProvince(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-primary/5 text-foreground hover:text-primary"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary" : "bg-transparent group-hover:bg-primary/40"}`} />
                        {p.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* District Selector */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-primary" /> {districtLabel}
        </Label>
        <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={!currentProvinceObj}
              className={`w-full h-11 px-3.5 rounded-xl border transition-all flex items-center justify-between text-left text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                !currentProvinceObj
                  ? "bg-muted/40 border-border/50 text-muted-foreground/60 cursor-not-allowed"
                  : "bg-card/80 hover:bg-card border-border hover:border-primary/40 cursor-pointer"
              }`}
            >
              <span className={`truncate ${district ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {district || (!currentProvinceObj ? "-- Vui lòng chọn Tỉnh trước --" : "-- Chọn Quận / Huyện --")}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground opacity-60 shrink-0 ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-[300px] sm:w-[340px] p-0 rounded-2xl bg-white/95 dark:bg-card/95 backdrop-blur-xl border border-primary/20 shadow-2xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          >
            <div className="p-3 border-b border-border/50 bg-muted/20">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={districtInputRef}
                  type="text"
                  placeholder="Gõ để tìm nhanh quận huyện..."
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-border/20 custom-scrollbar">
              {filteredDistricts.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Không tìm thấy quận huyện nào
                </div>
              ) : (
                filteredDistricts.map((d) => {
                  const isSelected = district === d.name;
                  return (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => {
                        onDistrictChange(d.name);
                        setOpenDistrict(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-primary/5 text-foreground hover:text-primary"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary" : "bg-transparent group-hover:bg-primary/40"}`} />
                        {d.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
