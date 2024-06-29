import React, { useState, useEffect } from "react"
import { CustomTable } from "@/components/ui/custom-table"
import { formatUglyDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid"
import { BlurIn } from "@/components/ui/text/blur-in"
import he from 'he';
import { cn } from "@/lib/utils";

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
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFetch = async (fetchFunc: Function, setDataFunc: Function, errorKey: string, ...args: any[]) => {
        try {
            const result = await fetchFunc(...args);
            setDataFunc(result);
            setErrors(prev => ({ ...prev, [errorKey]: '' }));
        } catch (err: any) {
            console.error(`Error fetching ${errorKey}:`, err);
            setErrors(prev => ({ ...prev, [errorKey]: err.message || `Failed to fetch ${errorKey}` }));
            setDataFunc(null);
        }
    };

    useEffect(() => {
        if (symbol) {
            handleFetch(fetchCompanyProfile, setCompanyProfile, 'companyProfile', symbol);
            handleFetch(fetchIncomeStatement, setIncomeStatement, 'incomeStatement', symbol);
            handleFetch(fetchBasicFinancials, setBasicFinancials, 'basicFinancials', symbol, ['revenueTTm', 'debtEquityTTM', 'peRatioTTM', 'pegRatioTTM', 'priceToBookTTM', 'priceToSalesTTM', 'dividendYieldTTM', 'roeTTM']);
            handleFetch(fetchCompanyNews, setCompanyNews, 'companyNews', symbol);
            handleFetch(fetchSecFiling, setSecFiling, 'secFiling', symbol, "10-K");
        }
    }, [symbol]);

    if (!symbol) return null;

    return (
        <div className="space-y-4 ml-3">
            <Accordion type="single" collapsible className="w-full" defaultValue="company-profile">
                {renderAccordionItem('company-profile', 'Company profile', companyProfile, errors.companyProfile, () => (
                    <div className="overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-justify">{he.decode(companyProfile?.company_profile || '')}</pre>
                    </div>
                ))}

                {renderAccordionItem('income-statement', 'Income statement', incomeStatement, errors.incomeStatement, () => (
                    <div className="overflow-y-auto">
                        {incomeStatement && incomeStatement.income_statement && (
                            <CustomTable
                                title={`Income statement for ${symbol}`}
                                content_dict={incomeStatement.income_statement}
                                cols={Object.keys(incomeStatement.income_statement)}
                                rows={Object.keys(incomeStatement.income_statement[Object.keys(incomeStatement.income_statement)[0]] || {})}
                            />
                        )}
                    </div>
                ))}

                {renderAccordionItem('basic-financials', 'Financial metrics', basicFinancials, errors.basicFinancials, () => (
                    <div className="overflow-y-auto">
                        {basicFinancials && basicFinancials.financials && (
                            <CustomTable
                                title={`Basic Financials for ${symbol}`}
                                content_dict={{ value: basicFinancials.financials }}
                                cols={["value"]}
                                rows={Object.keys(basicFinancials.financials)}
                            />
                        )}
                    </div>
                ))}

                {renderAccordionItem('company-news', 'Latest news', companyNews, errors.companyNews, () => (
                    <div className="overflow-y-auto space-y-4">
                        {companyNews && companyNews.news && companyNews.news.map((news, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-md flex justify-between gap-4 align-start">
                                <div>
                                    <h3 className="font-semibold">{news.headline}</h3>
                                    <p>{news.source} | {formatUglyDate(news.date)}</p>
                                </div>
                                <div>
                                    <Button asChild variant="outline">
                                        <a href={news.url} target="_blank" rel="noopener noreferrer">
                                            Read article
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {renderAccordionItem('sec-filing', 'Latest SEC filing', secFiling, errors.secFiling, () => (
                    <div className="overflow-y-auto">
                        {secFiling && secFiling.filing && (
                            <div className="p-4 border border-gray-200 rounded-md flex justify-between gap-4 align-start">
                                <div>
                                    <h3 className="font-semibold">SEC Filing for {symbol} - {secFiling.filing.form}</h3>
                                    <p>Accepted on: {secFiling.filing.acceptedDate}</p>
                                    <p>Filed on: {secFiling.filing.filedDate}</p>
                                </div>
                                <div>
                                    <Button asChild variant="outline">
                                        <a href={secFiling.filing.reportUrl} target="_blank" rel="noopener noreferrer">
                                            Open {secFiling.filing.form} filing
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </Accordion>
        </div>
    )
}

function renderAccordionItem(value: string, title: string, data: any, error: string | undefined, content: () => JSX.Element) {
    if (error) return

    return (
        <AccordionItem value={value}>
            <AccordionTrigger>
                <div className="flex gap-2">
                    <CheckCircleIcon width='20' />
                    {title}
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {data ? content() : (<div>Loading...</div>)}
            </AccordionContent>
        </AccordionItem>
    )
}