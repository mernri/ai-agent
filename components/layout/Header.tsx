"use client"

import { Button } from "@/components/ui/button"
import { FormEvent, useState } from "react"
import InputSymbolAutocomplete from "@/components/ui/input-autocomplete"

export const Header = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>("")

    const handleGenerateReport = (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault()
        console.log("Generate report for symbol", selectedSymbol)
    }

    return (
        <div className="flex items-center gap-3 w-full">
            <p className="whitespace-nowrap">Generate a financial report for</p>
            <div className="flex flex-grow items-center space-x-2">
                <InputSymbolAutocomplete handleSelectSymbol={setSelectedSymbol} />
                <Button type="submit" onClick={(e) => handleGenerateReport(e)}>Generate</Button>
            </div>

        </div>
    )
}