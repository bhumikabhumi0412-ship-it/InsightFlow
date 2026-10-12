
import { useEffect, useState } from "react";
import { Search, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = "http://localhost:5000/api/reviews";
const PAGE_SIZE = 10;

export default function Review() {
    const [reviews, setReviews] = useState([]);
    const [search, setSearch] = useState("");
    const [sentimentFilter, setSentimentFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchReviews() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    `${API_URL}?page=${page}&limit=${PAGE_SIZE}`
                );

                if (!response.ok) {
                    throw new Error("Failed to load reviews.");
                }

                const data = await response.json();

                if (!cancelled) {
                    setReviews(data.reviews || []);
                    setTotalReviews(data.totalReviews || 0);
                    setTotalPages(data.totalPages || 0);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        "Could not load reviews. Upload your CSV and make sure the backend is running on port 5000."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchReviews();

        return () => {
            cancelled = true;
        };
    }, [page]);

    const filteredReviews = reviews.filter((review) => {
        const text = String(
            review.review ?? review.text ?? review.Review ?? ""
        );

        const matchesSearch = text
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesSentiment =
            sentimentFilter === "All" ||
            review.sentiment?.toLowerCase() ===
            sentimentFilter.toLowerCase();

        return matchesSearch && matchesSentiment;
    });

    function changePage(newPage) {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    }

    return (
        <div className="reviews-page">
            <h1>Reviews</h1>
            <p>Search and filter customer reviews by sentiment.</p>

            <div className="reviews-container">
                <div className="reviews-filters">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search review text..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        value={sentimentFilter}
                        onChange={(e) =>
                            setSentimentFilter(e.target.value)
                        }
                    >
                        <option value="All">All Sentiments</option>
                        <option value="Positive">Positive</option>
                        <option value="Negative">Negative</option>
                        <option value="Neutral">Neutral</option>
                    </select>
                </div>

                <p>
                    {loading
                        ? "Loading reviews..."
                        : `Showing ${totalReviews === 0
                            ? 0
                            : (page - 1) * PAGE_SIZE + 1
                        }–${Math.min(
                            page * PAGE_SIZE,
                            totalReviews
                        )} of ${totalReviews} reviews`}
                </p>

                {error && <p className="error-message">{error}</p>}

                {!loading && !error && filteredReviews.length === 0 && (
                    <p>No reviews match your search or sentiment filter.</p>
                )}

                {!loading &&
                    !error &&
                    filteredReviews.map((review, index) => (
                        <div
                            className="review-card"
                            key={review.id ?? review._id ?? index}
                        >
                            <div className="review-text">
                                <MessageSquare size={18} />
                                <span>
                                    {review.review ??
                                        review.text ??
                                        review.Review ??
                                        "No review text available"}
                                </span>
                            </div>

                            <div className="review-tags">
                                <span
                                    className={`sentiment-tag ${String(
                                        review.sentiment
                                    ).toLowerCase()}`}
                                >
                                    {review.sentiment}
                                </span>

                                <span className="category-tag">
                                    {review.category || "Uncategorized"}
                                </span>
                            </div>
                        </div>
                    ))}

                {!loading && !error && totalPages > 0 && (
                    <div className="pagination">
                        <button
                            onClick={() => changePage(page - 1)}
                            disabled={page <= 1}
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>

                        <span>
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => changePage(page + 1)}
                            disabled={page >= totalPages}
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
