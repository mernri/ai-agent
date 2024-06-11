export interface IncomeStatementType {
    symbol: string;
    income_statement: any;
}

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
