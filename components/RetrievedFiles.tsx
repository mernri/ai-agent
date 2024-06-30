import React from "react"
import { CustomTable } from "@/components/ui/custom-table"
import { formatUglyDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import Image from "next/image"
import he from 'he'
import useIsMobile from "@/hooks/useIsMobile"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
    useIncomeStatement,
    useBasicFinancials,
    useCompanyProfile,
    useCompanyNews,
    useSecFiling
} from "@/hooks/useCompanyData"

interface RetrievedFilesProps {
    symbol: string;
}

export function RetrievedFiles({ symbol }: RetrievedFilesProps) {
    const isMobile = useIsMobile();

    const { data: incomeStatement, isLoading: isLoadingIncomeStatement } = useIncomeStatement(symbol);
    const { data: basicFinancials, isLoading: isLoadingBasicFinancials } = useBasicFinancials(symbol, ['revenueTTm', 'debtEquityTTM', 'peRatioTTM', 'pegRatioTTM', 'priceToBookTTM', 'priceToSalesTTM', 'dividendYieldTTM', 'roeTTM']);
    const { data: companyProfile, isLoading: isLoadingCompanyProfile } = useCompanyProfile(symbol);
    const { data: companyNews, isLoading: isLoadingCompanyNews } = useCompanyNews(symbol);
    const { data: secFiling, isLoading: isLoadingSecFiling } = useSecFiling(symbol, "10-K");

    if (!symbol) return null;

    return (
        <div className="space-y-4 ml-3">
            <Accordion type="single" collapsible className="w-full" defaultValue="company-profile">
                <AccordionItem value="company-profile">
                    <AccordionTrigger>
                        <AccordionTitle title="Company profile" />
                    </AccordionTrigger>
                    <AccordionContent>
                        {isLoadingCompanyProfile ? <LoadingPlaceholder /> : (
                            <div className="overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-justify">{he.decode(companyProfile?.company_profile ?? '')}</pre>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="income-statement">
                    <AccordionTrigger>
                        <AccordionTitle title="Income statement" />
                    </AccordionTrigger>
                    <AccordionContent>
                        {isLoadingIncomeStatement ? <LoadingPlaceholder /> : (
                            <div className="overflow-y-auto">
                                {incomeStatement?.income_statement && (
                                    <CustomTable
                                        title={`Income statement for ${symbol}`}
                                        content_dict={incomeStatement.income_statement}
                                        cols={Object.keys(incomeStatement.income_statement)}
                                        rows={Object.keys(incomeStatement.income_statement[Object.keys(incomeStatement.income_statement)[0]] ?? {})}
                                    />
                                )}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="basic-financials">
                    <AccordionTrigger>
                        <AccordionTitle title="Financial metrics" />
                    </AccordionTrigger>
                    <AccordionContent>
                        {isLoadingBasicFinancials ? <LoadingPlaceholder /> : (
                            <div className="overflow-y-auto">
                                {basicFinancials?.financials && (
                                    <CustomTable
                                        title={`Basic Financials for ${symbol}`}
                                        content_dict={{ value: basicFinancials.financials }}
                                        cols={["value"]}
                                        rows={Object.keys(basicFinancials.financials)}
                                    />
                                )}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sec-filing">
                    <AccordionTrigger>
                        <AccordionTitle title="Latest SEC filing" />
                    </AccordionTrigger>
                    <AccordionContent>
                        {isLoadingSecFiling ? <LoadingPlaceholder /> : (
                            <div className="overflow-y-auto">
                                {secFiling?.filing && (
                                    <SecFilingContent filing={secFiling.filing} symbol={symbol} isMobile={isMobile} />
                                )}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="company-news">
                    <AccordionTrigger>
                        <AccordionTitle title="Latest news" />
                    </AccordionTrigger>
                    <AccordionContent>
                        {isLoadingCompanyNews ? <LoadingPlaceholder /> : (
                            <div className="overflow-y-auto space-y-4">
                                {companyNews?.news?.map((news, index) => (
                                    <NewsItem key={index} news={news} isMobile={isMobile} />
                                ))}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

const AccordionTitle: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex gap-2">
        <CheckCircleIcon width={20} />
        {title}
    </div>
);

const LoadingPlaceholder: React.FC = () => (
    <div className="flex w-full flex-col gap-2">
        <div className="h-4 w-full animate-pulse rounded-md bg-gray-300" />
        <div className="h-4 w-full animate-pulse rounded-md bg-gray-300" />
        <div className="h-4 w-full animate-pulse rounded-md bg-gray-300" />
        <div className="h-4 w-full animate-pulse rounded-md bg-gray-300" />
        <br />
        <div className="h-4 w-full animate-pulse rounded-md bg-gray-300" />
        <div className="h-4 w-full animate-pulse rounded-md bg-gray-300" />
        <div className="h-4 w-full animate-pulse rounded-md bg-gray-300" />
    </div>
);

interface SecFilingContentProps {
    filing: any;
    symbol: string;
    isMobile: boolean;
}

const SecFilingContent: React.FC<SecFilingContentProps> = ({ filing, symbol, isMobile }) => (
    <div className="p-4 border border-gray-200 rounded-md flex justify-between gap-4 align-start">
        <div className="flex gap-4">
            <Image
                unoptimized
                src={`https://www.google.com/s2/favicons?domain=https://www.sec.gov/&sz=32`}
                alt="sec filing k-10"
                width={32}
                height={32}
                className="object-contain p-0.5"
            />
            <div>
                <h3 className="font-semibold">SEC Filing for {symbol} - {filing.form}</h3>
                {!isMobile && (
                    <div>
                        <p className="text-gray-500">Accepted on: {filing.acceptedDate}</p>
                        <p className="text-gray-500">Filed on: {filing.filedDate}</p>
                    </div>
                )}
            </div>
        </div>
        <div>
            <Button asChild variant="outline">
                <a href={filing.reportUrl} target="_blank" rel="noopener noreferrer">
                    Open {filing.form} filing
                </a>
            </Button>
        </div>
    </div>
);

interface NewsItemProps {
    news: any;
    isMobile: boolean;
}

const NewsItem: React.FC<NewsItemProps> = ({ news, isMobile }) => (
    <div className="p-4 border border-gray-200 rounded-md flex justify-between gap-4 align-start">
        <div className="flex gap-6">
            <Image
                unoptimized
                src={`https://www.google.com/s2/favicons?domain=${news.url}&sz=32`}
                alt={news.url}
                width={28}
                height={28}
                className="object-contain p-0.5 self-start"
            />
            <div>
                <h3 className="font-semibold mb-2">{news.headline}</h3>
                {!isMobile && (
                    <div>
                        <p className="italic text-gray-500">{news.summary}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatUglyDate(news.date)}</p>
                    </div>
                )}
            </div>
        </div>
        <div>
            <Button asChild variant="outline">
                <a href={news.url} target="_blank" rel="noopener noreferrer">
                    Read article
                </a>
            </Button>
        </div>
    </div>
);