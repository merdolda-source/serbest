export const REGION = "europe-west1";

export type CategorySlug = "haber" | "spor" | "ekonomi" | "magazin";

/**
 * RSS kaynakları: gerçek dağıtımdan önce kendi yayıncı/lisans
 * anlaşmalarınıza uygun feed URL'leriyle değiştirin. Burada örnek/yer
 * tutucu genel haber kaynakları kullanılmıştır.
 */
export const RSS_SOURCES: Record<CategorySlug, string[]> = {
  haber: ["https://www.aa.com.tr/tr/rss/default?cat=guncel"],
  spor: ["https://www.aa.com.tr/tr/rss/default?cat=spor"],
  ekonomi: ["https://www.aa.com.tr/tr/rss/default?cat=ekonomi"],
  magazin: ["https://www.aa.com.tr/tr/rss/default?cat=kultur"],
};

export const INGEST_MAX_ITEMS_PER_RUN = 5;
export const RATE_LIMIT_MAX_COMMENTS_PER_MINUTE = 5;
export const COMMENT_MAX_LENGTH = 1000;
export const COMMENT_MIN_LENGTH = 2;
