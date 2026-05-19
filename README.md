# 🐰 Lagomorph

**Lagomorph**, geleneksel sıra tabanlı strateji oyunu *Dots and Boxes* (Kutu Kapmaca) mekaniklerini, modern UI/UX trendleri, yoğun mikro-animasyonlar ve zengin özelleştirme seçenekleriyle web platformuna taşıyan interaktif bir web oyunudur.

Adını tavşangillerin bilimsel sınıflandırması olan *Lagomorpha* takımından alan proje, dışarıdan bakıldığında gizemli ve teknik bir isme sahipken, içeride tamamen tavşan ve havuç temalı sevimli bir dünyaya açılan bir ters köşe (*plot twist*) barındırır.

---

## 🎯 Oyunun Temel Amacı ve Kuralları

Oyun, dinamik olarak oluşturulan kare tabanlı bir harita (grid) üzerinde oynanır.

1. **Sıra Tabanlı Hamle (Turn-Based Operation):** Her oyuncu sırayla iki nokta arasına dikey veya yatay olarak **1 birimlik** bir çizgi (çit/tırmık yolu) çeker.
2. **Alan Kapatma & Skor (Capture Mechanics):** Bir karenin 4. ve son kenarını kapatarak o alanı tamamlayan oyuncu, karenin mülkiyetini ve **1 Puan** kazanır.
3. **Ek Hamle Hakkı (Bonus Turn):** Bir kareyi kapatan oyuncu, sırasını kaybetmez ve **ek bir çizgi çekme hakkı** (Combo şansı) elde eder.
4. **Oyun Sonu (Victory Condition):** Haritadaki tüm kareler kapandığında oyun biter. En yüksek skora ulaşan oyuncu maçı kazanır.

---

## ✨ Öne Çıkan Özellikler (Features)

### 🎨 1. Çift Tema Motoru (Dual Theme Engine)
Oyuncular oyun esnasında veya ana menüde iki farklı görsel mod arasında dinamik geçiş yapabilirler:
*   **Tavşan Teması (_The Warren_):** Yeşil çim zemin üzerine ahşap çitler çekilir. Bir kare kapandığında, pofuduk bir tavşan kafası zıplayarak (*bounce animation*) alanın ortasında belirir.
*   **Havuç Teması (_The Harvest_):** Toprak zemin üzerine tırmık izleri çekilir. Bir kare kapandığında, toprağın altından yaprakları dönen dinamik bir havuç fırlar (*scale-up animation*).

### ⚙️ 2. Dinamik Harita Yönetimi (Custom Grid Size)
Sabit harita sınırları yoktur. Giriş ekranındaki slider/input aracılığıyla $3 \times 3$ ile $10 \times 10$ arasında tamamen dinamik grid yapıları oluşturulabilir.

### 👥 3. Çoklu Oyuncu & Bot Desteği (Up to 5 Players & AI)
*   **Esnek Slot Sistemi:** En fazla 5 gerçek oyuncu aynı bilgisayar üzerinden (Pass & Play) takma adlarını girerek oyuna dahil olabilir.
*   **Lagomorph AI (Bot):** Boş kalan slotlara akıllı botlar atanabilir. Botlar, haritadaki tehlikeleri ve fırsatları analiz eden özel bir karar ağacı algoritmasıyla hareket eder.

### 🎬 4. Yoğun Mikro-Etkileşimler & Animasyonlar
*   **Hover Glow:** Fare çizgilerin üzerine geldiğinde temaya uygun şeffaf bir önizleme parlaması oluşur.
*   **Score Pop:** Puan kazanıldığında skorborddaki ilgili oyuncunun skoru yukarı doğru fırlar (`transform: translateY`) ve küçük parçacık (*particle*) efektleri patlar.
*   **Combo System:** Ardı ardına kare kapatıldığında ekranda "MEGA HARVEST!" veya "COMBO!" animasyonları tetiklenir.

---

## 🤖 Yapay Zeka Algoritması (Bot Logic)

`Lagomorph_AI` her hamle sırasında harita matrisini tarayarak şu öncelik sırasına göre karar verir:

1.  **Saldırı (Attack - Priority 1):** Çevresinde 3 çizgisi çekilmiş (yani tek hamlede kapatılabilecek) bir kare varsa, bot doğrudan 4. çizgiyi çeker, puanı ve `bonus turn` hakkını alır.
2.  **Savunma (Defense - Priority 2):** Eğer kapatılacak kare yoksa, bot insan oyunculara puan vermemek için çevresinde 2 çizgisi çekilmiş olan karelerin 3. çizgisini çekmekten kaçınır (Çünkü 3 yaparsa sıra diğer oyuncuya geçtiğinde alanı kaptırır).
3.  **Rastgele Güvenli Hamle (Safe Random - Priority 3):** Yukarıdaki iki senaryo da yoksa, haritadaki tamamen güvenli (0 veya 1 çizgisi olan) alanlara rastgele çizgi atar.

---

## 🛠️ Teknik Mimari (Tech Stack)

*   **Frontend UI:** HTML5, CSS3 (Flexbox/Grid, Custom Properties)
*   **Game Core & Graphics:** JavaScript (Vanilla JS) & **HTML5 Canvas API**
*   **Animations:** Web Animations API / GSAP (GreenSock Animation Platform)

### Veri Yapısı (Data Structure) Örneği

```javascript
const gameConfig = {
    gridSize: { rows: 5, cols: 5 },
    currentTheme: 'rabbit', // 'rabbit' veya 'carrot'
    activePlayerIndex: 0,
    players: [
        { id: 1, name: 'Ahmet', score: 0, color: '#ff4757', isBot: false },
        { id: 2, name: 'Lagomorph_Bot_1', score: 0, color: '#2ed573', isBot: true }
    ]
};
```

## Çalıştırma

Oyunu npm veya yerel sunucu kurmadan çalıştırmak için `index.html` dosyasını tarayıcıda açın. Projedeki `package.json` yalnızca geliştirici testleri ve isteğe bağlı Vite akışı için durur.
