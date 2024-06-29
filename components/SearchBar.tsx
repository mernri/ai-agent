"use client"
import { FormEvent, useState } from "react"
import InputSymbolAutocomplete from "@/components/ui/input-autocomplete"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
    onSymbolSelect: (symbol: string) => void;
}

export function SearchBar({ onSymbolSelect }: SearchBarProps) {
    const [selectedSymbol, setSelectedSymbol] = useState<string>("")

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (selectedSymbol) {
            onSymbolSelect(selectedSymbol);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row flex-grow items-center gap-3 mb-6 w-full">
            <p className="whitespace-nowrap text-l font-bold w-full lg:w-auto">Generate a financial report for</p>
            <div className="flex flex-row flex-grow items-center space-x-2 w-full">
                <InputSymbolAutocomplete handleSelectSymbol={setSelectedSymbol} />
                <Button type="submit" className="whitespace-nowrap">Generate</Button>
            </div>
        </form>
    )
}