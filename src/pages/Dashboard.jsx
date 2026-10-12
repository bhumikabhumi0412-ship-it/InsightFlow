
import StatCard from "../components/StatCard";
import SentimentChart from "../components/SentimentChart";
import CategoryChart from "../components/CategoryChart";
import { useUpload } from "../context/UploadContent";

import {
    MessageSquare,
    BrainCircuit,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";

function Dashboard() {
    const { uploadResult, resolvedIssueIds } = useUpload();

    const totalReviews = uploadResult?.totalReviews ?? 0;
    const sentimentCounts = uploadResult?.sentimentCounts;

    const reviewsAnalyzed = sentimentCounts
        ? (sentimentCounts.positive ?? 0) +
        (sentimentCounts.negative ?? 0) +
        (sentimentCounts.neutral ?? 0)
        : 0;

    return (
        <div className="dashboard-page space-y-8">
            {/* Page heading */}
            <div className="dashboard-heading">
                <h1>Dashboard</h1>
                <p>
                    Understand your customer feedback at a glance.
                </p>
            </div>

            {/* Statistics */}
            <div className="dashboard-stats">
                <StatCard
                    title="Total Reviews"
                    value={totalReviews.toLocaleString()}
                    icon={MessageSquare}
                    color="text-indigo-600"
                />

                <StatCard
                    title="Reviews Analyzed"
                    value={reviewsAnalyzed.toLocaleString()}
                    icon={BrainCircuit}
                    color="text-blue-600"
                />

                <StatCard
                    title="Priority Issues"
                    value={(uploadResult?.priorityIssues ?? 0).toLocaleString()}
                    icon={AlertTriangle}
                    color="text-red-600"
                />

                <StatCard
                    title="Resolved Issues"
                    value={
                        uploadResult
                            ? resolvedIssueIds.length.toLocaleString()
                            : "0"
                    }
                    icon={CheckCircle}
                    color="text-green-600"
                />
            </div>

            {/* Charts */}
            <div className="dashboard-charts">
                <div className="dashboard-chart-card">
                    <SentimentChart />
                </div>

                <div className="dashboard-chart-card">
                    <CategoryChart />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
