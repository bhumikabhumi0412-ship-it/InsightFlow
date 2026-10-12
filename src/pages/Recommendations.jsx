
import { useUpload } from "../context/UploadContent";
import {
    Lightbulb,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Clock,
} from "lucide-react";

function Recommendations() {
    const { uploadResult } = useUpload();

    const issues = uploadResult?.issues ?? [];
    const sentimentCounts = uploadResult?.sentimentCounts ?? {};

    // Count negative reviews by category
    const categoryCounts = {};

    issues.forEach((issue) => {
        const category = issue.category || "Uncategorized";

        if (!categoryCounts[category]) {
            categoryCounts[category] = 0;
        }

        categoryCounts[category]++;
    });

    // Generate recommendations dynamically
    const recommendations = Object.entries(categoryCounts)
        .map(([category, count]) => {
            const totalNegative = issues.length;
            const percentage = totalNegative
                ? (count / totalNegative) * 100
                : 0;

            let priority = "Low";
            let color = "blue";
            let action = "";

            if (percentage >= 30) {
                priority = "High";
                color = "red";
            } else if (percentage >= 15) {
                priority = "Medium";
                color = "amber";
            }

            switch (category.toLowerCase()) {
                case "customer service":
                    action =
                        "Improve support response times and provide better customer assistance.";
                    break;
                case "fraud and scam":
                    action =
                        "Strengthen fraud detection, transaction monitoring, and customer protection.";
                    break;
                case "product feedback":
                    action =
                        "Review recurring product complaints and improve product quality.";
                    break;
                case "operational issues":
                    action =
                        "Investigate operational failures and improve process reliability.";
                    break;
                default:
                    action =
                        "Review customer complaints in this category and identify recurring problems.";
            }

            return {
                category,
                count,
                percentage,
                priority,
                color,
                action,
            };
        })
        .sort((a, b) => b.count - a.count);

    const totalNegative =
        sentimentCounts.negative ?? issues.length;

    return (
        <div className="space-y-8">
            {/* Page heading */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Smart Recommendations
                </h1>
                <p className="mt-2 text-slate-500">
                    Actionable suggestions based on your customer feedback.
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <Lightbulb className="mb-3 text-indigo-600" size={25} />
                    <p className="text-sm text-slate-500">
                        Recommendations
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {recommendations.length}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <AlertTriangle className="mb-3 text-red-600" size={25} />
                    <p className="text-sm text-slate-500">
                        Negative Reviews
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {totalNegative.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <TrendingUp className="mb-3 text-green-600" size={25} />
                    <p className="text-sm text-slate-500">
                        Categories Identified
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {recommendations.length}
                    </p>
                </div>
            </div>

            {/* Recommendation list */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-semibold text-slate-800">
                    Recommended Actions
                </h2>

                {issues.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                        <Clock
                            className="mx-auto mb-3"
                            size={38}
                        />
                        <p className="font-medium">
                            No feedback data available
                        </p>
                        <p className="mt-2 text-sm">
                            Upload a CSV dataset to generate recommendations.
                        </p>
                    </div>
                ) : recommendations.length === 0 ? (
                    <p className="py-10 text-center text-slate-500">
                        No recommendations could be generated.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {recommendations.map((item) => (
                            <div
                                key={item.category}
                                className="rounded-xl border border-slate-200 p-5"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex gap-3">
                                        <div className="rounded-lg bg-indigo-50 p-3">
                                            <Lightbulb
                                                className="text-indigo-600"
                                                size={22}
                                            />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-slate-800">
                                                {item.category}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {item.action}
                                            </p>

                                            <p className="mt-3 text-sm text-slate-500">
                                                {item.count.toLocaleString()} negative reviews
                                                {" · "}
                                                {item.percentage.toFixed(1)}% of issues
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${item.color === "red"
                                                ? "bg-red-100 text-red-700"
                                                : item.color === "amber"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}
                                    >
                                        {item.priority} Priority
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Recommendations;
