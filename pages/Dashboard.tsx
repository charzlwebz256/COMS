import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { DollarSign, Package, Users, Heart, BarChart2, Calendar, Award, CheckCircle, UserPlus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardDetailModal from '../components/modals/DashboardDetailModal';
import { useDonors, useProjects, useBeneficiaries, useEvents, useDonations, useStaff } from '../context/DataContext';

export type DashboardViewType = 'donations' | 'projects' | 'beneficiaries' | 'events' | null;

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change?: string; changeLabel?: string }> = ({ title, value, icon, change, changeLabel = "this month" }) => (
    <Card>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
                {change && (
                    <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change} {changeLabel}</p>
                )}
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                {icon}
            </div>
        </div>
    </Card>
);

const Dashboard: React.FC = () => {
    const [detailView, setDetailView] = useState<DashboardViewType>(null);
    const { donors } = useDonors();
    const { projects } = useProjects();
    const { beneficiaries } = useBeneficiaries();
    const { events } = useEvents();
    const { donations } = useDonations();
    const { staff } = useStaff();
    const userName = 'Charz'; // In a real app, this would come from auth context

    const dashboardData = useMemo(() => {
        // Stats
        const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
        const activeProjects = projects.filter(p => p.status === 'Active').length;
        const totalBeneficiaries = beneficiaries.length;
        const activeDonors = new Set(donations.map(d => d.donor_id)).size;
        
        const stats = [
            { title: "Total Donations", value: `$${totalDonations.toLocaleString()}`, icon: <DollarSign className="text-green-500" />, view: 'donations' as DashboardViewType },
            { title: "Active Projects", value: activeProjects.toString(), icon: <Package className="text-blue-500" />, view: 'projects' as DashboardViewType },
            { title: "Beneficiaries Helped", value: totalBeneficiaries.toLocaleString(), icon: <Users className="text-purple-500" />, view: 'beneficiaries' as DashboardViewType },
            { title: "Active Donors", value: activeDonors.toLocaleString(), icon: <Heart className="text-red-500" />, view: 'donations' as DashboardViewType },
        ];

        // Line Chart Data (last 6 months)
        const donationData = Array(6).fill(0).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return { name: d.toLocaleString('default', { month: 'short' }), donations: 0 };
        }).reverse();
        
        donations.forEach(donation => {
            const month = new Date(donation.date).toLocaleString('default', { month: 'short' });
            const monthData = donationData.find(d => d.name === month);
            if(monthData) monthData.donations += donation.amount;
        });

        // Pie Chart Data
        const projectStatusData = Object.entries(
            projects.reduce((acc, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        ).map(([name, value]) => ({ name, value }));
        const PROJECT_COLORS = { 'Completed': '#4ade80', 'Active': '#3b82f6', 'Pending': '#facc15', 'On Hold': '#9ca3af' };

        // Lists
        const topDonors = [...donors].sort((a,b) => b.total_donated - a.total_donated).slice(0, 4);
        const upcomingEvents = [...events].filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
        
        // Recent Activity
        const recentDonations = [...donations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,2).map(d => ({
            icon: <DollarSign size={16} className="text-green-500"/>,
            text: `New donation of $${d.amount.toLocaleString()} from ${donors.find(donor => donor.id === d.donor_id)?.name || 'a donor'}.`,
            time: d.date, view: 'donations' as DashboardViewType
        }));
        const newProjects = [...projects].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).slice(0,1).map(p => ({
            icon: <Package size={16} className="text-yellow-500"/>,
            text: `Project '${p.name}' is now ${p.status}.`, time: p.start_date, view: 'projects' as DashboardViewType
        }));
        const newStaff = [...staff].sort((a, b) => new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime()).slice(0,1).map(s => ({
            icon: <UserPlus size={16} className="text-purple-500"/>, text: `New ${s.role} ${s.name} joined.`, time: s.joined_date, view: null as DashboardViewType
        }));

        const recentActivities = [...recentDonations, ...newProjects, ...newStaff].sort((a, b) => b.time.localeCompare(a.time)).slice(0,4);


        return { stats, donationData, projectStatusData, PROJECT_COLORS, topDonors, upcomingEvents, recentActivities };
    }, [donors, projects, beneficiaries, events, staff]);
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <>
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{getGreeting()}, {userName}!</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your organization today.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardData.stats.map(stat => (
                    <div 
                        key={stat.title} 
                        onClick={() => setDetailView(stat.view)} 
                        className="cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg rounded-xl"
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && setDetailView(stat.view)}
                        aria-label={`View details for ${stat.title}`}
                    >
                        <StatCard {...stat} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><BarChart2 size={22}/>Donation Overview (Last 6 Months)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.donationData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fill: 'currentColor' }} 
                                className="text-xs" 
                                label={{ value: 'Month', position: 'insideBottom', dy: 10, fill: 'currentColor' }}
                            />
                            <YAxis 
                                tick={{ fill: 'currentColor' }} 
                                className="text-xs" 
                                label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', dy: 10, fill: 'currentColor' }}
                                tickFormatter={(value) => `$${Number(value) / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                    borderColor: 'rgba(55, 65, 81, 1)',
                                    color: '#ffffff',
                                    borderRadius: '0.5rem'
                                }}
                                formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Donations']}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="donations" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <h2 className="text-xl font-semibold mb-4">Project Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dashboardData.projectStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => { const pct = typeof percent === 'number' ? (percent * 100).toFixed(0) : '0';return `${name} ${pct}%`;}}
                            >
                                {dashboardData.projectStatusData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={dashboardData.PROJECT_COLORS[entry.name as keyof typeof dashboardData.PROJECT_COLORS]} />
                                ))}
                            </Pie>
                             <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                    borderColor: 'rgba(55, 65, 81, 1)',
                                    color: '#ffffff',
                                    borderRadius: '0.5rem'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                     <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Award size={22}/> Top Donors</h2>
                     <ul className="space-y-2">
                        {dashboardData.topDonors.map((donor, index) => (
                             <li 
                                 key={index} 
                                 className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                 onClick={() => setDetailView('donations')}
                                 role="button"
                                 tabIndex={0}
                                 onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && setDetailView('donations')}
                                 aria-label={`View details for ${donor.name}`}
                             >
                                 <div>
                                     <p className="font-medium">{donor.name}</p>
                                     <p className="text-sm text-green-500">${donor.total_donated.toLocaleString()} contributed</p>
                                 </div>
                                 <span className="text-lg font-bold text-gray-400 dark:text-gray-500">#{index+1}</span>
                             </li>
                        ))}
                     </ul>
                </Card>
                 <Card className="lg:col-span-1">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Calendar size={22}/> Upcoming Events</h2>
                     <ul className="space-y-2">
                        {dashboardData.upcomingEvents.map((event, index) => (
                             <li 
                                 key={index} 
                                 className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                 onClick={() => setDetailView('events')}
                                 role="button"
                                 tabIndex={0}
                                 onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && setDetailView('events')}
                                 aria-label={`View details for event: ${event.title}`}
                            >
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                                    <Calendar className="text-primary-500" size={20}/>
                                 </div>
                                 <div>
                                     <p className="font-medium">{event.title}</p>
                                     <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                                 </div>
                             </li>
                        ))}
                     </ul>
                </Card>
                 <Card className="lg:col-span-1">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <ul className="space-y-2">
                        {dashboardData.recentActivities.map((activity, index) => (
                            <li 
                                key={index} 
                                className={`flex items-start space-x-3 p-2 rounded-lg ${activity.view ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50' : ''} transition-colors`}
                                onClick={() => activity.view && setDetailView(activity.view)}
                                role={activity.view ? "button" : undefined}
                                tabIndex={activity.view ? 0 : -1}
                                onKeyPress={(e) => activity.view && (e.key === 'Enter' || e.key === ' ') && setDetailView(activity.view)}
                                aria-label={activity.view ? `View details for activity: ${activity.text}` : activity.text}
                            >
                                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                                    {activity.icon}
                                </div>
                                <div>
                                    <p className="text-sm">{activity.text}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(activity.time).toLocaleDateString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
        <DashboardDetailModal 
            isOpen={!!detailView}
            onClose={() => setDetailView(null)}
            viewType={detailView}
        />
        </>
    );
};

export default Dashboard;