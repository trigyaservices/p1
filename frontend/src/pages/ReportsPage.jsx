import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ReportsPage() {
  const { showToast } = useToast();
  const [selectedReport, setSelectedReport] = useState('total-pets');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const reportTypes = [
    { id: 'total-pets', label: '1. Total Pets Census', description: 'Comprehensive registry of all pets ever admitted to the shelter.' },
    { id: 'available-pets', label: '2. Available for Adoption', description: 'Animals currently fit, vaccinated, and ready for public adoption.' },
    { id: 'adopted-pets', label: '3. Adopted Pets Registry', description: 'Permanent records of finalized guardianships with certificate codes.' },
    { id: 'rescue-report', label: '4. Rescue Operations Report', description: 'Emergency field rescues, initial trauma responses, and stabilization logs.' },
    { id: 'adoption-report', label: '5. Adoption Applications Report', description: 'Full pipeline status of all received adoption requests and reviews.' },
    { id: 'vaccination-report', label: '6. Vaccination & Alert Report', description: 'Immunization schedule, upcoming boosters, and overdue health alerts.' },
    { id: 'medical-report', label: '7. Clinical Medical Report', description: 'Veterinary diagnoses, treatment regimens, and medications administered.' },
    { id: 'foster-report', label: '8. Foster Care Placements', description: 'Temporary caregiver placements, duration dates, and return records.' },
    { id: 'monthly-pet-report', label: '9. Monthly Pet Evaluations', description: 'Month-over-month weight tracking, dietary adherence, and health notes.' }
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getReportData(selectedReport);
      if (res.success) {
        setReportData(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedReport]);

  const handleExportCSV = async () => {
    try {
      const blob = await api.getReportData(selectedReport, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('CSV Report downloaded successfully!');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeMeta = reportTypes.find(r => r.id === selectedReport);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Reports & Data Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate, print, and export official records for shelter operations</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs hover:bg-teal-100 transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <span>📥 Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5"
          >
            <span>🖨️ Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {reportTypes.map(rep => (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedReport === rep.id
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {rep.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report View Container */}
      <div id="printable-report" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Printable Header */}
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              Official Shelter Record
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{activeMeta?.label}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{activeMeta?.description}</p>
          </div>

          <div className="text-right text-xs text-slate-400">
            <p><strong>Generated On:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Total Records:</strong> {reportData.length}</p>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <LoadingSpinner text="Compiling dataset..." />
        ) : reportData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No records found for this report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  {Object.keys(reportData[0]).map(key => (
                    <th key={key} scope="col" className="px-4 py-3">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    {Object.values(row).map((val, colIdx) => (
                      <td key={colIdx} className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {val === null || val === undefined ? '—' : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
