"use client"
import { useState, useEffect } from "react"
import { CustomTable } from "@/components/ui/custom-table"
import { formatUglyDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import { BlurIn } from "@/components/ui/text/blur-in"
import he from 'he';

import {
    fetchIncomeStatement,
    fetchBasicFinancials,
    fetchCompanyProfile,
    fetchCompanyNews,
    fetchSecFiling
} from "@/lib/tools/tools_calls"

import {
    IncomeStatementResponse,
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
    const [basicFinancials, setBasicFinancials] = useState<BasicFinancialsResponse | null>(null);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileResponse | null>(null);
    const [companyNews, setCompanyNews] = useState<CompanyNewsResponse | null>(null);
    const [secFiling, setSecFiling] = useState<SecFilingResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFetch = async (fetchFunc: Function, setDataFunc: Function, ...args: any[]) => {
        try {
            const result = await fetchFunc(...args);
            setDataFunc(result);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setDataFunc(null);
        }
    };

    const handleIncomeStatement = (symbol: string) =>
        handleFetch(fetchIncomeStatement, setIncomeStatement, symbol);

    const handleBasicFinancials = (symbol: string, selectedColumns?: string[]) =>
        handleFetch(fetchBasicFinancials, setBasicFinancials, symbol, selectedColumns);

    const handleCompanyProfile = (symbol: string) =>
        handleFetch(fetchCompanyProfile, setCompanyProfile, symbol);

    const handleCompanyNews = (symbol: string, start_date?: string, end_date?: string, max_news_num: number = 10) =>
        handleFetch(fetchCompanyNews, setCompanyNews, symbol, start_date, end_date, max_news_num);

    const handleSecFiling = (symbol: string, form?: string, fromDate?: string, toDate?: string) =>
        handleFetch(fetchSecFiling, setSecFiling, symbol, form, fromDate, toDate);


    useEffect(() => {
        if (symbol) {
            handleCompanyProfile(symbol);
            handleIncomeStatement(symbol);
            handleBasicFinancials(symbol, ['revenueTTm', 'debtEquityTTM', 'peRatioTTM', 'pegRatioTTM', 'priceToBookTTM', 'priceToSalesTTM', 'dividendYieldTTM', 'roeTTM']);
            handleCompanyNews(symbol);
            handleSecFiling(symbol, "10-K");
        }
    }, [symbol]);

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