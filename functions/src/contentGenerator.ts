import { getAnthropicClient } from "./anthropicClient";
import type { CategorySlug } from "./config";

export interface GeneratedContent {
  title: string;
  summary: string;
  body: string;
}

const CATEGORY_LABELS: Record<CategorySlug, string> = {
  haber: "Genel Haber",
  spor: "Spor",
  ekonomi: "Ekonomi",
  magazin: "Magazin",
};

const SYSTEM_PROMPT = `Sen Haberly uygulaması için içerik üreten bir Türkçe haber editörüsün.
Sana sadece bir haber BAŞLIĞI verilecek. Bu başlıktan esinlenerek, kendi
cümlelerinle, ÖZGÜN bir Türkçe haber metni yazacaksın. Kaynak metni kopyalama,
sadece konunun genel çerçevesinden yararlan. Tarafsız, yargı içermeyen, sansasyonel
olmayan bir haber dili kullan. Spekülatif veya doğrulanmamış detay/istatistik/alıntı
üretme; başlıkta verilmeyen somut iddialarda bulunma. Yanıtını SADECE şu JSON
formatında ver, başka hiçbir açıklama ekleme:
{"title": "...", "summary": "...", "body": "..."}
- title: Haber başlığı (orijinalden farklı kelimelerle, 90 karakteri aşmasın)
- summary: 1-2 cümlelik kısa özet
- body: 3-5 paragraf, tam Türkçe karakter desteğiyle (ç, ğ, ı, ö, ş, ü)`;

export async function generateContentFromTitle(
  title: string,
  category: CategorySlug
): Promise<GeneratedContent> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Kategori: ${CATEGORY_LABELS[category]}\nBaşlık: "${title}"`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude yanıtında metin bloğu bulunamadı");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude yanıtı geçerli JSON içermiyor");
  }

  const parsed = JSON.parse(jsonMatch[0]) as GeneratedContent;
  if (!parsed.title || !parsed.summary || !parsed.body) {
    throw new Error("Claude yanıtında zorunlu alanlar eksik");
  }
  return parsed;
}
