import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mockAddresses = [
  "Av. Atlântica, 1500 - Copacabana, Rio de Janeiro - RJ",
  "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
  "Rua Augusta, 2000 - Jardins, São Paulo - SP",
  "Av. Beira Mar, 3000 - Centro, Florianópolis - SC",
  "Rua Oscar Freire, 800 - Pinheiros, São Paulo - SP",
  "Av. das Américas, 4200 - Barra da Tijuca, Rio de Janeiro - RJ",
  "Rua XV de Novembro, 500 - Centro, Curitiba - PR",
  "Av. Boa Viagem, 1200 - Boa Viagem, Recife - PE",
  "Rua das Laranjeiras, 300 - Laranjeiras, Rio de Janeiro - RJ",
  "Av. Brasil, 5000 - Centro, Belo Horizonte - MG",
  "Rua das Flores, 150 - Centro Histórico, Salvador - BA",
  "Av. Ipiranga, 2500 - República, São Paulo - SP",
  "Rua da Praia, 800 - Centro, Porto Alegre - RS",
  "Av. Getúlio Vargas, 1700 - Funcionários, Belo Horizonte - MG",
  "Rua das Dunas, 50 - Jurere, Florianópolis - SC",
];

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Digite o endereço...",
  className,
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { description: string; placeId?: string; source: "google" | "mock" }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (inputValue.trim().length <= 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      if (GOOGLE_MAPS_API_KEY) {
        try {
          const url =
            `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
            `?input=${encodeURIComponent(inputValue)}` +
            `&types=address&components=country:br&language=pt-BR` +
            `&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`;

          const response = await fetch(url);
          const data = await response.json();
          const predictions = Array.isArray(data?.predictions) ? data.predictions : [];
          if (predictions.length > 0) {
            const mapped = predictions.slice(0, 5).map((p: any) => ({
              description: String(p.description || ""),
              placeId: String(p.place_id || ""),
              source: "google" as const,
            }));
            setSuggestions(mapped);
            setIsOpen(true);
            setIsLoading(false);
            return;
          }
        } catch {
          // fallback below
        }
      }

      const filtered = mockAddresses
        .filter((addr) => addr.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 5)
        .map((description) => ({ description, source: "mock" as const }));

      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setIsLoading(false);
    }, 300);
  };

  const handleSelect = async (item: { description: string; placeId?: string; source: "google" | "mock" }) => {
    if (item.source === "google" && item.placeId && GOOGLE_MAPS_API_KEY) {
      try {
        const detailsUrl =
          `https://maps.googleapis.com/maps/api/place/details/json` +
          `?place_id=${encodeURIComponent(item.placeId)}` +
          `&fields=formatted_address&language=pt-BR` +
          `&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        const fullAddress = detailsData?.result?.formatted_address;
        onChange(typeof fullAddress === "string" && fullAddress.trim() ? fullAddress : item.description);
      } catch {
        onChange(item.description);
      }
    } else {
      onChange(item.description);
    }
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-10 pr-10", className)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 text-xs text-muted-foreground border-b border-border flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <img 
                src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" 
                alt="Google" 
                className="h-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span>Sugestões de endereço</span>
          </div>
          {suggestions.map((item, index) => (
            <button
              key={`${item.description}-${index}`}
              onClick={() => handleSelect(item)}
              className="w-full px-3 py-3 text-left hover:bg-accent transition-colors flex items-start gap-3 border-b border-border/50 last:border-0"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.description.split(" - ")[0]}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description.split(" - ").slice(1).join(" - ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
