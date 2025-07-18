import UserForm from '@/components/UserForm';
import UserList from '@/components/UserList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Robot Next.js App
          </h1>
          <p className="text-lg text-gray-600">
            Full-stack Next.js application with MongoDB integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <UserForm />
          </div>
          <div>
            <UserList />
          </div>
        </div>
      </div>
    </main>
  );
}
