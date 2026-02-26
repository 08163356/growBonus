import axios from 'axios'

const api = axios.create({
  baseURL: '/growbonus/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gb_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gb_token')
      localStorage.removeItem('gb_user')
      window.location.href = '/growbonus/login'
    }
    return Promise.reject(error)
  }
)

export function getImageUrl(filename: string) {
  if (!filename) return ''
  if (filename.startsWith('http')) return filename
  return `/growbonus/uploads/${filename}`
}

export default api
