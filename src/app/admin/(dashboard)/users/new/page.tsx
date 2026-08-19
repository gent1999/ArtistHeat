import { redirect } from 'next/navigation';
import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { NewUserForm } from './NewUserForm';

export default async function NewUserPage() {
  const token = (await getSessionToken())!;
  const { admin } = await api.me(token);
  if (admin.role !== 'admin') redirect('/admin/articles');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add User</h1>
      <NewUserForm />
    </div>
  );
}
