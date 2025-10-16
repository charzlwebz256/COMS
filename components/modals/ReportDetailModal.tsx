import React, { useMemo } from 'react';
import { X, Award, Users, Package, Clock, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ReportType } from '../../pages/Reports';
import { useBeneficiaries, useDonors, useDonations, useProjects, useStaff } from '../../context/DataContext';

interface ReportDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportType: ReportType;
}

const ReportTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{children}</h3>
);

const BeneficiaryReportDetails: React.FC = () => {
    const { beneficiaries } = useBeneficiaries();

    const chartData = useMemo(() => {
        const ageRanges = { '18-25': 0, '26-40': 0, '41-60': 0, '60+': 0 };
        const genderCounts = beneficiaries.reduce((acc, b) => {
            acc[b.gender] = (acc[b.gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        beneficiaries.forEach(b => {
            if (b.age <= 25) ageRanges['18-25']++;
            else if (b.age <= 40) ageRanges['26-40']++;
            else if (b.age <= 60) ageRanges['41-60']++;
            else ageRanges['60+']++;
        });
        
        const beneficiaryAgeData = Object.entries(ageRanges).map(([name, value]) => ({ name, value }));
        const beneficiaryGenderData = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));
        const GENDER_COLORS = { 'Female': '#fb7185', 'Male': '#60a5fa', 'Other': '#a78bfa', 'Prefer not to say': '#9ca3af' };

        return { beneficiaryAgeData, beneficiaryGenderData, GENDER_COLORS };
    }, [beneficiaries]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <ReportTitle>Beneficiary Demographics (Age)</ReportTitle>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData.beneficiaryAgeData} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                        <XAxis type="number" tick={{ fill: 'currentColor' }} className="text-xs" />
                        <YAxis type="category" dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs" width={50} />
                        <Tooltip cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}/>
                        <Bar dataKey="value" name="Beneficiaries" fill="#3b82f6" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card>
                <ReportTitle>Beneficiary Demographics (Gender)</ReportTitle>
                <ResponsiveContainer width="100%" height={250}>
                     <PieChart>
                        <Pie data={chartData.beneficiaryGenderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {chartData.beneficiaryGenderData.map((entry) => <Cell key={`cell-${entry.name}`} fill={chartData.GENDER_COLORS[entry.name as keyof typeof chartData.GENDER_COLORS]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toLocaleString()} individuals`} />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

const DonorReportDetails: React.FC = () => {
    const { donors } = useDonors();
    const { donations } = useDonations();
    
    const chartData = useMemo(() => {
        const topDonorsList = [...donors].sort((a,b) => b.total_donated - a.total_donated).slice(0,5);

        const donorTrendData = Array(6).fill(0).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return { month: d.toLocaleString('default', { month: 'short' }), new: 0, retained: 0 };
        }).reverse();

        const donorJoinMonths: Record<number, string> = {};
        donors.forEach(d => {
            donorJoinMonths[d.id] = new Date(d.joined_date).toLocaleString('default', { month: 'short', year: 'numeric' });
        });

        const monthlyDonors: Record<string, Set<number>> = {};
        donations.forEach(d => {
            const month = new Date(d.date).toLocaleString('default', { month: 'short' });
            if (!monthlyDonors[month]) monthlyDonors[month] = new Set();
            monthlyDonors[month].add(d.donor_id);
        });

        // This is a simplified logic for demo
        donorTrendData.forEach(entry => {
            const donorsThisMonth = monthlyDonors[entry.month];
            if (donorsThisMonth) {
                donorsThisMonth.forEach(donorId => {
                    const joinMonth = new Date(donors.find(d => d.id === donorId)?.joined_date as string).toLocaleString('default', { month: 'short' });
                    if (joinMonth === entry.month) {
                        entry.new++;
                    } else {
                        entry.retained++;
                    }
                })
            }
        });

        return { topDonorsList, donorTrendData };
    }, [donors, donations]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <Card>
                    <ReportTitle>New vs. Retained Donors</ReportTitle>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.donorTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: 'currentColor' }} className="text-xs" />
                            <YAxis tick={{ fill: 'currentColor' }} className="text-xs"/>
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="retained" name="Retained Donors" stroke="#3b82f6" strokeWidth={2} />
                            <Line type="monotone" dataKey="new" name="New Donors" stroke="#22c55e" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <ReportTitle>Top 5 Donors (Lifetime)</ReportTitle>
                    <ul className="space-y-3">
                        {chartData.topDonorsList.map((donor, index) => (
                            <li key={index} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium">{donor.name}</p>
                                    <p className="text-xs text-gray-500">{donor.donor_type}</p>
                                </div>
                                <strong className="text-green-600">${donor.total_donated.toLocaleString()}</strong>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

const FinancialsReportDetails: React.FC = () => {
    const { projects } = useProjects();
    const { donations } = useDonations();
    const { donors } = useDonors();

    const chartData = useMemo(() => {
        const incomeSources: Record<string, number> = { 'One-Time': 0, 'Recurring': 0, 'Major Sponsor': 0 };
        donations.forEach(donation => {
            const donor = donors.find(d => d.id === donation.donor_id);
            if(donor) {
                incomeSources[donor.donor_type] = (incomeSources[donor.donor_type] || 0) + donation.amount;
            }
        });
        const incomeSourcesData = Object.entries(incomeSources).map(([name, value]) => ({name, value}));
        const INCOME_COLORS = { 'One-Time': '#3b82f6', 'Recurring': '#8b5cf6', 'Major Sponsor': '#f59e0b'};

        const projectFinancials = projects.map(p => ({
            name: p.name.split(' ').slice(0,2).join(' '),
            budget: p.budget,
            actual: p.expenses.reduce((sum, e) => sum + e.amount, 0)
        })).slice(0, 5); // Show top 5 for clarity

        return { incomeSourcesData, INCOME_COLORS, projectFinancials };
    }, [projects, donations, donors]);

    return (
        <div className="space-y-6">
            <Card>
                <ReportTitle>Income Sources by Donor Type</ReportTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={chartData.incomeSourcesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                            {chartData.incomeSourcesData.map((entry) => <Cell key={`cell-${entry.name}`} fill={chartData.INCOME_COLORS[entry.name as keyof typeof chartData.INCOME_COLORS]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
            <Card>
                <ReportTitle>Project Financials: Budget vs. Actual Spending</ReportTitle>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData.projectFinancials} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs" />
                        <YAxis tick={{ fill: 'currentColor' }} className="text-xs" tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`}/>
                        <Legend />
                        <Bar dataKey="budget" fill="#a78bfa" name="Budget" />
                        <Bar dataKey="actual" fill="#fb923c" name="Actual Spending" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

const VolunteerReportDetails: React.FC = () => {
    const { staff } = useStaff();
    const topVolunteers = useMemo(() => {
        // Mocking hours as it's not in the data model
        return staff.filter(s => s.role === 'Volunteer')
            .map(v => ({ name: v.name, hours: Math.floor(Math.random() * 150) + 50 }))
            .sort((a,b) => b.hours - a.hours)
            .slice(0, 5);
    }, [staff]);

    return (
         <Card>
            <ReportTitle>Top Volunteers by Hours (YTD)</ReportTitle>
            <ul className="space-y-4">
                {topVolunteers.map((v, i) => (
                    <li key={i}>
                        <div className="flex justify-between text-sm mb-1 font-medium">
                            <span>{i+1}. {v.name}</span>
                            <span>{v.hours} hours</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(v.hours / topVolunteers[0].hours) * 100}%`}}></div>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

const ImpactScoreDetails: React.FC = () => {
    // This part remains mostly static as it's a conceptual calculation
    const impactScoreData = [
      { metric: 'Beneficiary Reach', score: 90, fullMark: 100 },
      { metric: 'Project Completion', score: 85, fullMark: 100 },
      { metric: 'Financial Efficiency', score: 78, fullMark: 100 },
      { metric: 'Volunteer Engagement', score: 95, fullMark: 100 },
      { metric: 'Donor Retention', score: 82, fullMark: 100 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <Card>
                <ReportTitle>Impact Score Components</ReportTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    The Impact Score is a composite metric calculated from key performance indicators across the organization to provide a holistic view of our effectiveness.
                </p>
                <ul className="space-y-3">
                    {impactScoreData.map(item => (
                        <li key={item.metric}>
                             <div className="flex justify-between text-sm mb-1 font-medium">
                                <span>{item.metric}</span>
                                <span>{item.score} / {item.fullMark}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${(item.score / item.fullMark) * 100}%`}}></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
            <Card>
                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={impactScoreData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: 'currentColor' }} className="text-xs" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false}/>
                        <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};


const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ isOpen, onClose, reportType }) => {

    const renderReportContent = () => {
        switch (reportType) {
            case 'beneficiaries': return <BeneficiaryReportDetails />;
            case 'donors': return <DonorReportDetails />;
            case 'financials':
            case 'projects': return <FinancialsReportDetails />;
            case 'volunteers': return <VolunteerReportDetails />;
            case 'impact': return <ImpactScoreDetails />;
            default: return <p>No report data available.</p>;
        }
    };
    
    const getTitle = () => {
        switch (reportType) {
            case 'beneficiaries': return "Detailed Beneficiary Report";
            case 'donors': return "Detailed Donor Report";
            case 'financials':
            case 'projects': return "Detailed Financial & Project Report";
            case 'volunteers': return "Detailed Volunteer Report";
            case 'impact': return "Impact Score Breakdown";
            default: return "Report Details";
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl m-4 transform max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold">{getTitle()}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {renderReportContent()}
                </div>
            </div>
        </div>
    );
};

export default ReportDetailModal;