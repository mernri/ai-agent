import {
    IncomeStatementType,
    SecSectionResponseType,
}
    from "@/lib/tools/tools_types"

export async function fetchIncomeStatement(symbol: string): Promise<IncomeStatementType> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/get_income_statement?symbol=${symbol}`);

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Error fetching income statement: ${errorDetails.detail}`);
    }

    const data: IncomeStatementType = await response.json();
    return data;
}


export async function fetchSecSection(ticker_symbol: string, section: string, fyear?: string, report_address?: string): Promise<SecSectionResponseType> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = new URL(`${baseUrl}/api/get_10k_section`);

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

    const data: SecSectionResponseType = await response.json();
    return data;
}
