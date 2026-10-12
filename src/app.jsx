import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import UploadReviews from "./pages/UploadReviews";
import { UploadProvider } from "./context/UploadContent";
import Issues from "./pages/Issues";
import Recommendations from "./pages/Recommendations";
import AIInsights from "./pages/AIInsights";
import Reports from "./pages/Reports";
import Review from "./pages/Review";

function App() {
    return (
        <BrowserRouter>
            <UploadProvider>
                <div className="flex min-h-screen bg-slate-50">
                    <Sidebar />

                    <main className="min-w-0 flex-1 p-6 md:p-8">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/upload" element={<UploadReviews />} />
                            <Route path="/issues" element={<Issues />} />
                            <Route path="/recommendations" element={<Recommendations />} />
                            <Route path="/insights" element={<AIInsights />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/reviews" element={<Review />} />
                        </Routes>
                    </main>
                </div>
            </UploadProvider>
        </BrowserRouter>
    );
}

export default App;
