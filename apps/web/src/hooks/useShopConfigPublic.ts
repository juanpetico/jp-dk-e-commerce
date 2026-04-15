"use client";

import { useEffect, useState } from 'react';
import { shopConfigService } from '@/services/shopConfigService';

type PublicShopConfig = {
    baseShippingCost: number;
    freeShippingThreshold: number;
};

const FALLBACK: PublicShopConfig = { baseShippingCost: 3990, freeShippingThreshold: 50000 };

let cache: PublicShopConfig | null = null;
let inflight: Promise<PublicShopConfig> | null = null;

function load(): Promise<PublicShopConfig> {
    if (cache) return Promise.resolve(cache);
    if (inflight) return inflight;
    inflight = shopConfigService.getConfig()
        .then(cfg => {
            cache = {
                baseShippingCost: cfg.baseShippingCost ?? FALLBACK.baseShippingCost,
                freeShippingThreshold: cfg.freeShippingThreshold ?? FALLBACK.freeShippingThreshold,
            };
            return cache;
        })
        .catch(() => FALLBACK)
        .finally(() => { inflight = null; });
    return inflight;
}

export function useShopConfigPublic(): PublicShopConfig {
    const [cfg, setCfg] = useState<PublicShopConfig>(cache ?? FALLBACK);
    useEffect(() => {
        let active = true;
        load().then(v => { if (active) setCfg(v); });
        return () => { active = false; };
    }, []);
    return cfg;
}
