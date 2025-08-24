'use client'

import { useState, useEffect } from 'react'
import { User, ApiResponse } from '@shared'
import axios from 'axios'

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get<ApiResponse<User[]>>(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/users`)
      
      if (response.data.success && response.data.data) {
        setUsers(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch users')
      }
    } catch (err) {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading users...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-2">
      {users.map(user => (
        <div key={user.id} className="p-3 border rounded">
          <div className="font-semibold">{user.name}</div>
          <div className="text-gray-600">{user.email}</div>
        </div>
      ))}
    </div>
  )
}