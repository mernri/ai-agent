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
