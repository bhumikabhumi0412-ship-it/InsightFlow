
import express from "express";
import cors from "cors";
import multer from "multer";
import csv from "csv-parser";
import Sentiment from "sentiment";
import { Readable } from "node:stream";

const app = express();
const PORT = 5000;
const sentiment = new Sentiment();

app.use(cors());
app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
});

// Stores all analyzed reviews in memory
let storedReviews = [];

// Home route
app.get("/", (req, res) => {
    res.send("InsightFlow backend is running!");
});

// Upload CSV and analyze reviews
app.post(
    "/api/reviews/upload",
    upload.single("file"),
    (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a CSV file.",
            });
        }

        if (!req.file.originalname.toLowerCase().endsWith(".csv")) {
            return res.status(400).json({
                success: false,
                message: "Only CSV files are allowed.",
            });
        }

        const rows = [];

        Readable.from(req.file.buffer)
            .pipe(csv())
            .on("data", (row) => rows.push(row))
            .on("end", () => {
                try {
                    // Validate CSV columns
                    if (rows.length > 0 && !("review" in rows[0])) {
                        return res.status(400).json({
                            success: false,
                            message: 'CSV must contain a "review" column.',
                        });
                    }

                    const sentimentCounts = {
                        positive: 0,
                        negative: 0,
                        neutral: 0,
                    };

                    const categoryCounts = {};

                    // Analyze every review
                    const analyzedReviews = rows.map((row, index) => {
                        const text = (row.review || "").trim();
                        const category = (row.category || "").trim();

                        // Count categories
                        const categoryName = category || "Uncategorized";

                        categoryCounts[categoryName] =
                            (categoryCounts[categoryName] || 0) + 1;

                        // Handle empty review text
                        if (!text) {
                            sentimentCounts.neutral++;

                            return {
                                ...row,
                                id: index + 1,
                                sentiment: "Neutral",
                                score: 0,
                            };
                        }

                        // Analyze sentiment
                        const result = sentiment.analyze(text);
                        let label = "Neutral";

                        if (result.score > 0) {
                            label = "Positive";
                            sentimentCounts.positive++;
                        } else if (result.score < 0) {
                            label = "Negative";
                            sentimentCounts.negative++;
                        } else {
                            sentimentCounts.neutral++;
                        }

                        return {
                            ...row,
                            id: index + 1,
                            sentiment: label,
                            score: result.score,
                        };
                    });

                    // Store all analyzed reviews for pagination
                    storedReviews = analyzedReviews;

                    // Negative reviews are treated as issues
                    const issues = analyzedReviews.filter(
                        (review) => review.sentiment === "Negative"
                    );

                    return res.json({
                        success: true,
                        message:
                            "CSV uploaded and sentiment analysis completed!",
                        totalReviews: analyzedReviews.length,
                        analyzedReviews: analyzedReviews.length,
                        priorityIssues: issues.length,
                        resolvedIssues: 0,
                        sentimentCounts,
                        categoryCounts,
                        issues,
                        columns: rows.length ? Object.keys(rows[0]) : [],
                        preview: analyzedReviews.slice(0, 5),
                    });
                } catch (error) {
                    next(error);
                }
            })
            .on("error", next);
    }
);

// Clear uploaded reviews
// Clear all uploaded reviews
app.delete("/api/reviews", (req, res) => {
    storedReviews = [];

    res.json({
        success: true,
        message: "All uploaded reviews have been cleared."
    });
});

// Get paginated reviews
app.get("/api/reviews", (req, res) => {
    const page = Math.max(
        1,
        parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const totalReviews = storedReviews.length;
    const totalPages = Math.ceil(totalReviews / limit);

    // Prevent requests for pages beyond the available range
    const currentPage =
        totalPages === 0 ? 1 : Math.min(page, totalPages);

    const startIndex = (currentPage - 1) * limit;

    const reviews = storedReviews.slice(
        startIndex,
        startIndex + limit
    );

    res.json({
        success: true,
        reviews,
        totalReviews,
        currentPage,
        totalPages,
        limit,
    });
});

// Error-handling middleware
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message:
                "Upload failed. Ensure the CSV file is under 20 MB.",
        });
    }

    console.error(err);

    res.status(500).json({
        success: false,
        message: "An error occurred while processing the CSV.",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
