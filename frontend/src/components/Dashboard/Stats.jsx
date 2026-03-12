import React from 'react';

const colorMap = {
  'bg-blue-500': { from: '#3b82f6', to: '#1d4ed8', icon: 'text-blue-100', light: 'bg-blue-50', text: 'text-blue-600' },
  'bg-green-500': { from: '#22c55e', to: '#15803d', icon: 'text-green-100', light: 'bg-green-50', text: 'text-green-600' },
  'bg-purple-500': { from: '#a855f7', to: '#7e22ce', icon: 'text-purple-100', light: 'bg-purple-50', text: 'text-purple-600' },
  'bg-yellow-500': { from: '#f59e0b', to: '#b45309', icon: 'text-yellow-100', light: 'bg-amber-50', text: 'text-amber-600' },
};

function Stats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((item, i) => {
        const colors = colorMap[item.bgColor] || colorMap['bg-blue-500'];
        return (
          <div
            key={item.name}
            className="stat-card animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{item.name}</p>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
              </div>
              <div
                className="p-3 rounded-2xl shadow-sm flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
              >
                <item.icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
            </div>
            <div className={`mt-4 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${colors.light} ${colors.text}`}>
              <span>{item.changeType === 'increase' ? '↑' : '↓'}</span>
              <span>{item.change} vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Stats;