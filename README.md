# Viran Cafe — Dijital QR Menü

Bağımlılıksız, statik bir site. Herhangi bir hostinge (cPanel, Netlify, Vercel, GitHub Pages) klasörü olduğu gibi yüklemek yeterli.
QR kod, `index.html`'in yayınlandığı adrese yönlendirilir.

## Dosyalar
- `index.html`: Sayfa iskeleti
- `assets/css/style.css`: Tüm tasarım (Gece/Gündüz temaları en üstte, renk token'ları olarak tanımlı)
- `assets/js/app.js`: Menü uygulaması (arama, ürün detayı, seçimlerim, kategori takibi)
- `assets/js/menu-data.js`: **Tüm ürünler ve fiyatlar burada**
- `assets/img/`: Optimize edilmiş ürün görselleri (webp)

## Fiyat / ürün güncelleme
`assets/js/menu-data.js` dosyasını açın, ürünü bulun:

```js
{ "name": "San Sebastian", "price": 320, "img": "assets/img/tatlilar-01.webp", "sig": true }
```

- `price`: Fiyat (sayı). Fiyatı yazmak istemiyorsanız `null` yapın; menüde "Sorunuz" görünür.
- `desc`: (isteğe bağlı) Kısa açıklama.
- `sig: true`: Ürünü "İmza Lezzetler" vitrinine ve "İmza" rozetine ekler.
- Yeni görsel eklemek için dosyayı `assets/img/` içine koyup `img` alanına yolunu yazın.

## Özellikler
- Açılış animasyonu (oturum başına bir kez gösterilir, dokununca geçilir)
- Saate göre değişen karşılama ekranı (sabah kahvaltı, gündüz pastane, akşam ızgara, gece tatlı)
- İmza Lezzetler vitrini, bölüm bölüm kategori dizini
- Yapışkan kategori menüsü ve kaydırınca otomatik vurgulama
- Liste ve galeri görünümü
- Ürün detay penceresi (aşağı çekerek ya da telefonun geri tuşuyla kapanır)
- Türkçe karakterden bağımsız arama ("fistik" yazınca "Fıstık" bulunur)
- "Seçimlerim": müşteri beğendiklerini ekler, toplamı görür, ekranı garsona gösterir
- Gece / Gündüz teması
