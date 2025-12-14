<template>
  <div class="admin-users">
    <div class="page-header">
      <h1>Manajemen User</h1>
    </div>

    <div class="filters-bar">
      <input type="text" class="form-control" v-model="search" @input="debouncedFetch" placeholder="Cari user...">
      <select class="form-select" v-model="filterRole" @change="fetchUsers">
        <option value="">Semua Role</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </div>

    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Total Lagu</th>
            <th>Skor</th>
            <th>Bergabung</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">{{ user.role }}</span>
            </td>
            <td>{{ user.total_songs_played || 0 }}</td>
            <td>{{ user.total_score || 0 }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <button class="btn btn-sm btn-ghost" @click="editUser(user)"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-ghost text-danger" @click="confirmDelete(user)" :disabled="user.role === 'admin'"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="loading" class="loading-state"><div class="spinner-border text-primary"></div></div>
      <div v-if="!loading && users.length === 0" class="empty-state">Tidak ada user ditemukan</div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit User</h3>
          <button @click="closeModal"><i class="bi bi-x-lg"></i></button>
        </div>
        <form @submit.prevent="saveUser">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nama</label>
              <input type="text" class="form-control" v-model="form.name" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Role</label>
              <select class="form-select" v-model="form.role">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content modal-sm">
        <div class="modal-body text-center">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
          <h4 class="mt-3">Hapus User?</h4>
          <p class="text-muted">"{{ deletingUser?.name }}" akan dihapus.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showDeleteModal = false">Batal</button>
          <button class="btn btn-danger" @click="deleteUser">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/services/api'

const users = ref([])
const loading = ref(true)
const search = ref('')
const filterRole = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingId = ref(null)
const deletingUser = ref(null)
const saving = ref(false)
const form = ref({ name: '', role: 'user' })

let searchTimeout = null

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await adminAPI.getUsers({ search: search.value, role: filterRole.value, limit: 100 })
    users.value = response.data.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchUsers, 300)
}

const editUser = (user) => {
  editingId.value = user.id
  form.value = { name: user.name, role: user.role }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
}

const saveUser = async () => {
  saving.value = true
  try {
    await adminAPI.updateUser(editingId.value, form.value)
    closeModal()
    fetchUsers()
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

const confirmDelete = (user) => {
  deletingUser.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  try {
    await adminAPI.deleteUser(deletingUser.value.id)
    showDeleteModal.value = false
    fetchUsers()
  } catch (err) {
    console.error(err)
  }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

onMounted(fetchUsers)
</script>

<style scoped>
.admin-users { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header h1 { margin: 0; }
.filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.filters-bar input { max-width: 300px; }
.filters-bar select { max-width: 150px; }
.table-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
.table { width: 100%; margin: 0; color: var(--text-primary); }
.table th, .table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); }
.table th { background: var(--bg-darker); font-weight: 500; font-size: 0.875rem; color: var(--text-muted); text-align: left; }
.table tbody tr:hover { background: rgba(255,255,255,0.02); }
.role-badge { padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; }
.role-badge.admin { background: rgba(245,158,11,0.2); color: var(--warning); }
.role-badge.user { background: rgba(59,130,246,0.2); color: var(--info); }
.loading-state, .empty-state { text-align: center; padding: 2rem; color: var(--text-muted); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal-content { background: var(--bg-card); border-radius: var(--radius-lg); width: 90%; max-width: 450px; }
.modal-sm { max-width: 350px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { margin: 0; }
.modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 0.5rem; }
</style>
