import React, { useState } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Donors from './pages/Donors';
import Projects from './pages/Projects';
import Beneficiaries from './pages/Beneficiaries';
import Staff from './pages/Staff';
import Events from './pages/Events';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProjectDetails from './pages/ProjectDetails';
import AiAssistantButton from './components/ai/AiAssistantButton';
import AiAssistant from './components/ai/AiAssistant';
import { DonorsProvider, ProjectsProvider, BeneficiariesProvider, StaffProvider, EventsProvider, DonationsProvider } from './context/DataContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';


export type Page = 'Dashboard' | 'Donors' | 'Projects' | 'Beneficiaries' | 'Staff & Volunteers' | 'Events' | 'Reports' | 'Settings' | 'Project Details';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
    const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [beneficiaryProjectIdFilter, setBeneficiaryProjectIdFilter] = useState<number | null>(null);
    const [isAiAssistantOpen, setAiAssistantOpen] = useState(false);


    const navigateToProject = (id: number) => {
        setSelectedProjectId(id);
        setCurrentPage('Project Details');
    };

    const navigateToBeneficiariesForProject = (projectId: number) => {
        setBeneficiaryProjectIdFilter(projectId);
        setCurrentPage('Beneficiaries');
    };

    const clearBeneficiaryFilter = () => {
        setBeneficiaryProjectIdFilter(null);
    }

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentPage('Dashboard'); // Reset page for next login
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Donors':
                return <Donors searchQuery={searchQuery} />;
            case 'Projects':
                return <Projects searchQuery={searchQuery} navigateToProject={navigateToProject} />;
            case 'Beneficiaries':
                return <Beneficiaries 
                            searchQuery={searchQuery} 
                            projectIdFilter={beneficiaryProjectIdFilter}
                            clearProjectFilter={clearBeneficiaryFilter}
                        />;
            case 'Staff & Volunteers':
                return <Staff searchQuery={searchQuery} />;
            case 'Events':
                return <Events searchQuery={searchQuery} />;
            case 'Reports':
                return <Reports />;
            case 'Settings':
                return <Settings onLogout={handleLogout} />;
            case 'Project Details':
                if (selectedProjectId) {
                    return <ProjectDetails 
                                projectId={selectedProjectId} 
                                setCurrentPage={setCurrentPage}
                                navigateToBeneficiaries={navigateToBeneficiariesForProject} 
                            />;
                }
                // Fallback if no project is selected
                setCurrentPage('Projects'); 
                return <Projects searchQuery={searchQuery} navigateToProject={navigateToProject} />;
            default:
                return <Dashboard />;
        }
    };
    
    const renderAuth = () => {
        if (authPage === 'login') {
            return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} onNavigateToSignup={() => setAuthPage('signup')} />
        }
        return <SignupPage onSignupSuccess={() => setIsAuthenticated(true)} onNavigateToLogin={() => setAuthPage('login')} />
    };

    return (
        <ThemeProvider>
            <DonorsProvider>
            <ProjectsProvider>
            <BeneficiariesProvider>
            <StaffProvider>
            <EventsProvider>
            <DonationsProvider>
                {!isAuthenticated ? (
                    renderAuth()
                ) : (
                    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
                        <Sidebar
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            isOpen={sidebarOpen}
                            setOpen={setSidebarOpen}
                        />
                        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                            <Header 
                                sidebarOpen={sidebarOpen}
                                setSidebarOpen={setSidebarOpen}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />
                            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
                                {renderPage()}
                            </main>
                        </div>
                        <AiAssistant
                            isOpen={isAiAssistantOpen}
                            onClose={() => setAiAssistantOpen(false)}
                        />
                         <AiAssistantButton onClick={() => setAiAssistantOpen(true)} isOpen={isAiAssistantOpen} />
                         {sidebarOpen && (
                            <div 
                                onClick={() => setSidebarOpen(false)} 
                                className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                                aria-hidden="true"
                            />
                        )}
                    </div>
                )}
            </DonationsProvider>
            </EventsProvider>
            </StaffProvider>
            </BeneficiariesProvider>
            </ProjectsProvider>
            </DonorsProvider>
        </ThemeProvider>
    );
};

export default App;