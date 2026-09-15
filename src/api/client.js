import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const useMock = String(import.meta.env.VITE_USE_MOCK ?? '0') === '1'

export const client = axios.create({ baseURL })

export { baseURL, useMock }