'use client'

import { useState } from 'react'
import { LoginDto, ApiResponse, validateEmail } from '@shared'
import axios from 'axios'

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(formData.email)) {
      setMessage('Please enter a valid email')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await axios.post<ApiResponse>(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/login`, formData)
      
      if (response.data.success) {
        setMessage('Login successful!')
      } else {
        setMessage(response.data.message || 'Login failed')
      }
    } catch (err) {
      setMessage('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          placeholder="Email (try: admin@example.com)"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Password (try: password123)"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      {message && (
        <div className={`p-2 rounded ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
    </form>
  )
}