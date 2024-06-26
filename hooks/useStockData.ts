'use client'

import { useQuery } from '@tanstack/react-query'
import {
    fetchIncomeStatement,
    fetchBasicFinancials,
    fetchCompanyProfile,
    fetchCompanyNews,
    fetchSecFiling
} from '@/lib/tools/tools_calls'
import type {
    IncomeStatementResponse,
    BasicFinancialsResponse,
    CompanyProfileResponse,
    CompanyNewsResponse,
    SecFilingResponse
} from '@/lib/tools/tools_types'

export const useIncomeStatement = (symbol: string) => {
    return useQuery<IncomeStatementResponse, Error>({
        queryKey: ['incomeStatement', symbol],
        queryFn: () => fetchIncomeStatement(symbol),
    })
}

export const useBasicFinancials = (symbol: string, selectedColumns?: string[]) => {
    return useQuery<BasicFinancialsResponse, Error>({
        queryKey: ['basicFinancials', symbol, selectedColumns],
        queryFn: () => fetchBasicFinancials(symbol, selectedColumns),
    })
}

export const useCompanyProfile = (symbol: string) => {
    return useQuery<CompanyProfileResponse, Error>({
        queryKey: ['companyProfile', symbol],
        queryFn: () => fetchCompanyProfile(symbol),
    })
}

export const useCompanyNews = (symbol: string, startDate?: string, endDate?: string, maxNewsNum: number = 10) => {
    return useQuery<CompanyNewsResponse, Error>({
        queryKey: ['companyNews', symbol, startDate, endDate, maxNewsNum],
        queryFn: () => fetchCompanyNews(symbol, startDate, endDate, maxNewsNum),
    })
}

export const useSecFiling = (symbol: string, form?: string, fromDate?: string, toDate?: string) => {
    return useQuery<SecFilingResponse, Error>({
        queryKey: ['secFiling', symbol, form, fromDate, toDate],
        queryFn: () => fetchSecFiling(symbol, form, fromDate, toDate),
    })
}

export const useAggregatedStockData = (symbol: string) => {
    const incomeStatement = useIncomeStatement(symbol);
    const basicFinancials = useBasicFinancials(symbol, ['revenueTTm', 'debtEquityTTM', 'peRatioTTM', 'pegRatioTTM', 'priceToBookTTM', 'priceToSalesTTM', 'dividendYieldTTM', 'roeTTM']);
    const companyProfile = useCompanyProfile(symbol);
    const companyNews = useCompanyNews(symbol);
    const secFiling = useSecFiling(symbol, "10-K");

    const isLoading = incomeStatement.isLoading || basicFinancials.isLoading || companyProfile.isLoading || companyNews.isLoading || secFiling.isLoading;
    const isError = incomeStatement.isError || basicFinancials.isError || companyProfile.isError || companyNews.isError || secFiling.isError;

    const data = {
        incomeStatement: incomeStatement.data,
        basicFinancials: basicFinancials.data,
        companyProfile: companyProfile.data,
        companyNews: companyNews.data,
        secFiling: secFiling.data
    };

    return { data, isLoading, isError };
};