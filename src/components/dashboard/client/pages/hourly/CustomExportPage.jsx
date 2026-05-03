import { useState, useEffect } from 'react';
import { Download, FileJson, FileText, Table } from 'lucide-react';
import { getHourlyExport, getMyContracts } from '../../../../../services/apiService';
import { toastApiError } from '../../../../../utils/apiErrorToast';
import { toast } from 'react-hot-toast';
import InfinityLoader from '../../../../common/InfinityLoader';
import CustomDropdown from '../../../../ui/CustomDropdown';

const toInputDate = (d) => d.toISOString().split('T')[0];
const defaultFrom = () => { const d = new Date(); d.setDate(d.getDate() - 30); return toInputDate(d); };

export default function CustomExportPage() {
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({ contract_id: '', from: defaultFrom(), to: toInputDate(new Date()), format: 'csv' });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); // JSON preview data

  useEffect(() => {
    getMyContracts()
      .then(r => setContracts(r?.data ?? []))
      .catch(() => { });
  }, []);

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setPreview(null);
  };

  const handleExport = async () => {
    setLoading(true);
    setPreview(null);
    try {
      const params = Object.fromEntries(Object.entries(form).filter(([, v]) => v));
      const response = await getHourlyExport(params);

      if (form.format === 'csv') {
        // Trigger file download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hourly-export-${form.from}-${form.to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV downloaded');
      } else {
        // Show JSON preview
        const data = response.data?.data ?? response.data ?? [];
        setPreview(Array.isArray(data) ? data : [data]);
        toast.success('Data loaded');
      }
    } catch (err) {
      toastApiError(err, 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-secondary border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent/50";

  // Derive table columns from first preview row
  const previewCols = preview?.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Custom Export Console</h1>
        <p className="text-white/40 text-sm mt-1 font-medium">Extract and synthesize operational data into standardized CSV or JSON protocols.</p>
      </div>

      <div className="space-y-8">
        {/* Configuration Interface */}
        <div className="bg-transparent border border-white/10 rounded-2xl p-8 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div>
              <img src="/Icons/icons8-export-64.png" alt="Export" className="w-10 h-10" />
            </div>
            <div>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none mb-1">Configuration</p>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Export Parameters</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Contract Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Operational Contract (Optional)</label>
              <CustomDropdown
                options={[
                  { label: 'All authenticated active contracts', value: '' },
                  ...contracts.map(c => ({ label: c.title || `Contract #${c.id}`, value: c.id }))
                ]}
                value={form.contract_id}
                onChange={(val) => {
                  setForm(p => ({ ...p, contract_id: val }));
                  setPreview(null);
                }}
                className="w-full"
              />
            </div>

            {/* Date Range Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Temporal Origin (From)</label>
                <input type="date" value={form.from} onChange={set('from')} className="w-full bg-transparent border border-white/10 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-accent/50 transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Temporal Termination (To)</label>
                <input type="date" value={form.to} onChange={set('to')} className="w-full bg-transparent border border-white/10 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-accent/50 transition-all font-medium" />
              </div>
            </div>

            {/* Format Protocol */}
            <div className="space-y-3">
              <label className="block text-[10px] text-white/30 uppercase font-bold tracking-wider">Data Protocol Format</label>
              <div className="flex gap-4">
                {[
                  { value: 'csv', label: 'CSV Data Stream', Icon: FileText },
                  { value: 'json', label: 'JSON Logic Array', Icon: FileJson },
                ].map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setForm(p => ({ ...p, format: value })); setPreview(null); }}
                    className={`flex items-center justify-center gap-3 flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${form.format === value
                        ? 'bg-accent/10 border-accent/40 text-accent shadow-lg shadow-accent/10'
                        : 'bg-white/5 border-white/10 text-white/20 hover:text-white/60'
                      }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <><InfinityLoader size={20} /> Synthesizing Data Stream...</>
                ) : (
                  <><Download size={18} /> {form.format === 'csv' ? 'Execute CSV Extraction' : 'Initialize Data Preview'}</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Data Stream Preview */}
        {preview && (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-accent">
                <Table size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Preview Stream</span>
              </div>
              <span className="text-white/20 text-[9px] font-black tracking-widest uppercase">{preview.length} Verified Data Nodes</span>
            </div>

            <div className="bg-transparent border border-white/10 rounded-2xl overflow-auto max-h-[480px]">
              {previewCols.length > 0 ? (
                <table className="w-full text-sm min-w-max border-collapse">
                  <thead className="sticky top-0 z-10 bg-primary/95 backdrop-blur-md border-b border-white/10">
                    <tr>
                      {previewCols.map(col => (
                        <th key={col} className="px-6 py-4 text-left text-[9px] text-white/20 font-black uppercase tracking-widest whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {preview.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-all">
                        {previewCols.map(col => (
                          <td key={col} className="px-6 py-4 text-white/60 text-xs font-medium whitespace-nowrap max-w-[240px] truncate">
                            {row[col] == null ? <span className="opacity-20">—</span> : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">No data nodes returned for this protocol.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
