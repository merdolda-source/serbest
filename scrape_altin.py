# scrape_altin.py
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

URL = "https://canlidoviz.com/altin-fiyatlari/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/121.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

def fetch_page():
    r = requests.get(URL, headers=HEADERS, timeout=15)
    r.raise_for_status()
    return r.text

def parse_altin_table(html):
    soup = BeautifulSoup(html, "html.parser")

    # Senin verdiğin yapı:
    # <div class="w-full flex gap-3 min-w-[300px]">
    #   <div class="table-container">
    #     ... tablo ...
    #   </div>
    # </div>

    container = soup.find("div", class_="table-container")
    if not container:
        raise RuntimeError("table-container div bulunamadı. Site yapısı değişmiş olabilir.")

    table = container.find("table")
    if not table:
        raise RuntimeError("table-container içinde <table> bulunamadı.")

    rows = []
    tbody = table.find("tbody") or table
    for tr in tbody.find_all("tr"):
        tds = tr.find_all(["td", "th"])
        if not tds:
            continue

        # Hücre text’lerini temizle
        cells = [td.get_text(strip=True).replace("\xa0", " ") for td in tds]

        # Beklenen kolonlar:
        # ALTIN ADI | ALIŞ | SATIŞ | DÜŞÜK | YÜKSEK | KAPANIŞ
        # ama garanti olmadığı için sadece genel bir map yapıyorum
        row = {
            "raw": cells,  # istersen sadece bunu da kullanabilirsin
        }

        # Eğer kolon sayısı tutuyorsa, ayrıştır:
        if len(cells) >= 6:
            row.update(
                {
                    "altin_adi": cells[0],
                    "alis": cells[1],
                    "satis": cells[2],
                    "dusuk": cells[3],
                    "yuksek": cells[4],
                    "kapanis": cells[5],
                }
            )

        rows.append(row)

    return rows

def main():
    html = fetch_page()
    data = parse_altin_table(html)

    out = {
        "source": URL,
        "last_update": datetime.utcnow().isoformat() + "Z",
        "count": len(data),
        "items": data,
    }

    # GitHub repo içinde altin.json olarak sakla
    with open("altin.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"{len(data)} satır yazıldı -> altin.json")

if __name__ == "__main__":
    main()
