"use client"

import { useState, useEffect } from "react"
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface RetrievedFilesProps {
    symbol: string;
}

export function RetrievedFiles({ symbol }: RetrievedFilesProps) {
    const [incomeStatement, setIncomeStatement] = useState<IncomeStatementResponse | null>(null);
    const [secSection, setSecSection] = useState<SecSectionResponse | null>(null);
    const [basicFinancials, setBasicFinancials] = useState<BasicFinancialsResponse | null>(null);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileResponse | null>(null);
    const [companyNews, setCompanyNews] = useState<CompanyNewsResponse | null>(null);
    const [secFiling, setSecFiling] = useState<SecFilingResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (symbol) {
            handleCompanyProfile(symbol);
            handleFetchIncomeStatement(symbol);
            // handleFetchSecSection(symbol, "7");
            handleBasicFinancials(symbol, ['revenueTTm', 'debtEquityTTM', 'peRatioTTM',
                'pegRatioTTM', 'priceToBookTTM', 'priceToSalesTTM', 'dividendYieldTTM', 'roeTTM']);
            handleCompanyNews(symbol);
            handleSecFiling(symbol, "10-K");
        }
    }, [symbol]);

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

    if (!symbol) return null;

    return (
        <div className="space-y-4 ml-3">
            <Accordion type="single" collapsible className="w-full">
                {companyProfile && (
                    <AccordionItem value="company-profile">
                        <AccordionTrigger>
                            <BlurIn
                                icon={<CheckCircleIcon width='20' />}
                                word={`Company profile extracted successfully`}
                                className="text-sm text-start text-black dark:text-white"
                            />
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-justify">{he.decode(companyProfile.company_profile)}</pre>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {incomeStatement && (
                    <AccordionItem value="income-statement">
                        <AccordionTrigger>
                            <BlurIn
                                icon={<CheckCircleIcon width='20' />}
                                word={`Retrieved last income statement`}
                                className="text-sm text-start text-black dark:text-white"
                            />
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="overflow-y-auto">
                                <CustomTable
                                    title={`Income statement for ${symbol}`}
                                    content_dict={incomeStatement.income_statement}
                                    cols={Object.keys(incomeStatement.income_statement)}
                                    rows={Object.keys(incomeStatement.income_statement[Object.keys(incomeStatement.income_statement)[0]])}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {secSection && (
                    <AccordionItem value="sec-section">
                        <AccordionTrigger>
                            <BlurIn
                                icon={<CheckCircleIcon width='20' />}
                                word={`Retrieved section ${secSection.section} from 10-k sec filing ${secSection.fiscal_year}`}
                                className="text-sm text-start text-black dark:text-white"
                            />
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-justify">{he.decode(secSection.section_text)}</pre>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {basicFinancials && (
                    <AccordionItem value="basic-financials">
                        <AccordionTrigger>
                            <BlurIn
                                icon={<CheckCircleIcon width='20' />}
                                word={`Retrieved last financial metrics`}
                                className="text-sm text-start text-black dark:text-white"
                            />
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="overflow-y-auto">
                                <CustomTable
                                    title={`Basic Financials for ${symbol}`}
                                    content_dict={{ value: basicFinancials.financials }}
                                    cols={["value"]}
                                    rows={Object.keys(basicFinancials.financials)}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {companyNews && (
                    <AccordionItem value="company-news">
                        <AccordionTrigger>
                            <BlurIn
                                icon={<CheckCircleIcon width='20' />}
                                word={`Searching for the ${symbol}'s latest news`}
                                className="text-sm text-start text-black dark:text-white"
                            />
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="overflow-y-auto space-y-4">
                                {companyNews.news.map((news, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-md flex justify-between gap-4 align-start">
                                        <div>
                                            <h3 className="font-semibold">{news.headline}</h3>
                                            <p>{news.source} | {formatUglyDate(news.date)}</p>
                                        </div>
                                        <div>
                                            <Button asChild variant="outline">
                                                <a href={news.url} target="_blank" rel="noopener noreferrer">
                                                    read article
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {secFiling && (
                    <AccordionItem value="sec-filing">
                        <AccordionTrigger>
                            <BlurIn
                                icon={<CheckCircleIcon width='20' />}
                                word={`Fetching ${symbol}'s latest ${secFiling.filing.form} sec filing`}
                                className="text-sm text-start text-black dark:text-white"
                            />
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="overflow-y-auto">
                                <div className="p-4 border border-gray-200 rounded-md flex justify-between gap-4 align-start">
                                    <div>
                                        <h3 className="font-semibold">SEC Filing for {symbol} - {secFiling.filing.form}</h3>
                                        <p>Accepted on: {secFiling.filing.acceptedDate}</p>
                                        <p>Filed on: {secFiling.filing.filedDate}</p>
                                    </div>
                                    <div>
                                        <Button asChild variant="outline">
                                            <a href={secFiling.filing.reportUrl} target="_blank" rel="noopener noreferrer">
                                                open {secFiling.filing.form} filing
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </div>
    )
}