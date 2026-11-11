import { useEffect, useState,useRef } from 'react';
import { useRestaurant } from '../../components/globals/restaurantContext';
import { DiningSession } from '../../types/restaurant';

export default function useDiningSeshDefault() {
    const { selectedRestaurantId } = useRestaurant();
    const [sessions, setSessions] = useState<DiningSession[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState("");
    const [loadMoreRetry, setLoadMoreRetry] = useState(0);
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "pending" | "verified" | "closed">("all");
    const [createdFrom, setCreatedFrom] = useState("");
    const [createdTo, setCreatedTo] = useState("");
    const filters = [
        { label: "All sessions", value: "all", count: sessions.length },
        { label: "Active", value: "active", count: sessions.filter((session) => session.is_active).length },
        { label: "Pending", value: "pending", count: sessions.filter((session) => session.status === "pending").length },
        { label: "Verified", value: "verified", count: sessions.filter((session) => session.status === "verified").length },
        { label: "Closed", value: "closed", count: sessions.filter((session) => session.status === "closed").length },
    ] as const;
    const [draftFilter, setDraftFilter] = useState<"all" | "active" | "pending" | "verified" | "closed">("all");
    const [draftCreatedFrom, setDraftCreatedFrom] = useState("");
    const [draftCreatedTo, setDraftCreatedTo] = useState("");
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const loadingMoreRef = useRef(false);
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingSessionId, setUpdatingSessionId] = useState<number | null>(null);

    const invalidDraftDateRange = Boolean(
        draftCreatedFrom && draftCreatedTo && draftCreatedFrom > draftCreatedTo
    );
    
    const applyFilters = () => {
        if (invalidDraftDateRange) return;
        loadingMoreRef.current = false;
        setPage(1);
        setActiveFilter(draftFilter);
        setCreatedFrom(draftCreatedFrom);
        setCreatedTo(draftCreatedTo);
    };

    const retryLoadingMore = () => {
        loadingMoreRef.current = true;
        setLoadMoreRetry((retry) => retry + 1);
    };

    return {
        selectedRestaurantId,
        sessions,
        setSessions,
        totalItems,
        setTotalItems,
        page,
        setPage,
        hasMore,
        setHasMore,
        loadingMore,
        setLoadingMore,
        loadMoreError,
        setLoadMoreError,
        loadMoreRetry,
        activeFilter,
        setActiveFilter,
        filters,
        setDraftFilter,
        draftFilter,
        draftCreatedFrom,
        setDraftCreatedFrom,
        draftCreatedTo,
        setDraftCreatedTo,
        createdFrom, 
        setCreatedFrom,
        createdTo, 
        setCreatedTo,
        applyFilters,
        retryLoadingMore,
        invalidDraftDateRange,
        loadMoreRef,
        loadingMoreRef,
        filtersExpanded, 
        setFiltersExpanded,
        loading, 
        setLoading,
        error, 
        setError,
        updatingSessionId, 
        setUpdatingSessionId
    }
}