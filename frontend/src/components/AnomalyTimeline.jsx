import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function AnomalyTimeline({ auditLogs = [] }) {
  const dateMap = {};

  auditLogs.forEach(log => {
    const rawDate = log.transaction?.date;
    if (!rawDate) return;
    const formattedDate = new Date(rawDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    if (!dateMap[formattedDate]) {
      dateMap[formattedDate] = { date: formattedDate, High: 0, Medium: 0, Low: 0 };
    }

    if (log.riskScore === 'High') dateMap[formattedDate].High += 1;
    else if (log.riskScore === 'Medium') dateMap[formattedDate].Medium += 1;
    else dateMap[formattedDate].Low += 1;
  });

  const chartData = Object.values(dateMap).reverse();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm shadow-slate-200/50 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Anomaly & Risk Frequency Timeline
          </h3>
          <p className="text-xs text-slate-500 font-medium">Risk flag distribution across transaction dates</p>
        </div>
      </div>

      <div className="h-48 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" stroke="#64748b" tickLine={false} fontSize={10} />
            <YAxis stroke="#64748b" tickLine={false} fontSize={10} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="High" fill="#e11d48" radius={[4, 4, 0, 0]} name="High Risk" />
            <Bar dataKey="Medium" fill="#d97706" radius={[4, 4, 0, 0]} name="Medium Risk" />
            <Bar dataKey="Low" fill="#059669" radius={[4, 4, 0, 0]} name="Low Risk" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
