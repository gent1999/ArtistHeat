import { notFound, redirect } from 'next/navigation';
import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { EditUserForm } from './EditUserForm';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await getSessionToken())!;
  const { admin: currentAdmin } = await api.me(token);
  if (currentAdmin.role !== 'admin') redirect('/admin/articles');

  const [{ admins }, { authors }] = await Promise.all([api.listAdmins(token), api.listAuthors(token)]);
  const user = admins.find((a) => a.id === Number(id));
  if (!user) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit User</h1>
      <EditUserForm user={user} isSelf={user.id === currentAdmin.id} authors={authors} />
    </div>
  );
}
