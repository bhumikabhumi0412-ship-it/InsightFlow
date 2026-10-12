
import { useUpload } from "../context/UploadContent";
import {
    FileText,
    Download,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
} from "lucide-react";
import { jsPDF } from "jspdf";


function Reports() {
    const { uploadResult, resolvedIssueIds } = useUpload();

    const sentiment = uploadResult?.sentimentCounts ?? {
        positive: 0,
        negative: 0,
        neutral: 0,
    };

    const categories = Object.entries(
        uploadResult?.categoryCounts ?? {}
    ).sort((a, b) => Number(b[1]) - Number(a[1]));

    const issues = uploadResult?.issues ?? [];
    const totalReviews =
        uploadResult?.totalReviews ??
        sentiment.positive + sentiment.negative + sentiment.neutral;

    const analyzedReviews =
        uploadResult?.analyzedReviews?.length ?? totalReviews;

    const resolvedCount = issues.filter((issue) =>
        resolvedIssueIds.includes(issue.id)
    ).length;

    const pendingCount = issues.length - resolvedCount;

    const downloadCSV = () => {
        const rows = [
            ["Report", "InsightFlow Review Report"],
            ["Total Reviews", totalReviews],
            ["Reviews Analyzed", analyzedReviews],
            ["Positive Reviews", sentiment.positive],
            ["Negative Reviews", sentiment.negative],
            ["Neutral Reviews", sentiment.neutral],
            ["Total Negative Issues", issues.length],
            ["Pending Issues", pendingCount],
            ["Resolved Issues", resolvedCount],
            [],
            ["Category", "Review Count"],
            ...categories,
        ];

        const csv = rows
            .map((row) =>
                row
                    .map((value) => {
                        const text = String(value ?? "");
                        return `"${text.replace(/"/g, '""')}"`;
                    })
                    .join(",")
            )
            .join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "insightflow-report.csv";
        link.click();

        URL.revokeObjectURL(url);
    };

    if (!uploadResult) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <FileText
                    size={44}
                    className="mx-auto mb-4 text-indigo-600"
                />
                <h1 className="text-2xl font-bold text-slate-900">
                    Reports
                </h1>
                <p className="mt-2 text-slate-500">
                    Upload a review dataset to generate your report.
                </p>
            </div>
        );
    }



    const exportPDF = () => {
        const doc = new jsPDF();

        const counts = uploadResult?.sentimentCounts ?? {};
        const categories = Object.entries(
            uploadResult?.categoryCounts ?? {}
        );

        const totalReviews = Number(uploadResult?.totalReviews ?? 0);
        const positive = Number(counts.positive ?? 0);
        const negative = Number(counts.negative ?? 0);
        const neutral = Number(counts.neutral ?? 0);

        const issues = uploadResult?.issues ?? [];
        const resolved = resolvedIssueIds.filter(id =>
            issues.some(issue => issue.id === id)
        ).length;

        const pending = Math.max(0, issues.length - resolved);

        // Report heading
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, 210, 38, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("InsightFlow", 14, 17);

        doc.setFontSize(12);
        doc.text("Customer Feedback Analysis Report", 14, 28);

        // Summary
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(16);
        doc.text("Sentiment Summary", 14, 52);

        doc.setFontSize(11);

        const sentimentRows = [
            ["Total Reviews", totalReviews.toLocaleString()],
            [
                "Positive Reviews",
                `${positive.toLocaleString()} (${totalReviews ? (positive / totalReviews * 100).toFixed(1) : "0.0"}%)`,
            ],
            [
                "Negative Reviews",
                `${negative.toLocaleString()} (${totalReviews ? (negative / totalReviews * 100).toFixed(1) : "0.0"}%)`,
            ],
            [
                "Neutral Reviews",
                `${neutral.toLocaleString()} (${totalReviews ? (neutral / totalReviews * 100).toFixed(1) : "0.0"}%)`,
            ],
        ];

        let y = 62;

        sentimentRows.forEach(([label, value], index) => {
            if (index % 2 === 0) {
                doc.setFillColor(241, 245, 249);
                doc.rect(14, y - 6, 182, 10, "F");
            }

            doc.setTextColor(51, 65, 85);
            doc.text(label, 18, y);
            doc.text(value, 192, y, { align: "right" });

            y += 12;
        });

        // Category summary
        y += 8;

        doc.setFontSize(16);
        doc.text("Feedback Category Summary", 14, y);
        y += 12;

        doc.setFontSize(11);

        categories.forEach(([category, count], index) => {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }

            if (index % 2 === 0) {
                doc.setFillColor(241, 245, 249);
                doc.rect(14, y - 6, 182, 10, "F");
            }

            doc.text(category, 18, y);
            doc.text(Number(count).toLocaleString(), 192, y, {
                align: "right",
            });

            y += 12;
        });

        // Issue resolution summary
        y += 8;

        if (y > 255) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(16);
        doc.text("Issue Resolution Summary", 14, y);
        y += 12;

        doc.setFontSize(11);

        [
            ["Total Issues", issues.length],
            ["Pending Issues", pending],
            ["Resolved Issues", resolved],
        ].forEach(([label, value]) => {
            if (y > 275) {
                doc.addPage();
                y = 20;
            }

            doc.text(label, 18, y);
            doc.text(Number(value).toLocaleString(), 192, y, {
                align: "right",
            });

            y += 11;
        });

        // Page numbers
        const pageCount = doc.internal.getNumberOfPages();

        for (let page = 1; page <= pageCount; page++) {
            doc.setPage(page);
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(
                `InsightFlow | Page ${page} of ${pageCount}`,
                105,
                290,
                { align: "center" }
            );
        }

        doc.save("InsightFlow-Report.pdf");
    };



    return (
        <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Reports
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Review your dataset performance and customer feedback.
                    </p>
                </div>

                <button
                    onClick={downloadCSV}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700"
                >
                    <Download size={18} />
                    Export CSV
                </button>
                <button
                    onClick={exportPDF}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700"
                >
                    <Download size={18} />
                    Export PDF
                </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <MessageSquare className="mb-3 text-indigo-600" size={24} />
                    <p className="text-sm text-slate-500">Total Reviews</p>
                    <p className="mt-2 text-3xl font-bold">
                        {Number(totalReviews).toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <TrendingUp className="mb-3 text-green-600" size={24} />
                    <p className="text-sm text-slate-500">Positive Reviews</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {Number(sentiment.positive).toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <AlertTriangle className="mb-3 text-red-600" size={24} />
                    <p className="text-sm text-slate-500">Negative Issues</p>
                    <p className="mt-2 text-3xl font-bold text-red-600">
                        {issues.length.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <CheckCircle className="mb-3 text-green-600" size={24} />
                    <p className="text-sm text-slate-500">Resolved Issues</p>
                    <p className="mt-2 text-3xl font-bold">
                        {resolvedCount.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-semibold text-slate-900">
                    Sentiment Summary
                </h2>

                {[
                    {
                        label: "Positive",
                        count: Number(sentiment.positive),
                        color: "bg-green-500",
                    },
                    {
                        label: "Negative",
                        count: Number(sentiment.negative),
                        color: "bg-red-500",
                    },
                    {
                        label: "Neutral",
                        count: Number(sentiment.neutral),
                        color: "bg-amber-500",
                    },
                ].map((item) => {
                    const percentage =
                        totalReviews > 0
                            ? (item.count / totalReviews) * 100
                            : 0;

                    return (
                        <div key={item.label} className="mb-5 last:mb-0">
                            <div className="mb-2 flex justify-between gap-3 text-sm">
                                <span className="font-medium text-slate-700">
                                    {item.label}
                                </span>
                                <span className="text-slate-500">
                                    {item.count.toLocaleString()} (
                                    {percentage.toFixed(1)}%)
                                </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={`h-full rounded-full ${item.color}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}


                {/* Category-wise Report */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-2 text-xl font-semibold text-slate-800">
                        Category-wise Report
                    </h2>

                    <p className="mb-6 text-slate-500">
                        Number of reviews in each feedback category
                    </p>

                    {Object.entries(uploadResult?.categoryCounts ?? {}).length === 0 ? (
                        <p className="py-6 text-center text-slate-500">
                            No category data available. Upload a dataset to view the report.
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {Object.entries(uploadResult?.categoryCounts ?? {}).map(
                                ([category, count]) => {
                                    const categories = Object.entries(
                                        uploadResult?.categoryCounts ?? {}
                                    );
                                    const maxCount = Math.max(
                                        ...categories.map(([, value]) => Number(value)),
                                        1
                                    );
                                    const percentage = (Number(count) / maxCount) * 100;

                                    return (
                                        <div key={category}>
                                            <div className="mb-2 flex justify-between gap-4">
                                                <span className="text-slate-700">
                                                    {category}
                                                </span>
                                                <span className="font-medium text-slate-700">
                                                    {Number(count).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-indigo-500 transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>

            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-semibold text-slate-900">
                    Feedback Category Summary
                </h2>

                {categories.length === 0 ? (
                    <p className="text-slate-500">
                        No category data is available.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {categories.map(([category, count]) => (
                            <div
                                key={category}
                                className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                            >
                                <span className="text-slate-700">
                                    {category}
                                </span>
                                <span className="font-semibold text-slate-900">
                                    {Number(count).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-semibold text-slate-900">
                    Issue Resolution Summary
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Total Issues</p>
                        <p className="mt-2 text-2xl font-bold">
                            {issues.length.toLocaleString()}
                        </p>
                    </div>

                    <div className="rounded-lg bg-amber-50 p-4">
                        <p className="text-sm text-amber-700">Pending</p>
                        <p className="mt-2 text-2xl font-bold text-amber-700">
                            {pendingCount.toLocaleString()}
                        </p>
                    </div>

                    <div className="rounded-lg bg-green-50 p-4">
                        <p className="text-sm text-green-700">Resolved</p>
                        <p className="mt-2 text-2xl font-bold text-green-700">
                            {resolvedCount.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reports;
