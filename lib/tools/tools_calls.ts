import {
    IncomeStatementResponse,
    SecSectionResponse,
    BasicFinancialsResponse,
    CompanyProfileResponse,
    CompanyNewsResponse,
    SecFilingResponse
} from "@/lib/tools/tools_types"


type ToolFunction = (...args: any[]) => any;
interface ToolsNames {
    [key: string]: ToolFunction;
}

export const TOOLS_NAMES: ToolsNames = {
    "say_hello_tool": say_hello,
    // "get_company_profile_tool": fetchCompanyProfile,
    // "get_company_news_tool": fetchCompanyNews,
    // "get_basic_financials_tools": fetchBasicFinancials,
    // "get_income_statement_tool": fetchIncomeStatement,
    // "get_10k_section_tool": fetchSecSection,
    // "get_sec_filing_tool": fetchSecFiling
}

export function say_hello() {
    return `Hello, Code 4555!`
}

export async function fetchIncomeStatement(symbol: string): Promise<IncomeStatementResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/py/get_income_statement?symbol=${symbol}`);

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Error fetching income statement: ${errorDetails.detail}`);
    }

    const data: IncomeStatementResponse = await response.json();
    return data;
}


export async function fetchSecSection(ticker_symbol: string, section: string, fyear?: string, report_address?: string): Promise<SecSectionResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = new URL(`${baseUrl}/api/py/get_10k_section`);

    url.searchParams.append('ticker_symbol', ticker_symbol);
    url.searchParams.append('section', section);

    if (fyear) {
        url.searchParams.append('fyear', fyear);
    }

    if (report_address) {
        url.searchParams.append('report_address', report_address);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Error fetching 10-K section: ${errorDetails.detail}`);
    }

    const data: SecSectionResponse = await response.json();
    return data;
}


export async function fetchBasicFinancials(symbol: string, selectedColumns?: string[]): Promise<BasicFinancialsResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const params = new URLSearchParams({ symbol });

    if (selectedColumns) {
        params.append('selected_columns', selectedColumns.join(','));
    }

    const response = await fetch(`${baseUrl}/api/py/get_basic_financials?${params.toString()}`);

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Error fetching basic financials: ${errorDetails.detail}`);
    }

    const data: BasicFinancialsResponse = await response.json();
    return data;
}



export async function fetchCompanyProfile(symbol: string): Promise<CompanyProfileResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/py/get_company_profile?symbol=${symbol}`);

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Error fetching company profile: ${errorDetails.detail}`);
    }

    const data: CompanyProfileResponse = await response.json();
    return data;
}


export async function fetchCompanyNews(symbol: string, start_date?: string, end_date?: string, max_news_num: number = 10): Promise<CompanyNewsResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const params = new URLSearchParams({ symbol });

    if (start_date) {
        params.append('start_date', start_date);
    }

    if (end_date) {
        params.append('end_date', end_date);
    }

    params.append('max_news_num', max_news_num.toString());

    const response = await fetch(`${baseUrl}/api/py/get_company_news?${params.toString()}`);

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Error fetching company news: ${errorDetails.detail}`);
    }

    const data: CompanyNewsResponse = await response.json();

    console.log("COMPANY NEWS = ", data)
    return data;
}

export async function fetchSecFiling(symbol: string, form?: string, fromDate?: string, toDate?: string): Promise<SecFilingResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const params = new URLSearchParams({ symbol });

    if (form) {
        params.append('form', form);
    }
    if (fromDate) {
        params.append('from_date', fromDate);
    }
    if (toDate) {
        params.append('to_date', toDate);
    }

    const response = await fetch(`${baseUrl}/api/py/get_sec_filing?${params.toString()}`);

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Error fetching SEC filing: ${errorDetails.detail}`);
    }

    const data: SecFilingResponse = await response.json();
    return data;
}