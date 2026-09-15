import { client } from './client'

export function listBills(params) {
  return client.get('/bills', { params }).then(r => r.data)
}
export function getBill(id) {
  return client.get(`/bills/${id}`).then(r => r.data)
}
export function createBill(payload) {
  return client.post('/bills', payload).then(r => r.data)
}
export function updateBill(id, payload) {
  return client.put(`/bills/${id}`, payload).then(r => r.data)
}
export function updateCategory(id, category) {
  return client.patch(`/bills/${id}/category`, { category }).then(r => r.data)
}
export function deleteBill(id) {
  return client.delete(`/bills/${id}`)
}
export function uploadCsv(file) {
  const form = new FormData()
  form.append('file', file)
  return client.post('/bills/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}