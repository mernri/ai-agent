import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface BlurInTextWithCollapsibleProps {
    text: React.ReactNode;
    collapsible: React.ReactNode;
}

export const BlurInTextWithCollapsible = ({ text, collapsible }: BlurInTextWithCollapsibleProps) => {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    {text}
                </AccordionTrigger>
                <AccordionContent>
                    <div className="w-full max-w-4xl">
                        {collapsible}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}