import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { NewsletterComposeForm } from './NewsletterComposeForm';
import { NewsletterSubscriberTable } from './NewsletterSubscriberTable';

export default async function AdminNewsletterPage() {
  const token = (await getSessionToken())!;
  const [{ subscribers, count, activeCount }, { sends }] = await Promise.all([
    api.listSubscribers(token),
    api.listNewsletterSends(token),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-6 text-2xl font-bold">Newsletter</h1>
        <NewsletterComposeForm activeCount={activeCount} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Send History</h2>
          <span className="text-xs text-neutral-500">{sends.length} campaigns</span>
        </div>
        {sends.length === 0 ? (
          <p className="text-sm text-neutral-500">No newsletters sent yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500">
                <th className="py-2 font-medium">Subject</th>
                <th className="py-2 font-medium">Recipients</th>
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {sends.map((send) => (
                <tr key={send.id} className="border-b border-neutral-100">
                  <td className="py-2">
                    <div className="flex items-center gap-3">
                      {send.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={send.imageUrl} alt="" className="h-8 w-8 shrink-0 object-cover" />
                      ) : null}
                      <span>{send.subject}</span>
                    </div>
                  </td>
                  <td className="py-2">{send.recipientCount}</td>
                  <td className="py-2">
                    <span
                      className={
                        send.isTest
                          ? 'bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700'
                          : 'bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                      }
                    >
                      {send.isTest ? 'Test' : 'Live'}
                    </span>
                  </td>
                  <td className="py-2 text-neutral-600">{formatDate(send.sentAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Subscribers</h2>
          <div className="flex gap-2 text-xs">
            <span className="bg-green-100 px-2 py-0.5 font-medium text-green-700">{activeCount} active</span>
            <span className="bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600">{count - activeCount} inactive</span>
          </div>
        </div>
        <NewsletterSubscriberTable subscribers={subscribers} />
      </div>
    </div>
  );
}
