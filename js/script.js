
"use strict";

/* =====================================
   JEJAK KEBAIKAN - JAVASCRIPT
===================================== */

/**
 * Struktur data pesan kebaikan.
 * @typedef {Object} GoodnessMessage
 * @property {number} id
 * @property {string} nama
 * @property {string} kategori
 * @property {string} isi
 * @property {string} tanggal
 */

document.addEventListener("DOMContentLoaded", function () {

  const STORAGE_KEY = "jejakKebaikan";

  // MENU NAVIGASI
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("show");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("show");
      });
    });
  }

  // FUNGSI STATUS FORMULIR

  /**
   * @param {string} message
   * @param {"error" | "success"} type
   */
  function showStatus(message, type) {
    const status = document.getElementById("formStatus");

    if (!status) return;

    status.textContent = message;
    status.className = "form-status " + type;
  }

  // DATA PESAN

  /**
   * @returns {GoodnessMessage[]}
   */
  function getMessages() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);

      if (!data) return [];

      const messages = JSON.parse(data);

      return Array.isArray(messages) ? messages : [];

    } catch (error) {
      console.error("Gagal membaca data pesan:", error);
      return [];
    }
  }

  /**
   * @param {GoodnessMessage[]} messages
   * @returns {boolean}
   */
  function saveMessages(messages) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages)
      );

      return true;

    } catch (error) {
      console.error("Gagal menyimpan pesan:", error);
      return false;
    }
  }

  // TAMPILKAN PESAN

  const messagesList = document.getElementById("messagesList");
  let activeCategory = "Semua";

  function renderMessages() {
    if (!messagesList) return;

    /** @type {GoodnessMessage[]} */
    const messages = getMessages();

    const filteredMessages = messages.filter(function (message) {
      return activeCategory === "Semua" ||
        message.kategori === activeCategory;
    });

    messagesList.innerHTML = "";

    if (filteredMessages.length === 0) {

      messagesList.innerHTML = `
        <div class="empty-message">
          <span>💬</span>
          <p>Belum ada pesan. Jadilah orang pertama yang membagikan kebaikan! 💚</p>
        </div>
      `;

    } else {

      filteredMessages.slice().reverse().forEach(function (message) {

        const card = document.createElement("article");
        card.className = "message-card";

        const top = document.createElement("div");
        top.className = "message-card-top";

        const name = document.createElement("h3");
        name.textContent = message.nama || "Anonim";

        const category = document.createElement("span");
        category.className = "message-category";
        category.textContent = message.kategori || "Umum";

        const content = document.createElement("p");
        content.textContent = message.isi || "";

        const date = document.createElement("small");
        date.className = "message-date";
        date.textContent = message.tanggal || "";

        top.appendChild(name);
        top.appendChild(category);

        card.appendChild(top);
        card.appendChild(content);
        card.appendChild(date);

        messagesList.appendChild(card);
      });
    }

    updateStatistics(messages);
  }

  // STATISTIK

  /**
   * @param {GoodnessMessage[]} messages
   */
  function updateStatistics(messages) {

    const total = document.getElementById("totalMessages");
    const semangat = document.getElementById("totalSemangat");
    const terimaKasih = document.getElementById("totalTerimaKasih");
    const harapan = document.getElementById("totalHarapan");

    if (total) {
      total.textContent = messages.length;
    }

    if (semangat) {
      semangat.textContent = messages.filter(
        function (item) {
          return item.kategori === "Semangat";
        }
      ).length;
    }

    if (terimaKasih) {
      terimaKasih.textContent = messages.filter(
        function (item) {
          return item.kategori === "Terima Kasih";
        }
      ).length;
    }

    if (harapan) {
      harapan.textContent = messages.filter(
        function (item) {
          return item.kategori === "Harapan";
        }
      ).length;
    }
  }

  // FILTER KATEGORI

  /** @type {NodeListOf<HTMLElement>} */
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

      const category = button.dataset.category;

      if (!category) return;

      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      activeCategory = category;

      renderMessages();
    });
  });

  // FORMULIR

  /** @type {HTMLFormElement | null} */
  const goodnessForm = document.getElementById("goodnessForm");

  if (goodnessForm) {

    goodnessForm.addEventListener("submit", function (event) {

      event.preventDefault();

      /** @type {HTMLInputElement | null} */
      const namaInput = document.getElementById("namaPengirim");

      /** @type {HTMLSelectElement | null} */
      const kategoriInput = document.getElementById("kategoriPesan");

      /** @type {HTMLTextAreaElement | null} */
      const isiInput = document.getElementById("isiPesan");

      /** @type {HTMLButtonElement | null} */
      const submitButton = document.getElementById("submitButton");

      if (!namaInput || !kategoriInput || !isiInput) {
        showStatus(
          "Elemen formulir tidak ditemukan. Periksa kembali HTML.",
          "error"
        );
        return;
      }

      const nama = namaInput.value.trim();
      const kategori = kategoriInput.value;
      const isi = isiInput.value.trim();

      // VALIDASI FORMULIR

      if (!nama || !kategori || !isi) {
        showStatus("Mohon lengkapi semua formulir.", "error");
        return;
      }

      if (nama.length < 2) {
        showStatus(
          "Nama harus terdiri dari minimal 2 karakter.",
          "error"
        );
        return;
      }

      if (isi.length < 5) {
        showStatus(
          "Pesan terlalu singkat. Tuliskan pesan yang lebih lengkap.",
          "error"
        );
        return;
      }

      // DATA PESAN BARU

      /** @type {GoodnessMessage} */
      const newMessage = {
        id: Date.now(),
        nama: nama,
        kategori: kategori,
        isi: isi,
        tanggal: new Date().toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short"
        })
      };

      const messages = getMessages();
      messages.push(newMessage);

      // SIMPAN PESAN

      const saved = saveMessages(messages);

      if (!saved) {
        showStatus(
          "Pesan gagal disimpan. Silakan coba kembali.",
          "error"
        );
        return;
      }

      // KOSONGKAN FORMULIR

      goodnessForm.reset();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Pesan berhasil dikirim!";
      }

      showStatus(
        "Terima kasih! Pesan kebaikanmu berhasil dikirim. 💚",
        "success"
      );

      // PINDAH KE HALAMAN UTAMA

      setTimeout(function () {
        window.location.href = "index.html#pesan";
      }, 1400);
    });

    // RESET FORMULIR

    goodnessForm.addEventListener("reset", function () {

      const status = document.getElementById("formStatus");

      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }
    });
  }

  // KOSONGKAN PESAN

  const clearButton = document.getElementById("clearMessages");

  if (clearButton) {

    clearButton.addEventListener("click", function () {

      const messages = getMessages();

      if (messages.length === 0) {
        alert("Belum ada pesan yang dapat dihapus.");
        return;
      }

      const confirmation = confirm(
        "Apakah kamu yakin ingin mengosongkan semua pesan pada browser ini?"
      );

      if (confirmation) {

        try {
          localStorage.removeItem(STORAGE_KEY);
          renderMessages();

          alert("Semua pesan berhasil dikosongkan.");

        } catch (error) {
          console.error("Gagal menghapus pesan:", error);
          alert("Pesan gagal dihapus. Silakan coba kembali.");
        }
      }
    });
  }

  // KUTIPAN MOTIVASI BERGANTIAN

  const quotes = [
    {
      text: "Kebaikan kecil dapat membawa perubahan besar.",
      author: "Jejak Kebaikan"
    },
    {
      text: "Jadilah alasan seseorang tersenyum hari ini.",
      author: "Anonim"
    },
    {
      text: "Kata-kata baik dapat memberikan harapan baru.",
      author: "Anonim"
    },
    {
      text: "Berbagi kebaikan tidak akan membuat kita kekurangan.",
      author: "Anonim"
    },
    {
      text: "Mulailah perubahan dari diri sendiri.",
      author: "Anonim"
    }
  ];

  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");

  if (quoteText && quoteAuthor) {

    let quoteIndex = 0;

    setInterval(function () {

      quoteIndex = (quoteIndex + 1) % quotes.length;

      quoteText.style.opacity = "0";

      setTimeout(function () {

        quoteText.textContent = quotes[quoteIndex].text;

        quoteAuthor.textContent =
          "— " + quotes[quoteIndex].author;

        quoteText.style.opacity = "1";

      }, 350);

    }, 5000);
  }

  // PERBARUI DATA JIKA BERUBAH DI TAB LAIN

  window.addEventListener("storage", function (event) {

    if (event.key === STORAGE_KEY) {
      renderMessages();
    }
  });

  // JALANKAN SAAT HALAMAN DIBUKA

  renderMessages();

});
