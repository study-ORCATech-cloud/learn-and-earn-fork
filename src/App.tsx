
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/HomePage";
import LearningPathsPage from "./pages/LearningPathsPage";
import CoursesPage from "./pages/CoursesPage";
import ProjectsPage from "./pages/ProjectsPage";
import LearningPathPage from "./pages/LearningPathPage";
import CoursePage from "./pages/CoursePage";
import AboutPage from "./pages/AboutPage";
import SupportPage from "./pages/SupportPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import LabViewerPage from "./pages/LabViewerPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import WalletPage from "./pages/WalletPage";
import GetOrcaCoinsPage from "./pages/GetOrcaCoinsPage";
import { UserProgressProvider } from "./context/UserProgressContext";
import { SearchProvider } from "./context/SearchContext";
import { BackendDataProvider } from "./context/BackendDataContext";
import { AuthProvider } from "./context/AuthContext";
import { OrcaWalletProvider } from "./context/OrcaWalletContext";
import { useScrollToTop } from "./hooks/useScrollToTop";
import RoadmapPage from "./pages/RoadmapPage";
import ManagementDashboard from "./management/pages/ManagementDashboard";
import UsersPage from "./management/pages/UsersPage";
import UserDetailsPage from "./management/pages/UserDetailsPage";
import RolesPage from "./management/pages/RolesPage";
import SystemPage from "./management/pages/SystemPage";
import AnalyticsPage from "./management/pages/AnalyticsPage";
import OrcaCoinsPage from "./management/pages/OrcaCoinsPage";
import { ManagementProvider } from "./management/context/ManagementContext";
import { UserManagementProvider } from "./management/context/UserManagementContext";
import { SystemProvider } from "./management/context/SystemContext";
import ManagementLayout from "./management/layouts/ManagementLayout";
import ProtectedRoute from "./management/components/common/ProtectedRoute";
import ErrorBoundary from "./management/components/common/ErrorBoundary";
import Footer from "./components/layout/Footer";

const queryClient = new QueryClient();

const ScrollToTopWrapper = ({ children }: { children: React.ReactNode }) => {
  useScrollToTop();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <BackendDataProvider>
          <OrcaWalletProvider>
            <UserProgressProvider>
              <SearchProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <Router>
                <ScrollToTopWrapper>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/learning-paths" element={<LearningPathsPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/roadmap" element={<RoadmapPage />} />
                    <Route path="/learning-path/:pathId" element={<LearningPathPage />} />
                    <Route path="/course/:courseId" element={<CoursePage />} />
                    <Route path="/course/:courseId/lab/:labId" element={<LabViewerPage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/wallet" element={<WalletPage />} />
                    <Route path="/coins" element={<GetOrcaCoinsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    
                    {/* Management Routes */}
                    <Route path="/management/*" element={
                      <ErrorBoundary>
                        <ProtectedRoute requiredRoles={['admin', 'moderator', 'owner']}>
                          <ManagementProvider>
                            <UserManagementProvider>
                              <SystemProvider>
                                <ManagementLayout>
                                  <Routes>
                                    <Route index element={<ManagementDashboard />} />
                                    <Route path="users" element={<UsersPage />} />
                                    <Route path="users/create" element={<UsersPage />} />
                                    <Route path="users/:id" element={<UserDetailsPage />} />
                                    <Route path="roles" element={<RolesPage />} />
                                    <Route path="analytics" element={<AnalyticsPage />} />
                                    <Route path="orca-coins" element={<OrcaCoinsPage />} />
                                    <Route path="system" element={
                                      <ProtectedRoute requiredRoles={['admin', 'owner']}>
                                        <SystemPage />
                                      </ProtectedRoute>
                                    } />
                                    <Route path="*" element={<ManagementDashboard />} />
                                  </Routes>
                                </ManagementLayout>
                              </SystemProvider>
                            </UserManagementProvider>
                          </ManagementProvider>
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } />
                    
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                  <Footer />
                </ScrollToTopWrapper>
              </Router>
              </TooltipProvider>
              </SearchProvider>
            </UserProgressProvider>
          </OrcaWalletProvider>
        </BackendDataProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
