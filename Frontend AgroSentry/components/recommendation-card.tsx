import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

// Main feature
export function RecommendationCard({ text, source }: { text: string; source?: string }) {
  return (
    <Card>
      <Badge tone="grounded">Rekomendasi berdasarkan panduan resmi</Badge>
      <p className="mt-3 whitespace-pre-line text-sm text-asp-ink/90">{text}</p>
      {source && <p className="mt-3 text-xs text-asp-grounded/80">Sumber: {source}</p>}
    </Card>
  );
}
