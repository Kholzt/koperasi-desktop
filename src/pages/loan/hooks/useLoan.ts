import { useCallback, useEffect, useState } from 'react';
import { getLoans, getGroups } from '../services/loanService';
import { GroupProps, LoanProps, PaginationProps } from '../../../utils/types';
import { useTheme } from '../../../context/ThemeContext';
const dayMap: any = {
    all: 'all',
    senin: 'monday',
    selasa: 'tuesday',
    rabu: 'wednesday',
    kamis: 'thursday',
    jumat: 'friday',
    sabtu: 'saturday'
};
export function useLoan() {
  const [filter, setFilter] = useState<{ startDate: string | null; endDate: string | null; status: string | null }>({
    startDate: null,
    endDate: null,
    status: null,
  });

  const [loans, setLoans] = useState<LoanProps[]>([]);
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [groups, setGroups] = useState<{ label: string; value: string }[]>([]);
  const [search, setSearch] = useState<string | null>('');
  const [isFiltersLoaded, setIsFiltersLoaded] = useState(false);

  const [pagination, setPagination] = useState<PaginationProps>({
    page: 1,
    totalPages: 1,
    limit: 10,
    total: 0,
  });

  const { reload } = useTheme();

  const fetchGroups = useCallback(async () => {
    try {
      const data: any = await getGroups();
      const { groups } = data;
      setGroups(groups
        .slice()
        .sort((a: GroupProps, b: GroupProps) => a.group_name.localeCompare(b.group_name))
        .map((group: GroupProps) => ({ label: group.group_name, value: group.id }))
      );
    } catch (err) {
      setGroups([]);
    }
  }, []);

  const fetchLoans = useCallback(async (page = 1, limit = pagination.limit, startDate = '', endDate = '') => {
    try {
      const data: any = await getLoans({
        page,
        status: filter.status,
        startDate: startDate || filter.startDate || '',
        endDate: endDate || filter.endDate || '',
        day:dayMap[dayFilter] || '',
        group: groupFilter || '',
        search: search || '',
      });

      setLoans(data.loans || []);
      setPagination((prev) => ({
        ...prev,
        page: data.pagination?.page || page,
        totalPages: data.pagination?.totalPages || prev.totalPages,
        total: data.pagination?.total || prev.total,
        limit: data.pagination?.limit || prev.limit,
      }));
    } catch (err) {
      setLoans([]);
    }
  }, [dayFilter, filter.endDate, filter.startDate, filter.status, groupFilter, search]);

  // initial + deps fetch
  useEffect(() => {
    fetchLoans(pagination.page);
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, reload, filter.endDate, filter.startDate, filter.status, dayFilter, groupFilter, search]);

  // restore saved filters when mounted
  useEffect(() => {
    const stored = localStorage.getItem('filters');
    try {
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed) {
        setFilter((prev) => ({
          ...prev,
          endDate: parsed.endDate || '',
          startDate: parsed.startDate || '',
          status: parsed.status || '',
        }));
        setDayFilter(parsed.dayFilter || 'all');
        setGroupFilter(parsed.groupFilter || '');
        setSearch(parsed.search || '');
        setPagination((prev) => ({ ...prev, page: parsed.page || prev.page }));
      }
    } catch (e) {
      // ignore
    }
    setIsFiltersLoaded(true);
  }, []);

  // persist filters
  useEffect(() => {
    if (!isFiltersLoaded) return;
    const savedFilters = {
      endDate: filter.endDate,
      startDate: filter.startDate,
      status: filter.status,
      dayFilter,
      groupFilter,
      page: pagination.page,
    };
    localStorage.setItem('filters', JSON.stringify(savedFilters));
  }, [filter.endDate, filter.startDate, filter.status, dayFilter, groupFilter, isFiltersLoaded, pagination.page]);

  return {
    loans,
    setLoans,
    fetchLoans,
    fetchGroups,
    groups,
    pagination,
    setPagination,
    filter,
    setFilter,
    dayFilter,
    setDayFilter,
    groupFilter,
    setGroupFilter,
    search,
    setSearch,
    isFiltersLoaded,
  } as const;
}
