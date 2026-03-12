import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { studentAPI, roomAPI, examAPI, allocationAPI } from '../services/api';
import Stats from '../components/Dashboard/Stats';
import Charts from '../components/Dashboard/Charts';
import toast from 'react-hot-toast';

const statusConfig = {
  allocated: { label: 'Allocated', cls: 'badge-blue' },
  present: { label: 'Present', cls: 'badge-green' },
  absent: { label: 'Absent', cls: 'badge-red' },
  default: { label: 'Pending', cls: 'badge-gray' },
};

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0, totalRooms: 0, totalExams: 0, totalAllocations: 0,
    recentAllocations: [], upcomingExams: []
  });

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsRes, roomsRes, examsRes, allocationsRes] = await Promise.all([
        studentAPI.getAll(), roomAPI.getAll({ isActive: true }),
        examAPI.getAll({ status: 'scheduled' }), allocationAPI.getAll()
      ]);
      setStats({
        totalStudents: studentsRes.data.count || 0,
        totalRooms: roomsRes.data.count || 0,
        totalExams: examsRes.data.count || 0,
        totalAllocations: allocationsRes.data.count || 0,
        recentAllocations: allocationsRes.data.data?.slice(0, 5) || [],
        upcomingExams: examsRes.data.data?.slice(0, 5) || []
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Students', value: stats.totalStudents, icon: UsersIcon, change: '+12%', changeType: 'increase', bgColor: 'bg-blue-500' },
    { name: 'Available Rooms', value: stats.totalRooms, icon: BuildingOfficeIcon, change: '+4%', changeType: 'increase', bgColor: 'bg-green-500' },
    { name: 'Scheduled Exams', value: stats.totalExams, icon: AcademicCapIcon, change: '+2%', changeType: 'increase', bgColor: 'bg-purple-500' },
    { name: 'Total Allocations', value: stats.totalAllocations, icon: ClipboardDocumentCheckIcon, change: '+8%', changeType: 'increase', bgColor: 'bg-yellow-500' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-200 border-t-primary-600" />
        <p className="text-sm text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back — here's what's happening today.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn-secondary text-xs gap-1.5 py-2"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <Stats stats={statCards} />

      {/* Charts */}
      <Charts data={stats} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Allocations */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Recent Allocations</h2>
            <span className="badge-blue badge">{stats.recentAllocations.length} total</span>
          </div>
          {stats.recentAllocations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No allocations yet</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {stats.recentAllocations.map((a) => {
                const sc = statusConfig[a.status] || statusConfig.default;
                return (
                  <li key={a._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <UsersIcon className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{a.student?.name || '—'}</p>
                        <p className="text-xs text-gray-400">Room {a.room?.roomNumber} · Seat {a.seatNumber}</p>
                      </div>
                    </div>
                    <span className={sc.cls}>{sc.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Upcoming Exams</h2>
            <span className="badge-yellow badge">{stats.upcomingExams.length} scheduled</span>
          </div>
          {stats.upcomingExams.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No upcoming exams</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {stats.upcomingExams.map((exam) => (
                <li key={exam._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <AcademicCapIcon className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{exam.examName}</p>
                      <p className="text-xs text-gray-400">
                        {exam.subject} · {new Date(exam.examDate).toLocaleDateString()} {exam.startTime}
                      </p>
                    </div>
                  </div>
                  <span className="badge-gray">{exam.totalStudents ?? '—'} students</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;