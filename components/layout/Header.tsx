"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormEvent } from "react" // Assurez-vous d'importer FormEvent

export const Header = () => {

    const handleGenerateReport = (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault()
        console.log("Generate report")
    }

    return (
        <div className="flex items-center gap-3 w-full">
            <p className="whitespace-nowrap">Generate a financial report for</p>
            <div className="flex flex-grow items-center space-x-2">
                <Input type="email" placeholder="Company name. (Ex: Apple)" />
                <Button type="submit" onClick={(e) => handleGenerateReport(e)}>Generate</Button>
            </div>
        </div>
    )
}