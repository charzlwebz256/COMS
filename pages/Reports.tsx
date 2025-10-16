import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { Download, TrendingUp, TrendingDown, Users, Package, Clock, Target, MapPin, FileSpreadsheet } from 'lucide-react';
import ReportDetailModal from '../components/modals/ReportDetailModal';
import { useDonations, useProjects, useBeneficiaries, useStaff, useDonors, useEvents } from '../context/DataContext';

// Define the type for the report being viewed
export type ReportType = 'beneficiaries' | 'projects' | 'volunteers' | 'donors' | 'financials' | 'impact' | null;

const Reports: React.FC = () => {
    const [viewingReport, setViewingReport] = useState<ReportType>(null);

    const { donations } = useDonations();
    const { projects } = useProjects();
    const { beneficiaries } = useBeneficiaries();
    const { staff } = useStaff();
    const { donors } = useDonors();
    const { events } = useEvents();

    // Memoize aggregated data calculation
    const reportData = useMemo(() => {
        const totalBeneficiaries = beneficiaries.length;
        const activeProjects = projects.filter(p => p.status === 'Active').length;
        const completedProjects = projects.filter(p => p.status === 'Completed').length;
        // Mocking volunteer hours since it's not in the data model
        const volunteerHours = staff.filter(s => s.role === 'Volunteer').length * 42.5;
        const totalIncome = donations.reduce((sum, d) => sum + d.amount, 0);
        const totalExpenses = projects.reduce((sum, p) => sum + p.expenses.reduce((expSum, e) => expSum + e.amount, 0), 0);
        
        // Simplified impact score calculation for demonstration
        const impactScore = Math.round(
            ( (completedProjects / projects.length) * 30 ) + 
            ( (totalBeneficiaries / 1000) * 20 ) +
            ( (totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0) * 30 ) +
            ( (volunteerHours / 1000) * 20 )
        );

        return {
            totalBeneficiaries,
            activeProjects,
            completedProjects,
            volunteerHours,
            totalIncome,
            totalExpenses,
            impactScore: Math.min(impactScore, 99), // Cap score for demo
        };
    }, [donations, projects, beneficiaries, staff]);

    const ClickableCard: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; ariaLabel: string }> = ({ onClick, children, className, ariaLabel }) => (
        <div
            onClick={onClick}
            className={`cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg rounded-xl ${className}`}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
            aria-label={ariaLabel}
        >
            {children}
        </div>
    );
    
    // --- Data Export Logic ---
    const handleExport = () => {
        const sanitizeValue = (value: any) => {
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            let strValue = String(value);
            if (strValue.search(/("|,|\n)/g) >= 0) {
                strValue = `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
        };

        const convertToCSV = (data: any[]) => {
            if (data.length === 0) return '';
            const headers = Object.keys(data[0]);
            const headerRow = headers.join(',');
            const dataRows = data.map(row => 
                headers.map(header => sanitizeValue(row[header])).join(',')
            );
            return [headerRow, ...dataRows].join('\r\n');
        };

        const downloadFile = (content: string, filename: string, mimeType: string) => {
            const blob = new Blob([content], { type: mimeType });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };

        // Select specific, non-nested fields for clean CSV output
        const donorsForExport = donors.map(({ id, name, email, phone, donor_type, address, country, joined_date, total_donated }) => ({ id, name, email, phone, donor_type, address, country, joined_date, total_donated }));
        const projectsForExport = projects.map(({ id, name, description, status, start_date, end_date, budget, total_donations, beneficiaries_helped, location, project_lead_id }) => ({ id, name, description, status, start_date, end_date, budget, total_donations, beneficiaries_helped, location, project_lead_id }));
        const beneficiariesForExport = beneficiaries.map(({ id, name, email, phone, address, joined_date, status, project_ids, age, gender, household_size }) => ({ id, name, email, phone, address, joined_date, status, project_ids, age, gender, household_size }));
        const staffForExport = staff.map(({ id, name, email, role, phone, joined_date, status, address, assigned_project_ids }) => ({ id, name, email, role, phone, joined_date, status, address, assigned_project_ids }));
        const eventsForExport = events.map(({ id, title, description, date, location, budget, project_id, participants }) => ({ id, title, description, date, location, budget, project_id, participants }));
        
    downloadFile(convertToCSV(donorsForExport), 'COMS_Donors_Export.csv', 'text/csv;charset=utf-8;');
    downloadFile(convertToCSV(projectsForExport), 'COMS_Projects_Export.csv', 'text/csv;charset=utf-8;');
    downloadFile(convertToCSV(beneficiariesForExport), 'COMS_Beneficiaries_Export.csv', 'text/csv;charset=utf-8;');
    downloadFile(convertToCSV(staffForExport), 'COMS_Staff_Export.csv', 'text/csv;charset=utf-8;');
    downloadFile(convertToCSV(eventsForExport), 'COMS_Events_Export.csv', 'text/csv;charset=utf-8;');
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                    <button onClick={handleExport} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <FileSpreadsheet size={20} />
                        <span>Export All Data</span>
                    </button>
                </div>
                
                {/* 1. Impact Dashboard */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Impact Dashboard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <ClickableCard onClick={() => setViewingReport('impact')} ariaLabel="View detailed impact score calculation">
                            <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center bg-primary-50 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-800 h-full">
                                <Target size={32} className="text-primary-500 mb-2"/>
                                <h3 className="text-lg font-semibold">Impact Score</h3>
                                <p className="text-5xl font-bold text-primary-500">{reportData.impactScore}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Based on reach & outcomes</p>
                            </Card>
                        </ClickableCard>
                        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <ClickableCard onClick={() => setViewingReport('beneficiaries')} ariaLabel="View detailed beneficiary data">
                                <Card className="flex items-center gap-4 h-full">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full"><Users size={24} className="text-blue-500" /></div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Beneficiaries</p>
                                        <p className="text-2xl font-bold">{reportData.totalBeneficiaries.toLocaleString()}</p>
                                    </div>
                                </Card>
                            </ClickableCard>
                            <ClickableCard onClick={() => setViewingReport('projects')} ariaLabel="View detailed project data">
                                <Card className="flex items-center gap-4 h-full">
                                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full"><Package size={24} className="text-yellow-500" /></div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Projects Status</p>
                                        <p className="text-xl font-bold">{reportData.activeProjects} Active / {reportData.completedProjects} Completed</p>
                                    </div>
                                </Card>
                            </ClickableCard>
                            <ClickableCard onClick={() => setViewingReport('volunteers')} ariaLabel="View detailed staff and volunteer data">
                                <Card className="flex items-center gap-4 h-full">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full"><Clock size={24} className="text-purple-500" /></div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Volunteer Hours Logged</p>
                                        <p className="text-2xl font-bold">{Math.round(reportData.volunteerHours).toLocaleString()}</p>
                                    </div>
                                </Card>
                            </ClickableCard>
                             <Card className="space-y-2">
                                 <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
                                    <p className="font-bold text-green-500 flex items-center gap-1"><TrendingUp size={16}/>${(reportData.totalIncome / 1000).toFixed(1)}k</p>
                                </div>
                                 <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                                    <p className="font-bold text-red-500 flex items-center gap-1"><TrendingDown size={16}/>${(reportData.totalExpenses / 1000).toFixed(1)}k</p>
                                </div>
                             </Card>
                        </div>
                    </div>
                </section>

                {/* 2. Financial Reports */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Financial Reports</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ClickableCard onClick={() => setViewingReport('donors')} ariaLabel="View detailed donation data">
                            <Card className="h-full">
                                <h3 className="font-semibold mb-2">Donation Types</h3>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Click to see a detailed breakdown of recurring vs. one-time donations.</p>
                            </Card>
                        </ClickableCard>
                        <ClickableCard onClick={() => setViewingReport('financials')} ariaLabel="View planned vs actual spending by project">
                            <Card className="h-full">
                                 <h3 className="font-semibold mb-2">Planned vs. Actual Spending</h3>
                                 <p className="text-center text-sm text-gray-500 dark:text-gray-400">Click for a project-by-project financial overview.</p>
                            </Card>
                        </ClickableCard>
                        <ClickableCard onClick={() => setViewingReport('financials')} ariaLabel="View expense breakdown by project">
                            <Card className="h-full">
                                <h3 className="font-semibold mb-2">Expense Breakdown</h3>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Click to view detailed expense reports and cost categories.</p>
                            </Card>
                        </ClickableCard>
                    </div>
                </section>
                
                {/* 3. Donor Reports */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Donor Reports</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ClickableCard onClick={() => setViewingReport('donors')} ariaLabel="View detailed donation trends" className="lg:col-span-2">
                            <Card className="h-full">
                                <h3 className="font-semibold mb-2">Donation Trends (Last 6 Months)</h3>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Click to explore detailed donation trends and analytics.</p>
                            </Card>
                        </ClickableCard>
                        <ClickableCard onClick={() => setViewingReport('donors')} ariaLabel="View top donors">
                            <Card className="h-full">
                                 <h3 className="font-semibold mb-2">Top Donors & Engagement</h3>
                                 <p className="text-center text-sm text-gray-500 dark:text-gray-400">Click for a deep dive into donor loyalty and retention rates.</p>
                            </Card>
                        </ClickableCard>
                    </div>
                </section>
                
                {/* 4. Beneficiary Reports */}
                <section>
                     <h2 className="text-2xl font-semibold mb-4">Beneficiary Reports</h2>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ClickableCard onClick={() => setViewingReport('beneficiaries')} ariaLabel="View assistance provided to beneficiaries">
                            <Card className="h-full">
                                <h3 className="font-semibold mb-2">Assistance Provided</h3>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Click to see a detailed breakdown of support types.</p>
                            </Card>
                        </ClickableCard>
                        <ClickableCard onClick={() => setViewingReport('beneficiaries')} ariaLabel="View geographic distribution of beneficiaries">
                            <Card className="h-full">
                                <h3 className="font-semibold mb-2 flex items-center gap-2 justify-center"><MapPin size={20}/> Geographic Distribution</h3>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Click to visualize where your impact is greatest.</p>
                            </Card>
                        </ClickableCard>
                        <Card>
                            <h3 className="font-semibold mb-2">Beneficiary Satisfaction</h3>
                            <div className="text-center my-4">
                                <p className="text-5xl font-bold text-green-500">9.2<span className="text-2xl text-gray-400">/10</span></p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Based on recent surveys</p>
                            </div>
                        </Card>
                     </div>
                </section>
            </div>
            <ReportDetailModal 
                isOpen={!!viewingReport} 
                onClose={() => setViewingReport(null)} 
                reportType={viewingReport} 
            />
        </>
    );
};

export default Reports;