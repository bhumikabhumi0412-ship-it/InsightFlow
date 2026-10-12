import { useUpload } from "../context/UploadContent";
import { useNavigate } from "react-router-dom";

import {
    BrainCircuit,
    TrendingUp,
    AlertTriangle,
    Lightbulb,
    MessageSquare,
} from "lucide-react";

function AIInsights() {
    const { uploadResult } = useUpload();
    const navigate = useNavigate();

    const counts = uploadResult?.sentimentCounts ?? {
        positive: 0,
        negative: 0,
        neutral: 0,
    };

    const total =
        Number(counts.positive || 0) +
        Number(counts.negative || 0) +
        Number(counts.neutral || 0);

    const percentage = (value) =>
        total ? ((Number(value || 0) / total) * 100).toFixed(1) : "0.0";

    const categories = Object.entries(
        uploadResult?.categoryCounts ?? {}
    ).sort((a, b) => Number(b[1]) - Number(a[1]));

    // Top Customer Complaints
    const sourceReviews =
        uploadResult?.issues?.length
            ? uploadResult.issues
            : uploadResult?.analyzedReviews?.length
                ? uploadResult.analyzedReviews
                : uploadResult?.preview ?? [];

    const negativeReviews = sourceReviews.filter(
        (review) =>
            String(review.sentiment || "").toLowerCase() === "negative"
    );

    const complaintActions = {
        "Fraud and Scam":
            "Strengthen fraud detection, transaction monitoring, and customer protection.",
        "Operational Issues":
            "Investigate recurring operational failures and improve process reliability.",
        "Product Feedback":
            "Review product defects, quality concerns, and replacement processes.",
        "Customer Service":
            "Improve response times, staff training, and complaint handling.",
    };

    const complaintGroups = Object.entries(
        negativeReviews.reduce((groups, review) => {
            const category = (review.category || "Uncategorized").trim();

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(review);
            return groups;
        }, {})
    )
        .map(([category, reviews]) => ({
            category,
            count: reviews.length,
            examples: reviews.slice(0, 2),
            action:
                complaintActions[category] ||
                "Review recurring negative feedback and identify the main causes.",
        }))
        .sort((a, b) => b.count - a.count);


    const negativePercentage = Number(percentage(counts.negative));

    const insights = [];

    if (total > 0) {
        if (negativePercentage >= 40) {
            insights.push({
                title: "High negative feedback",
                description: `${negativePercentage}% of analyzed reviews are negative. Prioritize investigating the main customer complaints.`,
                icon: AlertTriangle,
            });
        } else {
            insights.push({
                title: "Negative feedback overview",
                description: `${negativePercentage}% of analyzed reviews are negative. Continue monitoring customer complaints.`,
                icon: TrendingUp,
            });
        }

        if (Number(counts.positive) > Number(counts.negative)) {
            insights.push({
                title: "Positive feedback leads",
                description:
                    "Positive reviews outnumber negative reviews. Identify what customers appreciate and maintain those strengths.",
                icon: TrendingUp,
            });
        } else if (Number(counts.negative) > 0) {
            insights.push({
                title: "Improve customer experience",
                description:
                    "Negative reviews are at least as numerous as positive reviews. Investigate recurring problems and track improvements.",
                icon: Lightbulb,
            });
        }

        if (categories.length > 0) {
            insights.push({
                title: "Feedback categories identified",
                description: `${categories[0][0]} has the highest number of reviews (${Number(categories[0][1]).toLocaleString()}). Click to investigate this category.`,
                icon: MessageSquare,
                category: categories[0][0],
            });
        }
    }

    const statCards = [
        {
            title: "Total Reviews",
            value: total,
            icon: MessageSquare,
            color: "text-indigo-600",
        },
        {
            title: "Positive Reviews",
            value: Number(counts.positive || 0),
            icon: TrendingUp,
            color: "text-green-600",
        },
        {
            title: "Negative Reviews",
            value: Number(counts.negative || 0),
            icon: AlertTriangle,
            color: "text-red-600",
        },
        {
            title: "Neutral Reviews",
            value: Number(counts.neutral || 0),
            icon: BrainCircuit,
            color: "text-amber-600",
        },
    ];

    const complaintKeywords = (() => {
        const reviews = sourceReviews
            .filter((review) => {
                const sentiment = String(
                    review.sentiment ?? ""
                ).toLowerCase();

                return sentiment === "negative";
            })
            .map((review) =>
                String(review.review ?? review.text ?? "").toLowerCase()
            );

        const stopWords = new Set([
            "the", "a", "an", "is", "was", "were", "are",
            "to", "of", "and", "in", "it", "this", "that",
            "for", "with", "my", "i", "me", "we", "they",
            "you", "on", "at", "but", "not", "have", "has",
            "had", "very", "be", "been", "from", "after",
            "product", "customer", "service"
        ]);

        const counts = {};

        reviews.forEach((review) => {
            const words = review.match(/\b[a-z]{3,}\b/g) || [];

            words.forEach((word) => {
                if (!stopWords.has(word)) {
                    counts[word] = (counts[word] || 0) + 1;
                }
            });
        });

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    })();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    AI Insights
                </h1>
                <p className="mt-2 text-slate-500">
                    Understand customer sentiment and discover actionable
                    insights from your uploaded reviews.
                </p>


            </div>

            {!uploadResult ? (
                <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
                    <BrainCircuit
                        size={42}
                        className="mx-auto mb-4 text-indigo-600"
                    />
                    <h2 className="text-xl font-semibold text-slate-800">
                        No review data available
                    </h2>
                    <p className="mt-2 text-slate-500">
                        Upload your CSV dataset to generate insights.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {statCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <div
                                    key={card.title}
                                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <Icon
                                        size={25}
                                        className={card.color}
                                    />
                                    <p className="mt-4 text-sm text-slate-500">
                                        {card.title}
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {card.value.toLocaleString()}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {percentage(card.value)}% of reviews
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        {/* Top Customer Complaints */}
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-slate-800">
                                    Top Customer Complaints
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Categories ranked by the number of negative customer reviews.
                                </p>
                            </div>

                            {complaintGroups.length === 0 ? (
                                <div className="py-8 text-center text-slate-500">
                                    <AlertTriangle
                                        size={36}
                                        className="mx-auto mb-3 text-amber-500"
                                    />
                                    <p className="font-medium">
                                        No negative review details available
                                    </p>
                                    <p className="mt-1 text-sm">
                                        Upload a dataset with negative reviews to see customer complaints.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {complaintGroups.map((group, index) => (
                                        <div
                                            key={group.category}
                                            className="rounded-xl border border-slate-200 p-5"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
                                                            {index + 1}
                                                        </span>

                                                        <h3 className="font-semibold text-slate-800">
                                                            {group.category}
                                                        </h3>
                                                    </div>

                                                    <p className="mt-2 text-sm text-slate-500">
                                                        {group.count.toLocaleString()} negative{" "}
                                                        {group.count === 1 ? "review" : "reviews"}
                                                        {negativeReviews.length > 0 &&
                                                            ` · ${(
                                                                (group.count / negativeReviews.length) *
                                                                100
                                                            ).toFixed(1)}% of available negative reviews`}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${index === 0
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-amber-100 text-amber-700"
                                                        }`}
                                                >
                                                    {index === 0 ? "Highest Volume" : "Review"}
                                                </span>
                                            </div>

                                            <div className="mt-4 rounded-lg bg-indigo-50 p-4">
                                                <p className="text-sm font-semibold text-indigo-900">
                                                    Suggested action
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-indigo-800">
                                                    {group.action}
                                                </p>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="mb-3 text-sm font-semibold text-slate-700">
                                                    Example customer complaints
                                                </h4>

                                                <div className="space-y-3">
                                                    {group.examples.map((review, reviewIndex) => (
                                                        <blockquote
                                                            key={review.id ?? review._id ?? reviewIndex}
                                                            className="rounded-lg border-l-4 border-red-300 bg-slate-50 p-3 text-sm leading-6 text-slate-700"
                                                        >
                                                            {review.review ||
                                                                "No review text available."}
                                                        </blockquote>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-800">
                                Sentiment Breakdown
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Distribution of analyzed customer reviews
                            </p>

                            <div className="mt-6 space-y-6">
                                {[
                                    {
                                        label: "Positive",
                                        value: Number(counts.positive || 0),
                                        color: "bg-green-500",
                                    },
                                    {
                                        label: "Negative",
                                        value: Number(counts.negative || 0),
                                        color: "bg-red-500",
                                    },
                                    {
                                        label: "Neutral",
                                        value: Number(counts.neutral || 0),
                                        color: "bg-amber-500",
                                    },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-2 flex justify-between gap-3 text-sm">
                                            <span className="font-medium text-slate-700">
                                                {item.label}
                                            </span>
                                            <span className="text-slate-500">
                                                {item.value.toLocaleString()} (
                                                {percentage(item.value)}%)
                                            </span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full ${item.color}`}
                                                style={{
                                                    width: `${percentage(item.value)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-800">
                                Feedback Categories
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Number of reviews in each category
                            </p>

                            {categories.length === 0 ? (
                                <p className="py-10 text-center text-slate-500">
                                    Category counts are not available in the
                                    uploaded result.
                                </p>
                            ) : (
                                <div className="mt-6 space-y-5">
                                    {categories.map(([name, value]) => {
                                        const count = Number(value || 0);
                                        const maxCount = Math.max(
                                            ...categories.map((item) =>
                                                Number(item[1] || 0)
                                            ),
                                            1
                                        );

                                        return (
                                            <div key={name}>
                                                <div className="mb-2 flex justify-between gap-3 text-sm">
                                                    <span className="font-medium text-slate-700">
                                                        {name}
                                                    </span>
                                                    <span className="text-slate-500">
                                                        {count.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-indigo-500"
                                                        style={{
                                                            width: `${(count / maxCount) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-50 p-3">
                                <Lightbulb
                                    size={25}
                                    className="text-indigo-600"
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">
                                    Key Insights
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Suggested actions based on your dataset
                                </p>
                            </div>
                        </div>

                        {insights.length === 0 ? (
                            <p className="py-6 text-center text-slate-500">
                                Upload a dataset containing analyzed reviews
                                to generate insights.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {insights.map((insight) => {
                                    const Icon = insight.icon;

                                    return (
                                        <div
                                            key={insight.title}
                                            onClick={() => {
                                                if (insight.category) {
                                                    navigate("/issues", {
                                                        state: { category: insight.category },
                                                    });
                                                }
                                            }}
                                            className={`rounded-lg border border-slate-200 p-5 ${insight.category
                                                    ? "cursor-pointer transition hover:border-indigo-400 hover:bg-indigo-50"
                                                    : ""
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon
                                                    size={22}
                                                    className="shrink-0 text-indigo-600"
                                                />
                                                <h3 className="font-semibold text-slate-800">
                                                    {insight.title}
                                                </h3>
                                            </div>
                                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                                {insight.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800">
                    Most Common Complaint Keywords
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Frequently occurring words in negative customer reviews.
                </p>

                {complaintKeywords.length === 0 ? (
                    <p className="mt-6 text-slate-500">
                        No complaint keywords available.
                    </p>
                ) : (
                    <div className="mt-6 space-y-4">
                        {complaintKeywords.map(([word, count]) => (
                            <div key={word}>
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <span className="font-medium capitalize text-slate-700">
                                        {word}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        {count} occurrences
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-indigo-500"
                                        style={{
                                            width: `${(count / complaintKeywords[0][1]) * 100
                                                }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}

export default AIInsights;