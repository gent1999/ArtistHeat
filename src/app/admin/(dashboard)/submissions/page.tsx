import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { SubmissionsTable } from './SubmissionsTable';

export default async function AdminSubmissionsPage() {
  const token = (await getSessionToken())!;
  const { submissions, count } = await api.listSubmissions(token);
  const pendingCount = submissions.filter((s) => s.submissionStatus === 'pending').length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <span className="text-xs text-neutral-500">
          {count} total &middot; {pendingCount} pending
        </span>
      </div>
      <SubmissionsTable submissions={submissions} />
    </div>
  );
}
