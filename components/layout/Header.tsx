"use client"

import { FormEvent, useState } from "react"
import InputSymbolAutocomplete from "@/components/ui/input-autocomplete"
import { CustomTable } from "@/components/ui/custom-table"
import he from 'he';
import { formatUglyDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import {
    fetchIncomeStatement,
    fetchSecSection,
    fetchBasicFinancials,
    fetchCompanyProfile,
    fetchCompanyNews,
    fetchSecFiling
} from "@/lib/tools/tools_calls"

import {
    IncomeStatementResponse,
    SecSectionResponse,
    BasicFinancialsResponse,
    CompanyProfileResponse,
    CompanyNewsResponse,
    SecFilingResponse
} from "@/lib/tools/tools_types"

export const Header = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>("")
    const [incomeStatement, setIncomeStatement] = useState<IncomeStatementResponse | null>(null);
    const [secSection, setSecSection] = useState<SecSectionResponse | null>(null);
    const [basicFinancials, setBasicFinancials] = useState<BasicFinancialsResponse | null>(null);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileResponse | null>(null);
    const [companyNews, setCompanyNews] = useState<CompanyNewsResponse | null>(null);
    const [secFiling, setSecFiling] = useState<SecFilingResponse | null>(null);

    const [error, setError] = useState<string | null>(null);

    const handleFetchIncomeStatement = async (symbol: string) => {
        try {
            const data = await fetchIncomeStatement(symbol);
            setIncomeStatement(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setIncomeStatement(null);
        }
    };


    const handleFetchSecSection = async (ticker_symbol: string, section: string, fyear?: string, report_address?: string) => {
        try {
            const result = await fetchSecSection(ticker_symbol, section, fyear, report_address);
            setSecSection(result);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setSecSection(null);
        }
    };


    const handleBasicFinancials = async (symbol: string, selectedColumns?: string[]) => {
        try {
            const result = await fetchBasicFinancials(symbol, selectedColumns);
            setBasicFinancials(result);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setBasicFinancials(null);
        }
    };

    const handleCompanyProfile = async (symbol: string) => {
        try {
            const result = await fetchCompanyProfile(symbol);
            setCompanyProfile(result);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setCompanyProfile(null);
        }
    }

    const handleCompanyNews = async (symbol: string, start_date?: string, end_date?: string, max_news_num: number = 10) => {
        try {
            const result = await fetchCompanyNews(symbol, start_date, end_date, max_news_num);
            setCompanyNews(result);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setCompanyNews(null);
        }
    }

    const handleSecFiling = async (symbol: string, form?: string, fromDate?: string, toDate?: string) => {
        try {
            const result = await fetchSecFiling(symbol, form, fromDate, toDate);
            setSecFiling(result);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setSecFiling(null);
        }
    }


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (selectedSymbol) {
            // handleFetchIncomeStatement(selectedSymbol);
            // handleFetchSecSection(selectedSymbol, "7")
            // handleBasicFinancials(selectedSymbol, ['revenueTTm', 'debtEquityTTM', 'peRatioTTM',
            //     'pegRatioTTM', 'priceToBookTTM', 'priceToSalesTTM', 'dividendYieldTTM', 'roeTTM'])
            // handleCompanyProfile(selectedSymbol)
            // handleCompanyNews(selectedSymbol)
            // handleSecFiling(selectedSymbol, "10-K")
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <form onSubmit={handleSubmit} className="flex flex-grow items-center space-x-2">
                <p className="whitespace-nowrap">Generate a financial report for</p>
                <InputSymbolAutocomplete handleSelectSymbol={setSelectedSymbol} />
                <Button type="submit">Generate</Button>
            </form>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            {/* {incomeStatement && (
                <div className="w-full max-w-4xl mt-4">
                    <CustomTable
                        title={`Income statement for ${selectedSymbol}`}
                        content_dict={incomeStatement.income_statement}
                        cols={Object.keys(incomeStatement.income_statement)}
                        rows={Object.keys(incomeStatement.income_statement[Object.keys(incomeStatement.income_statement)[0]])}
                    />
                </div>
            )} */}

            {/* {secSection && (
                <pre className="whitespace-pre-wrap text-justify">{he.decode(secSection.section_text)}</pre>

            )} */}

            {/* {basicFinancials && (
                <div className="w-full max-w-4xl mt-4">
                    <CustomTable
                        title={`Basic Financials for ${selectedSymbol}`}
                        content_dict={{ value: basicFinancials.financials }}
                        cols={["value"]}
                        rows={Object.keys(basicFinancials.financials)}
                    />
                </div>
            )} */}

            {/* {companyProfile && (
                <pre className="whitespace-pre-wrap text-justify">{he.decode(companyProfile.company_profile)}</pre>
            )} */}

            {/* {companyNews && (
                <div className="w-full max-w-4xl mt-4">
                    {companyNews.news.map((news, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-md">
                            <h3 className="font-semibold">{news.headline}</h3>
                            <p>s{news.source} | {formatUglyDate(news.date)}</p>
                            <a href={news.url} target="_blank">{news.url}</a>
                        </div>
                    ))}
                </div>
            )} */}

            {/* {secFiling && (
                <div className="w-full max-w-4xl mt-4">
                    <div className="p-4 border border-gray-200 rounded-md flex justify-between">
                        <div>
                            <h3 className="font-semibold">SEC Filing for {selectedSymbol} - {secFiling.filing.form}</h3>
                            <p>Accepted on: {secFiling.filing.acceptedDate}</p>
                            <p>Filed on: {secFiling.filing.filedDate}</p>
                        </div>
                        <div>
                            <Button asChild variant="outline">
                                <a href={secFiling.filing.reportUrl} target="_blank" >
                                    open {secFiling.filing.form} filing
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    )
}
