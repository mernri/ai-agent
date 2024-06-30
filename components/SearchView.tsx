import { SearchBar } from "@/components/ui/search-bar";

type SearchViewProps = {
    onSymbolSelect: (symbol: string) => void;
};

const SearchView: React.FC<SearchViewProps> = ({ onSymbolSelect }) => (
    <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold mb-6">Investment memo generator</h1>
        <p className="text-xl mb-8 text-center">
            Select a stock symbol to start analyzing and discussing financial data.
        </p>
        <div className="w-full max-w-md">
            <SearchBar onSymbolSelect={onSymbolSelect} />
        </div>
    </div>
);

export default SearchView;
