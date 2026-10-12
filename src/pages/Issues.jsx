
import { useUpload } from "../context/UploadContent";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    AlertTriangle,
    CheckCircle,
    RotateCcw,
    Search,
} from "lucide-react";

function Issues() {
    const {
        uploadResult,
        resolvedIssueIds,
        resolveIssue,
        reopenIssue,
    } = useUpload();

    const location = useLocation();

    // Status filter
    const [filter, setFilter] = useState("all");

    // Search input
    const [searchTerm, setSearchTerm] = useState("");

    // Category dropdown filter
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Select category when navigating from AI Insights
    useEffect(() => {
        const category = location.state?.category;

        if (category) {
            setSelectedCategory(category);
            setFilter("all");
            setSearchTerm("");
        }
    }, [location.state]);

    // All uploaded issues
    const issues = uploadResult?.issues ?? [];

    // Filter issues by selected category
    const categoryIssues =
        selectedCategory === "all"
            ? issues
            : issues.filter(
                (issue) => issue.category === selectedCategory
            );

    // Count resolved and pending issues in the selected category
    const resolvedCount = categoryIssues.filter((issue) =>
        resolvedIssueIds.includes(issue.id)
    ).length;

    const pendingCount = categoryIssues.length - resolvedCount;

    // Filter issues by status, category, and search text
    const filteredIssues = issues.filter((issue) => {
        const isResolved = resolvedIssueIds.includes(issue.id);

        // Filter by status
        if (filter === "pending" && isResolved) return false;
        if (filter === "resolved" && !isResolved) return false;

        // Filter by category
        if (
            selectedCategory !== "all" &&
            issue.category !== selectedCategory
        ) {
            return false;
        }

        // Search by review text, issue ID, or category
        const query = searchTerm.trim().toLowerCase();

        if (!query) return true;

        return (
            String(issue.id).toLowerCase().includes(query) ||
            (issue.review || "").toLowerCase().includes(query) ||
            (issue.category || "").toLowerCase().includes(query)
        );
    });

    // Status filter buttons
    const filters = [
        {
            label: "All Issues",
            value: "all",
            count: categoryIssues.length,
        },
        {
            label: "Pending",
            value: "pending",
            count: pendingCount,
        },
        {
            label: "Resolved",
            value: "resolved",
            count: resolvedCount,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page heading */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Issues
                </h1>

                <p className="mt-2 text-slate-500">
                    Track negative customer reviews and manage their resolution.
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-slate-500">Total Issues</p>
                    <p className="mt-2 text-3xl font-bold">
                        {categoryIssues.length.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-slate-500">Pending Issues</p>
                    <p className="mt-2 text-3xl font-bold text-red-600">
                        {pendingCount.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-slate-500">Resolved Issues</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {resolvedCount.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Issues section */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-5 text-xl font-semibold text-slate-800">
                    Customer Issues
                </h2>

                {/* Search bar */}
                <div className="relative mb-5">
                    <Search
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by review, issue ID, or category..."
                        className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>

                {/* Category dropdown */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mb-5 w-full rounded-lg border border-slate-200 bg-white p-3 sm:w-72"
                >
                    <option value="all">All Categories</option>
                    <option value="Product Feedback">Product Feedback</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Fraud and Scam">Fraud and Scam</option>
                    <option value="Operational Issues">Operational Issues</option>
                </select>

                {/* Status filter buttons */}
                <div className="mb-6 flex flex-wrap gap-3">
                    {filters.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setFilter(item.value)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === item.value
                                ? "bg-indigo-600 text-white"
                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {item.label} ({item.count.toLocaleString()})
                        </button>
                    ))}
                </div>

                {/* Empty state or issue list */}
                {issues.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                        <AlertTriangle
                            className="mx-auto mb-3"
                            size={36}
                        />
                        <p className="font-medium">
                            No issues available
                        </p>
                        <p className="mt-1 text-sm">
                            Upload your CSV dataset to view negative reviews here.
                        </p>
                    </div>
                ) : filteredIssues.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                        <Search
                            className="mx-auto mb-3"
                            size={36}
                        />
                        <p className="font-medium">
                            No matching issues found
                        </p>
                        <p className="mt-1 text-sm">
                            Try changing your search, category, or status filter.
                        </p>

                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory("all");
                                setFilter("all");
                            }}
                            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredIssues.map((issue) => {
                            const isResolved = resolvedIssueIds.includes(
                                issue.id
                            );

                            return (
                                <div
                                    key={issue.id}
                                    className="rounded-lg border border-slate-200 p-4"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            {/* Issue status badges */}
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-semibold text-slate-500">
                                                    Issue #{issue.id}
                                                </span>

                                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                                    Negative
                                                </span>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${isResolved
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-amber-100 text-amber-700"
                                                        }`}
                                                >
                                                    {isResolved
                                                        ? "Resolved"
                                                        : "Pending"}
                                                </span>
                                            </div>

                                            {/* Review text */}
                                            <p className="break-words text-slate-800">
                                                {issue.review ||
                                                    "No review text available."}
                                            </p>

                                            {/* Category */}
                                            {issue.category && (
                                                <p className="mt-2 text-sm text-slate-500">
                                                    Category: {issue.category}
                                                </p>
                                            )}

                                            {/* Sentiment score */}
                                            {typeof issue.score === "number" && (
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Sentiment score: {issue.score}
                                                </p>
                                            )}
                                        </div>

                                        {/* Resolve / reopen button */}
                                        <button
                                            onClick={() =>
                                                isResolved
                                                    ? reopenIssue(issue.id)
                                                    : resolveIssue(issue.id)
                                            }
                                            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${isResolved
                                                ? "bg-slate-600 hover:bg-slate-700"
                                                : "bg-green-600 hover:bg-green-700"
                                                }`}
                                        >
                                            {isResolved ? (
                                                <>
                                                    <RotateCcw size={16} />
                                                    Reopen
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={16} />
                                                    Mark as Resolved
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Issues;
