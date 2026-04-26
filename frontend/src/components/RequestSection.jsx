import RequestRow from './RequestRow';

export default function RequestSection({ title, type, requests, studentId, onUpdate, onDelete, accentClass }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className={`flex items-center gap-2 px-4 py-3 border-b border-slate-200 ${accentClass}`}>
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60">
          {requests.length}
        </span>
      </div>
      {requests.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-400 text-center">No {type} requests yet</p>
      ) : (
        <div className="divide-y divide-slate-100 px-1 py-1">
          {requests.map((req) => (
            <RequestRow
              key={req.id}
              req={req}
              studentId={studentId}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
