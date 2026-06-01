import { useState, useEffect } from 'react';
import { getHourlyExport, getMyContracts, getHiredFreelancers } from '../../../../../services/apiService';
import { toastApiError } from '../../../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../../../common/InfinityLoader';
import CustomDropdown from '../../../../ui/CustomDropdown';

const toInputDate = (d) => d.toISOString().split('T')[0];
const defaultFrom = () => { const d = new Date(); d.setDate(d.getDate() - 30); return toInputDate(d); };

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const PROJECT_TYPE_OPTIONS = [
  { label: 'All types', value: '' },
  { label: 'Hourly', value: 'HOURLY' },
  { label: 'Fixed Price', value: 'FIXED' },
];

const INCLUDE_OPTIONS = [
  { id: 'timesheets', label: 'Timesheets' },
  { id: 'work_diary', label: 'Work Diary' },
  { id: 'payments', label: 'Payments' },
  { id: 'milestones', label: 'Milestones' },
];

export default function CustomExportPage() {
  const [contracts, setContracts] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contract_id: '',
    freelancer_id: '',
    status: '',
    project_type: '',
    from: defaultFrom(),
    to: toInputDate(new Date()),
    include: ['timesheets', 'work_diary', 'payments'],
    notes: '',
  });

  useEffect(() => {
    getMyContracts()
      .then(r => setContracts(r?.data ?? []))
      .catch(() => {});
    getHiredFreelancers()
      .then(r => {
        const list = r?.data ?? r ?? [];
        const seen = new Set();
        const unique = list.filter(c => {
          const fid = c.freelancer?.user_id || c.freelancer_id;
          if (!fid || seen.has(fid)) return false;
          seen.add(fid); return true;
        });
        setFreelancers(unique);
      })
      .catch(() => {});
  }, []);

  const set = (field) => (val) => setForm(p => ({ ...p, [field]: val }));
  const setDate = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const toggleInclude = (id) => {
    setForm(p => ({
      ...p,
      include: p.include.includes(id) ? p.include.filter(x => x !== id) : [...p.include, id],
    }));
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries({ contract_id: form.contract_id, freelancer_id: form.freelancer_id, status: form.status, from: form.from, to: form.to, format: 'json' })
          .filter(([, v]) => v)
      );
      const response = await getHourlyExport(params);
      const data = response.data?.data ?? response.data ?? [];
      const rows = Array.isArray(data) ? data : [data];

      const cols = rows.length > 0 ? Object.keys(rows[0]) : [];
      const tableRows = rows.length > 0
        ? rows.map(row =>
            `<tr>${cols.map(c => `<td style="padding:8px 14px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#374151;white-space:nowrap">${row[c] == null ? '—' : String(row[c])}</td>`).join('')}</tr>`
          ).join('')
        : `<tr><td colspan="${cols.length || 1}" style="padding:24px;text-align:center;color:#9ca3af;font-size:12px">No data found for the selected filters.</td></tr>`;

      const selectedFreelancer = freelancers.find(c => (c.freelancer?.user_id || c.freelancer_id) === form.freelancer_id);
      const freelancerName = selectedFreelancer ? (selectedFreelancer.freelancer?.name || 'Selected Freelancer') : 'All Freelancers';
      const contractName = form.contract_id
        ? (contracts.find(c => c.id === form.contract_id)?.job?.title || contracts.find(c => c.id === form.contract_id)?.title || 'Selected Contract')
        : 'All Contracts';

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Export Report — Connect Freelance</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #111827; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6; }
    .logo { font-size: 22px; font-weight: 800; color: #0ea5e9; letter-spacing: -0.03em; }
    .meta { text-align: right; }
    .meta p { font-size: 11px; color: #6b7280; margin-top: 2px; }
    h1 { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; }
    .summary-card .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; font-weight: 700; margin-bottom: 4px; }
    .summary-card .value { font-size: 16px; font-weight: 800; color: #111827; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; font-weight: 700; margin-bottom: 10px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead tr { background: #f3f4f6; }
    th { padding: 10px 14px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; font-weight: 700; border-bottom: 1px solid #e5e7eb; }
    tbody tr:hover { background: #f9fafb; }
    .notes { margin-top: 28px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
    .notes .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; font-weight: 700; margin-bottom: 6px; }
    .notes p { font-size: 12px; color: #374151; line-height: 1.6; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">connect</div>
      <h1 style="margin-top:8px">Hourly Work Export Report</h1>
    </div>
    <div class="meta">
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p><strong>Period:</strong> ${form.from} → ${form.to}</p>
      <p><strong>Contract:</strong> ${contractName}</p>
      <p><strong>Freelancer:</strong> ${freelancerName}</p>
      ${form.status ? `<p><strong>Status:</strong> ${form.status}</p>` : ''}
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="label">Total Records</div>
      <div class="value">${rows.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Hours</div>
      <div class="value">${rows.reduce((s, r) => s + (parseFloat(r.total_hours || r.hours || 0)), 0).toFixed(1)}h</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Amount</div>
      <div class="value">₹${rows.reduce((s, r) => s + (parseFloat(r.total_amount || r.amount || 0)), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
    </div>
    <div class="summary-card">
      <div class="label">Included Sections</div>
      <div class="value" style="font-size:12px">${form.include.join(', ')}</div>
    </div>
  </div>

  ${cols.length > 0 ? `
  <div class="section-title">Data Records</div>
  <table>
    <thead><tr>${cols.map(c => `<th>${c.replace(/_/g, ' ')}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>` : '<p style="color:#9ca3af;font-size:13px;text-align:center;padding:40px 0">No records found for the selected filters.</p>'}

  ${form.notes ? `
  <div class="notes">
    <div class="label">Notes</div>
    <p>${form.notes}</p>
  </div>` : ''}

  <div class="footer">
    <span>Connect Freelance Platform · connectfreelance.in</span>
    <span>Confidential — For internal use only</span>
  </div>
</body>
</html>`;

      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 600);
      toast.success('PDF ready — use "Save as PDF" in the print dialog.');
    } catch (err) {
      toastApiError(err, 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto mt-2 pb-12 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* TITLE */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Export Report</h1>
        <p className="text-slate-500 dark:text-white/40 text-[11px] sm:text-sm mt-1 font-medium leading-relaxed max-w-2xl">
          Export your hourly work data as a PDF report with custom filters.
        </p>
      </div>

      {/* ROW 1 — Contract, Freelancer, Status in one line */}
      <div className="rounded-xl p-3 sm:p-4">
        <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em] mb-3">Filters</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-2">Contract</p>
            <CustomDropdown
              options={[
                { label: 'All contracts', value: '' },
                ...contracts.map(c => ({ label: c.job?.title || c.title || `Contract #${c.id.substring(0, 8)}`, value: c.id }))
              ]}
              value={form.contract_id}
              onChange={set('contract_id')}
              className="w-full"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-2">Hired Freelancer</p>
            <CustomDropdown
              options={[
                { label: 'All freelancers', value: '' },
                ...freelancers.map(c => {
                  const name = c.freelancer?.name || c.freelancer?.profiles?.name || 'Freelancer';
                  const fid = c.freelancer?.user_id || c.freelancer_id;
                  return { label: name, value: fid };
                })
              ]}
              value={form.freelancer_id}
              onChange={set('freelancer_id')}
              className="w-full"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-2">Status</p>
            <CustomDropdown
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={set('status')}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* ROW 2 — Date Range + Project Type */}
      <div className="rounded-xl p-3 sm:p-4">
        <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em] mb-3">Date Range &amp; Type</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-2">From</p>
            <input
              type="date"
              value={form.from}
              onChange={setDate('from')}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 rounded px-4 py-3.5 text-sm text-slate-900 dark:text-white transition-all [color-scheme:dark]"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-2">To</p>
            <input
              type="date"
              value={form.to}
              onChange={setDate('to')}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 rounded px-4 py-3.5 text-sm text-slate-900 dark:text-white transition-all [color-scheme:dark]"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-2">Project Type</p>
            <CustomDropdown
              options={PROJECT_TYPE_OPTIONS}
              value={form.project_type}
              onChange={set('project_type')}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* ROW 3 — Include Sections */}
      <div className="rounded-xl p-3 sm:p-4">
        <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em] mb-3">Include in Report</p>
        <div className="flex flex-wrap gap-3">
          {INCLUDE_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleInclude(id)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                form.include.includes(id)
                  ? 'border-accent text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:border-accent/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ROW 4 — Notes */}
      <div className="rounded-xl p-3 sm:p-4">
        <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em] mb-3">Notes (optional)</p>
        <textarea
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          rows={3}
          placeholder="Add any notes or context to include in the exported report..."
          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 transition-all resize-none leading-relaxed"
        />
      </div>

      {/* EXPORT BUTTON */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-slate-200 dark:border-white/5 pt-8">
        <button
          onClick={handleExportPDF}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 bg-accent text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <><InfinityLoader fullScreen={false} text="" /> Generating...</>
          ) : (
            'Export as PDF'
          )}
        </button>
      </div>

    </div>
  );
}
