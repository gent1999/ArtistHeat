import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { DeleteUserButton } from './DeleteUserButton';

export default async function AdminUsersPage() {
  const token = (await getSessionToken())!;
  const { admin: currentAdmin } = await api.me(token);
  if (currentAdmin.role !== 'admin') redirect('/admin/articles');

  const { admins } = await api.listAdmins(token);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link href="/admin/users/new" className="bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          Add User
        </Link>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-500">
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Email</th>
            <th className="py-2 font-medium">Tier</th>
            <th className="py-2 text-right font-medium">Edit</th>
            <th className="py-2 text-right font-medium">Delete</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id} className="border-b border-neutral-100">
              <td className="py-2">
                {admin.name}
                {admin.id === currentAdmin.id ? <span className="ml-2 text-xs text-neutral-400">(you)</span> : null}
              </td>
              <td className="py-2 text-neutral-600">{admin.email}</td>
              <td className="py-2">
                <span
                  className={
                    admin.role === 'admin'
                      ? 'bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700'
                      : 'bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600'
                  }
                >
                  {admin.role}
                </span>
              </td>
              <td className="py-2 text-right">
                <Link href={`/admin/users/${admin.id}/edit`} className="text-xs font-semibold text-red-600 hover:underline">
                  Edit
                </Link>
              </td>
              <td className="py-2 text-right">
                {admin.id === currentAdmin.id ? (
                  <span className="text-xs text-neutral-300">—</span>
                ) : (
                  <DeleteUserButton userId={admin.id} userLabel={admin.email} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
