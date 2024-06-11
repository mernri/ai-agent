"use client"

import { Button } from "@/components/ui/button"
import { FormEvent, useState } from "react"
import InputSymbolAutocomplete from "@/components/ui/input-autocomplete"
import { CustomTable } from "@/components/ui/custom-table"
import he from 'he';

import {
    fetchIncomeStatement,
    fetchSecSection
} from "@/lib/tools/tools_calls"

import {
    IncomeStatementType,
    SecSectionResponseType
} from "@/lib/tools/tools_types"

export const Header = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>("")
    const [incomeStatement, setIncomeStatement] = useState<IncomeStatementType | null>(null);
    const [secSection, setSecSection] = useState<SecSectionResponseType | null>(null);
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


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (selectedSymbol) {
            handleFetchIncomeStatement(selectedSymbol);
            handleFetchSecSection(selectedSymbol, "7")
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <form onSubmit={handleSubmit} className="flex flex-grow items-center space-x-2">
                <p className="whitespace-nowrap">Generate a financial report for</p>
                <InputSymbolAutocomplete handleSelectSymbol={setSelectedSymbol} />
                <Button type="submit">Generate</Button>
            </form>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            {/* {incomeStatement && (
                <div className="w-full max-w-4xl mt-4">
                    <CustomTable title={`Income statement for ${selectedSymbol}`} content_dict={incomeStatement.income_statement} />
                </div>
            )} */}

            {/* {secSection && (
                <pre className="whitespace-pre-wrap text-justify">{he.decode(secSection.section_text)}</pre>

            )} */}


        </div>
    )
}
