import UserList from '@/components/UserList'
import LoginForm from '@/components/LoginForm'

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">My Full-Stack App</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Login</h2>
          <LoginForm />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Users</h2>
          <UserList />
        </div>
      </div>
    </main>
  )
}