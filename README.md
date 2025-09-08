# Webcam Party 🎉

Web app untuk akses kamera di iPhone (Safari/Chrome) dengan fitur:
- Realtime preview + efek glitch
- Snapshot (gambar PNG)
- Rekam video (WebM)

## Cara pakai
1. Push repo ini ke GitHub.
2. Aktifkan **GitHub Pages** → branch `main` → root.
3. Buka URL GitHub Pages di iPhone Safari.
4. Izinkan akses kamera → mainkan!

## Catatan iOS
- Safari iOS butuh HTTPS (GitHub Pages ✅).
- Rekaman video pakai `MediaRecorder` (iOS 14.3+ support WebM/VP9, tapi kadang terbatas).
- Kalau tidak support, gunakan snapshot.

## Jalankan lokal
```bash
npx serve