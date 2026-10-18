# CalSnap: AI calorie tracker (photo → calories)

Food photo lo, AI calories aur macros batata hai. Free tier: 3 scans/din. Premium: weekly $4.99 ya annual $39.99 (7 din trial).

## Chalane ka tareeqa
```bash
cd calsnap
# Demo mode (AI key ke baghair)
node server.js
# Asli AI ke saath
ANTHROPIC_API_KEY=sk-ant-... node server.js
```
Phir `http://localhost:3000` kholein (phone par bhi chalta hai, "Add to Home Screen" karein).
Node 18+ chahiye. Koi npm install nahi.

## Files
- `server.js`: static server + `/api/analyze` (Claude vision, key sirf server par rehti hai)
- `index.html`: poori app (onboarding, scan, daily log, paywall)
- `manifest.json`: PWA

## Paisa kamane ke liye agle qadam
1. **Payments**: `buy()` abhi demo hai. Web ke liye Stripe Checkout, mobile ke liye RevenueCat jodein, aur premium status server par verify karein.
2. **Server limits**: free scan limit abhi browser mein hai. Production mein user account + server-side limit lagayein, warna loag bypass kar lenge.
3. **Mobile app**: PWA ko Capacitor se iOS/Android mein wrap karein. iOS par revenue zyada hota hai.
4. **Hosting**: Render/Railway/Fly par deploy karein, `ANTHROPIC_API_KEY` env var mein rakhein.
5. **Growth**: App Store keywords (calorie counter, food scanner), TikTok/Reels demos.
6. **Niche**: general ki jagah ek audience chunein (jaise Pakistani/desi khana, gym log, diabetics). Isi se jeetna asaan hota hai.

## Note
Calories sirf andaza hain, medical advice nahi. App Store submit karte waqt disclaimer aur privacy policy lazmi hain.
