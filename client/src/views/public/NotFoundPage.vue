<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Halaman Tidak Ditemukan</h1>
      <p>Maaf, halaman yang Anda cari tidak ditemukan atau sudah dipindahkan.</p>
      <router-link to="/" class="btn btn-primary">
        <i class="bi bi-house-fill me-2"></i>
        Kembali ke Beranda
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}
</style>
