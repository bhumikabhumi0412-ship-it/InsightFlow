import { createContext, useContext, useState, useEffect } from "react";

const UploadContext = createContext(null);

export function UploadProvider({ children }) {
    const clearUpload = () => {
        setUploadResult(null);
        setResolvedIssueIds([]);
    };
    const [uploadResult, setUploadResult] = useState(null);

    // Store resolved issue IDs
    const [resolvedIssueIds, setResolvedIssueIds] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("resolvedIssueIds") || "[]"
            );
        } catch {
            return [];
        }
    });

    // Save resolved issue IDs whenever they change
    useEffect(() => {
        localStorage.setItem(
            "resolvedIssueIds",
            JSON.stringify(resolvedIssueIds)
        );
    }, [resolvedIssueIds]);

    // Mark an issue as resolved
    const resolveIssue = (issueId) => {
        setResolvedIssueIds((previousIds) =>
            previousIds.includes(issueId)
                ? previousIds
                : [...previousIds, issueId]
        );
    };

    // Mark an issue as unresolved again
    const reopenIssue = (issueId) => {
        setResolvedIssueIds((previousIds) =>
            previousIds.filter((id) => id !== issueId)
        );
    };

    return (
        <UploadContext.Provider
            value={{
                uploadResult,
                setUploadResult,
                resolvedIssueIds,
                resolveIssue,
                reopenIssue,
                clearUpload,
            }}
        >
            {children}
        </UploadContext.Provider>
    );
}

export function useUpload() {
    return useContext(UploadContext);
}
