"use client";

import { useEffect, useState } from "react";
import { voucherApi } from "./api";
import type { CheckoutQuote, CheckoutRequest } from "./types";

export function useVoucherQuote(request: CheckoutRequest | null, voucherCode: string, refresh: number) {
  const key = request ? JSON.stringify({ ...request, voucherCode: voucherCode.trim().toUpperCase() || undefined }) : "";
  const [state, setState] = useState<{ key: string; version: number; quote?: CheckoutQuote; error?: string }>({ key: "", version: -1 });
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => {
      voucherApi.quote(JSON.parse(key) as CheckoutRequest, controller.signal).then(
        quote => { if (active) setState({ key, version: refresh, quote }); },
        error => { if (active && !controller.signal.aborted) setState({ key, version: refresh, error: error.message || "Không thể tính tiền. Vui lòng thử lại." }); },
      );
    }, 250);
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [key, refresh]);
  const current = state.key === key && state.version === refresh && Boolean(key);
  return { quote: current ? state.quote : undefined, error: current ? state.error : undefined,
    loading: Boolean(key) && (!current || (!state.quote && !state.error)) };
}
