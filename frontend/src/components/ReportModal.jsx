import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

export default function ReportModal({ reportedType, reportedId, title, isOpen, onClose }) {
  if (!isOpen) return null;

  const [reason, setReason] = useState('Incorrect photos / rent');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/reports', {
        reported_type: reportedType,
        reported_id: reportedId,
        reason,
        details: details.trim() || undefined
      });
      toast.success("Report submitted to our moderation team for review.");
      onClose();
    } catch (err) {
      toast.error("Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-amber-500 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Report {reportedType === 'listing' ? 'Property' : 'User'}
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">{title}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="Incorrect photos / rent">Incorrect photos / rent details</option>
              <option value="Fake or duplicate listing">Fake or duplicate listing</option>
              <option value="Host unreachable or unresponsive">Host unreachable or unresponsive</option>
              <option value="Harassment or inappropriate behavior">Harassment or inappropriate behavior</option>
              <option value="Other concern">Other concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              rows="3"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any context that will help our community moderators investigate."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-soft transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

