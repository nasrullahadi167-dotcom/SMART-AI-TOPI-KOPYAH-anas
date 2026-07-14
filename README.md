# Model Teachable Machine

## Cara Mengintegrasikan Model

1. Buka https://teachablemachine.withgoogle.com/
2. Pilih **Image Project** → **Standard image model**
3. Buat dua kelas:
   - `Topi`
   - `Kopiyah`
4. Upload foto latihan masing-masing kelas (minimal 30–50 foto per kelas)
5. Klik **Train Model**
6. Setelah selesai, klik **Export Model**
7. Pilih tab **Tensorflow.js**
8. Pilih **Download my model**
9. Ekstrak file ZIP, lalu salin:
   - `model.json` → ke folder `model/`
   - `metadata.json` → ke folder `model/`
   - `weights.bin` → ke folder `model/`

## Atau Gunakan URL Teachable Machine

Di file `js/script.js`, ubah baris:
```js
const MODEL_URL = "model/";
```
menjadi URL model dari Teachable Machine, contoh:
```js
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/XXXXXXXXX/";
```

## Catatan

Selama file model belum tersedia, website akan berjalan dalam **mode demo**
yang mensimulasikan hasil prediksi untuk keperluan presentasi.
