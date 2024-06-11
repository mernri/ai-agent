"use client"

import { FormEvent, useState } from "react"
import InputSymbolAutocomplete from "@/components/ui/input-autocomplete"
import { CustomTable } from "@/components/ui/custom-table"
import he from 'he';
import { formatUglyDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import BlurIn from "@/components/ui/text/blur-in"
import { BlurInTextWithCollapsible } from "@/components/ui/blurin-text-with-collapsible"

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
            handleCompanyProfile(selectedSymbol)
            handleFetchIncomeStatement(selectedSymbol);
            // handleFetchSecSection(selectedSymbol, "7")
            handleBasicFinancials(selectedSymbol, ['revenueTTm', 'debtEquityTTM', 'peRatioTTM',
                'pegRatioTTM', 'priceToBookTTM', 'priceToSalesTTM', 'dividendYieldTTM', 'roeTTM'])
            handleCompanyNews(selectedSymbol)
            handleSecFiling(selectedSymbol, "10-K")
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <form onSubmit={handleSubmit} className="flex flex-grow items-center space-x-2 mb-6">
                <p className="whitespace-nowrap text-l font-bold">Generate a financial report for</p>
                <InputSymbolAutocomplete handleSelectSymbol={setSelectedSymbol} />
                <Button type="submit">Generate</Button>
            </form>

            {/* {error && <div style={{ color: 'red' }}>{error}</div>} */}

            {companyProfile && (
                <BlurInTextWithCollapsible
                    text={<BlurIn
                        icon={<CheckCircleIcon width='20' />}
                        word={`Company profile extracted successfully`}
                        className="text-sm text-start text-black dark:text-white"
                    />}
                    collapsible={<pre className="whitespace-pre-wrap text-justify">{he.decode(companyProfile.company_profile)}</pre>
                    }
                />
            )}

            {incomeStatement && (
                <div>
                    <BlurInTextWithCollapsible
                        text={<BlurIn
                            icon={<CheckCircleIcon width='20' />}
                            word={`Retrieved last income statement`}
                            className="text-sm text-start text-black dark:text-white"
                        />}
                        collapsible={<CustomTable
                            title={`Income statement for ${selectedSymbol}`}
                            content_dict={incomeStatement.income_statement}
                            cols={Object.keys(incomeStatement.income_statement)}
                            rows={Object.keys(incomeStatement.income_statement[Object.keys(incomeStatement.income_statement)[0]])}
                        />}
                    />
                </div>
            )}

            {secSection && (
                <BlurInTextWithCollapsible
                    text={<BlurIn
                        icon={<CheckCircleIcon width='20' />}
                        word={`Retrieved section ${secSection.section} from 10-k sec filing ${secSection.fiscal_year}`}
                        className="text-sm text-start text-black dark:text-white"
                    />}
                    collapsible={<pre className="whitespace-pre-wrap text-justify">{he.decode(secSection.section_text)}</pre>}
                />
            )}

            {basicFinancials && (
                <BlurInTextWithCollapsible
                    text={<BlurIn
                        icon={<CheckCircleIcon width='20' />}
                        word={`Retrieved last financial metrics`}
                        className="text-sm text-start text-black dark:text-white"
                    />}
                    collapsible={<div className="w-full max-w-4xl mt-4">
                        <CustomTable
                            title={`Basic Financials for ${selectedSymbol}`}
                            content_dict={{ value: basicFinancials.financials }}
                            cols={["value"]}
                            rows={Object.keys(basicFinancials.financials)}
                        />
                    </div>}
                />
            )}

            {companyNews && (
                <BlurInTextWithCollapsible
                    text={<BlurIn
                        icon={<CheckCircleIcon width='20' />}
                        word={`Searching for the ${selectedSymbol}'s latest news`}
                        className="text-sm text-start text-black dark:text-white"
                    />}
                    collapsible={<div className="w-full max-w-4xl mt-4 gap-3 flex flex-col">
                        {companyNews.news.map((news, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-md flex justify-between gap-4 align-start">
                                <div>
                                    <h3 className="font-semibold">{news.headline}</h3>
                                    <p>{news.source} | {formatUglyDate(news.date)}</p>
                                </div>
                                <div>
                                    <Button asChild variant="outline">
                                        <a href={news.url} target="_blank" >
                                            read article
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>}
                />

            )}

            {secFiling && (
                <BlurInTextWithCollapsible
                    text={<BlurIn
                        icon={<CheckCircleIcon width='20' />}
                        word={`Fetching ${selectedSymbol}'s latest ${secFiling.filing.form} sec filing`}
                        className="text-sm text-start text-black dark:text-white"
                    />}
                    collapsible={<div className="w-full max-w-4xl mt-4">
                        <div className="p-4 border border-gray-200 rounded-md flex justify-between gap-4 align-start">
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
                    </div>}
                />
            )}
        </div>
    )
}
