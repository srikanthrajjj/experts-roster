import React from 'react';
import { CheckCircle, Send, X } from 'lucide-react';
import type { ITExpert } from '../../types/expert';
import Avatar from './SharedUI';

type SendEmailModalProps = {
  expert: ITExpert | null;
  onClose: () => void;
  onSent?: () => void;
};

function defaultSubject() {
  return 'Invitation to discuss a potential assignment';
}

function defaultBody(expert: ITExpert) {
  const focus = expert.technologyStack[0] ?? expert.skills[0] ?? 'technical';
  return `Dear ${expert.name},\n\nWe are reaching out to discuss a potential assignment aligned with your ${focus} experience.\n\nBest regards,\nUNICEF Experts Roster Team`;
}

export default function SendEmailModal({ expert, onClose, onSent }: SendEmailModalProps) {
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [phase, setPhase] = React.useState<'compose' | 'sending' | 'sent'>('compose');

  React.useEffect(() => {
    if (!expert) return;
    setSubject(defaultSubject());
    setBody(defaultBody(expert));
    setPhase('compose');
  }, [expert]);

  React.useEffect(() => {
    if (phase !== 'sent') return;
    const timer = window.setTimeout(() => {
      onSent?.();
      onClose();
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [phase, onClose, onSent]);

  if (!expert) return null;

  const canSend = subject.trim().length > 0 && body.trim().length > 0 && phase === 'compose';

  const handleSend = () => {
    if (!canSend) return;
    setPhase('sending');
    window.setTimeout(() => setPhase('sent'), 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-email-modal-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h3 id="send-email-modal-title" className="text-lg font-black text-[#0F1B3D]">
              {phase === 'sent' ? 'Email sent' : 'Send Email'}
            </h3>
            <p className="mt-0.5 text-sm font-semibold text-slate-500">
              {phase === 'sent' ? `Message delivered to ${expert.name}` : `Contact ${expert.name}`}
            </p>
          </div>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {phase === 'sent' ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="mt-4 text-lg font-black text-[#0F1B3D]">Email sent</h4>
            <p className="mt-2 max-w-sm text-sm font-semibold text-slate-500">
              Your message to {expert.contact.email} has been sent successfully.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-10 rounded-lg bg-[#0072CE] px-5 text-sm font-black text-white transition hover:bg-[#0055A6]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Avatar expert={expert} size="md" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-[#0F1B3D]">{expert.name}</div>
                  <div className="truncate text-xs font-semibold text-slate-500">{expert.role}</div>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-slate-500">To</span>
                <div className="flex min-h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  {expert.contact.email}
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-slate-500">Subject</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={phase === 'sending'}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/15 disabled:opacity-60"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-slate-500">Message</span>
                <textarea
                  rows={7}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={phase === 'sending'}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold leading-6 outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/15 disabled:opacity-60"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={phase === 'sending'}
                className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend || phase === 'sending'}
                className="flex h-10 items-center gap-2 rounded-lg bg-[#0072CE] px-5 text-sm font-black text-white transition hover:bg-[#0055A6] disabled:opacity-50"
              >
                {phase === 'sending' ? (
                  <>Sending…</>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
