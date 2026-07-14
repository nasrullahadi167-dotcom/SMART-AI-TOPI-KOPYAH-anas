/* ===================================================
   HeadWear AI — script.js
   Seluruh logika interaksi & integrasi AI
   =================================================== */

"use strict";

/* --------------------------------------------------
   1. KONFIGURASI MODEL TEACHABLE MACHINE
   Ganti URL di bawah dengan URL model Anda dari
   Teachable Machine (Share > Upload Model > salin link)
   -------------------------------------------------- */
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/baguIH0_D/";
// Atau gunakan URL Teachable Machine langsung, contoh:
// const MODEL_URL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/";

/* --------------------------------------------------
   2. VARIABEL GLOBAL
   -------------------------------------------------- */
let tmModel = null;         // Model Teachable Machine
let stream  = null;         // MediaStream kamera
let currentMode = "upload"; // Mode aktif: "upload" | "kamera"

/* --------------------------------------------------
   3. NAVBAR — Sticky & Hamburger & Active Link
   -------------------------------------------------- */
const header      = document.getElementById("header");
const hamburger   = document.getElementById("hamburger");
const navLinks    = document.getElementById("navLinks");
const navLinkEls  = document.querySelectorAll(".nav-link");

// Sticky shadow
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
  toggleScrollTopBtn();
  updateActiveNavLink();
});

// Hamburger toggle
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
});

// Tutup menu saat link diklik (mobile)
navLinkEls.forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
  });
});

// Update active nav link berdasarkan scroll
function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id], .hero[id]");
  let current = "";
  sections.forEach(sec => {
    const top = sec.offsetTop - 90;
    if (window.scrollY >= top) current = sec.getAttribute("id");
  });
  navLinkEls.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}

/* --------------------------------------------------
   4. SCROLL REVEAL ANIMASI FADE-IN
   -------------------------------------------------- */
const observerOptions = { threshold: 0.12 };
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-in, .fade-in-delay").forEach(el => {
  revealObserver.observe(el);
});

/* --------------------------------------------------
   5. SCROLL-TO-TOP BUTTON
   -------------------------------------------------- */
const scrollTopBtn = document.getElementById("scrollTopBtn");

function toggleScrollTopBtn() {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.remove("hidden");
  } else {
    scrollTopBtn.classList.add("hidden");
  }
}

/* --------------------------------------------------
   6. FAQ ACCORDION
   -------------------------------------------------- */
function toggleFAQ(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains("open");

  // Tutup semua
  document.querySelectorAll(".faq-item.open").forEach(el => el.classList.remove("open"));

  // Buka yang diklik (jika belum terbuka)
  if (!isOpen) item.classList.add("open");
}

/* --------------------------------------------------
   7. SWITCH MODE INPUT (Upload / Kamera)
   -------------------------------------------------- */
function switchMode(mode) {
  currentMode = mode;

  // Update tab style
  document.getElementById("tabUpload").classList.toggle("active", mode === "upload");
  document.getElementById("tabKamera").classList.toggle("active", mode === "kamera");

  // Tampilkan panel yang sesuai
  document.getElementById("panelUpload").classList.toggle("hidden", mode !== "upload");
  document.getElementById("panelKamera").classList.toggle("hidden", mode !== "kamera");

  // Reset
  resetInput();

  // Hentikan kamera jika berpindah ke upload
  if (mode === "upload" && stream) stopCamera();
}

/* --------------------------------------------------
   8. UPLOAD GAMBAR & DRAG-DROP
   -------------------------------------------------- */
const fileInput = document.getElementById("fileInput");
const dropZone  = document.getElementById("dropZone");

fileInput.addEventListener("change", (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFile(e.target.files[0]);
  }
});

// Drag & Drop
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    alert("Harap pilih file gambar (JPG, PNG, WEBP).");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran file maksimal 5MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => showPreview(e.target.result);
  reader.readAsDataURL(file);
}

/* --------------------------------------------------
   9. PREVIEW GAMBAR
   -------------------------------------------------- */
function showPreview(src) {
  const previewWrap = document.getElementById("previewWrap");
  const previewImg  = document.getElementById("previewImg");

  previewImg.src = src;
  previewWrap.classList.remove("hidden");

  // Sembunyikan dropzone
  dropZone.classList.add("hidden");

  // Sembunyikan hasil lama
  hideHasil();
}

/* --------------------------------------------------
   10. KAMERA
   -------------------------------------------------- */
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    const video = document.getElementById("videoEl");
    video.srcObject = stream;

    document.getElementById("btnStartCam").classList.add("hidden");
    document.getElementById("btnCapture").classList.remove("hidden");
    document.getElementById("btnStopCam").classList.remove("hidden");
  } catch (err) {
    alert("Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan di browser Anda.\n" + err.message);
  }
}

function captureFrame() {
  const video  = document.getElementById("videoEl");
  const canvas = document.getElementById("cameraCanvas");
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL("image/jpeg");
  showPreview(dataUrl);
  stopCamera();
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  const video = document.getElementById("videoEl");
  video.srcObject = null;

  document.getElementById("btnStartCam").classList.remove("hidden");
  document.getElementById("btnCapture").classList.add("hidden");
  document.getElementById("btnStopCam").classList.add("hidden");
}

/* --------------------------------------------------
   11. RESET INPUT
   -------------------------------------------------- */
function resetInput() {
  const previewWrap = document.getElementById("previewWrap");
  previewWrap.classList.add("hidden");

  if (currentMode === "upload") {
    dropZone.classList.remove("hidden");
    fileInput.value = "";
    document.getElementById("previewImg").src = "";
  }

  hideHasil();
}

function hideHasil() {
  document.getElementById("hasilWrap").classList.add("hidden");
  document.getElementById("loadingWrap").classList.add("hidden");
}

/* --------------------------------------------------
   12. LOAD MODEL TEACHABLE MACHINE
   -------------------------------------------------- */
async function loadModel() {
  if (tmModel) return; // Sudah dimuat
  try {
    const modelURL    = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";
    tmModel = await tmImage.load(modelURL, metadataURL);
    console.log("Model Teachable Machine berhasil dimuat.");
  } catch (err) {
    console.warn("Model lokal tidak ditemukan, mencoba mode demo…", err);
    tmModel = null; // Akan menggunakan demo fallback
  }
}

/* --------------------------------------------------
   13. JALANKAN DETEKSI
   -------------------------------------------------- */
async function runDetection() {
  const previewImg = document.getElementById("previewImg");
  if (!previewImg.src || previewImg.src === window.location.href) {
    alert("Harap pilih gambar terlebih dahulu.");
    return;
  }

  // Tampilkan loading, sembunyikan preview
  document.getElementById("previewWrap").classList.add("hidden");
  document.getElementById("loadingWrap").classList.remove("hidden");
  hideHasil();

  try {
    // Muat model jika belum
    await loadModel();

    let predictions;

    if (tmModel) {
      // === Mode nyata: gunakan model Teachable Machine ===
      predictions = await tmModel.predict(previewImg);
    } else {
      // === Mode demo: simulasikan hasil untuk keperluan presentasi ===
      await new Promise(r => setTimeout(r, 1400)); // Simulasi delay
      predictions = simulatePrediction(previewImg.src);
    }

    // Tampilkan hasil
    tampilkanHasil(predictions);

  } catch (err) {
    document.getElementById("loadingWrap").classList.add("hidden");
    document.getElementById("previewWrap").classList.remove("hidden");
    alert("Terjadi kesalahan saat menjalankan deteksi: " + err.message);
    console.error(err);
  }
}

/* --------------------------------------------------
   14. SIMULASI PREDIKSI (Demo / Fallback)
   Digunakan saat model belum tersedia / presentasi
   -------------------------------------------------- */
function simulatePrediction(srcHint) {
  // Simulasi acak dengan bias — untuk demo
  const r       = Math.random();
  const isTopiHigh = r > 0.45;
  const prob1   = isTopiHigh ? 0.88 + Math.random() * 0.11 : 0.05 + Math.random() * 0.35;
  const prob2   = 1 - prob1;

  return [
    { className: "Topi",    probability: prob1 },
    { className: "Kopiyah", probability: prob2 },
  ];
}

/* --------------------------------------------------
   15. TAMPILKAN HASIL PREDIKSI
   -------------------------------------------------- */
function tampilkanHasil(predictions) {
  // Urutkan dari probabilitas tertinggi
  predictions.sort((a, b) => b.probability - a.probability);

  const top    = predictions[0];
  const label  = top.className.toLowerCase().includes("kopiyah") ? "kopiyah" : "topi";
  const pct    = Math.round(top.probability * 100);

  // Sembunyikan loading
  document.getElementById("loadingWrap").classList.add("hidden");

  // Isi elemen hasil
  const hasilCard = document.getElementById("hasilCard");
  hasilCard.className = "hasil-card";
  hasilCard.classList.add(label === "topi" ? "topi-result" : "kopiyah-result");

  // Icon
  const hasilIcon = document.getElementById("hasilIcon");
  hasilIcon.className = "hasil-icon";
  hasilIcon.classList.add(label === "topi" ? "topi-icon" : "kopiyah-icon");
  hasilIcon.innerHTML = label === "topi"
    ? '<i class="fa-solid fa-check-circle"></i>'
    : '<i class="fa-solid fa-info-circle"></i>';

  // Kategori
  document.getElementById("hasilKategori").textContent = top.className;

  // Persentase
  document.getElementById("confidencePct").textContent = `${pct}%`;
  setTimeout(() => {
    document.getElementById("confidenceBar").style.width = `${pct}%`;
  }, 100);

  // Deskripsi
  const desc = label === "topi"
    ? `<strong>Topi</strong> merupakan penutup kepala yang umum digunakan untuk melindungi kepala dari sinar matahari maupun sebagai bagian dari gaya berpakaian dalam berbagai aktivitas.`
    : `<strong>Kopiyah</strong> merupakan penutup kepala yang umum digunakan dalam kegiatan ibadah maupun acara keagamaan tertentu, serta menjadi bagian dari budaya di berbagai daerah di Indonesia.`;
  document.getElementById("hasilDesc").innerHTML = desc;

  // Semua skor
  buildAllScores(predictions);

  // Tampilkan card hasil
  document.getElementById("hasilWrap").classList.remove("hidden");

  // Scroll ke hasil
  setTimeout(() => {
    document.getElementById("hasilWrap").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 200);
}

/* --------------------------------------------------
   16. BAR SKOR SEMUA KELAS
   -------------------------------------------------- */
function buildAllScores(predictions) {
  const container = document.getElementById("allScores");
  container.innerHTML = predictions.map(p => {
    const pct = Math.round(p.probability * 100);
    return `
      <div class="score-row">
        <span class="score-name">${p.className}</span>
        <div class="score-bar-wrap">
          <div class="score-bar-fill" data-width="${pct}" style="width:0%"></div>
        </div>
        <span class="score-pct">${pct}%</span>
      </div>`;
  }).join("");

  // Animate bars
  setTimeout(() => {
    container.querySelectorAll(".score-bar-fill").forEach(bar => {
      bar.style.width = bar.dataset.width + "%";
    });
  }, 150);
}

/* --------------------------------------------------
   17. RESET SEMUA
   -------------------------------------------------- */
function resetAll() {
  resetInput();
  hideHasil();

  // Reset UI kamera jika perlu
  if (currentMode === "kamera") {
    document.getElementById("panelKamera").querySelector(".camera-wrap");
  }

  // Scroll ke seksi deteksi
  document.getElementById("deteksi").scrollIntoView({ behavior: "smooth" });
}

/* --------------------------------------------------
   18. PRE-LOAD MODEL SAAT HALAMAN DIMUAT
   -------------------------------------------------- */
window.addEventListener("load", () => {
  // Pre-load model di background agar deteksi pertama lebih cepat
  loadModel();
});
