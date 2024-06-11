export interface IncomeStatementResponse {
    symbol: string;
    income_statement: any;
}

export interface SecSectionResponse {
    symbol: string;
    section: string;
    fiscal_year?: string;
    section_text: string;
}

export interface BasicFinancialsResponse {
    symbol: string;
    financials: Record<string, any>;
}

export interface CompanyProfileResponse {
    symbol: string;
    company_profile: string;
}

export interface CompanyNewsResponse {
    symbol: string;
    news: Array<{
        date: string;
        headline: string;
        source: string;
        url: string;
        summary: string;
    }>;
}

export interface SecFiling {
    accessNumber: string;
    symbol: string;
    cik: string;
    form: string;
    filedDate: string;
    acceptedDate: string;
    reportUrl: string;
    filingUrl: string;
}

export interface SecFilingResponse {
    symbol: string;
    filing: SecFiling;
}
