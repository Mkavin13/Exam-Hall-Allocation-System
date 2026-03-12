import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: <span className="text-gray-900">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Charts({ data }) {
  const departmentData = [
    { name: 'CSE', students: 120 },
    { name: 'ECE', students: 98 },
    { name: 'EEE', students: 86 },
    { name: 'MECH', students: 75 },
    { name: 'CIVIL', students: 65 },
    { name: 'AIML', students: 55 },
    { name: 'AIDS', students: 50 },
  ];

  const roomUtilizationData = [
    { name: 'Room 101', value: 30 },
    { name: 'Room 102', value: 25 },
    { name: 'Room 103', value: 35 },
    { name: 'Room 104', value: 20 },
  ];

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Bar Chart */}
      <div className="card animate-fade-in-up">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Students by Department</h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution across departments</p>
          </div>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="students" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Students" />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Room Utilization</h3>
            <p className="text-xs text-gray-400 mt-0.5">Occupancy per room</p>
          </div>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roomUtilizationData}
                cx="45%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={90}
                innerRadius={35}
                dataKey="value"
              >
                {roomUtilizationData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Charts;