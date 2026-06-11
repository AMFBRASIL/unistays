import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  Sparkles,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Minus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SentimentAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reviews = [
  {
    id: 1,
    guest: "Maria Silva",
    channel: "Booking.com",
    date: "2024-03-10",
    rating: 4,
    text: "Ótimo hotel, localização perfeita! O café da manhã poderia ter mais opções de frutas. Quarto limpo e confortável.",
    sentiment: "positivo",
    issues: ["Café da manhã - variedade de frutas"],
    highlights: ["Localização", "Limpeza", "Conforto"]
  },
  {
    id: 2,
    guest: "João Santos",
    channel: "Google",
    date: "2024-03-09",
    rating: 2,
    text: "Ar condicionado do quarto não funcionava bem. Demorou muito para conseguir outro quarto. Decepcionante.",
    sentiment: "negativo",
    issues: ["Ar condicionado", "Tempo de resposta da recepção"],
    highlights: []
  },
  {
    id: 3,
    guest: "Ana Costa",
    channel: "Expedia",
    date: "2024-03-08",
    rating: 5,
    text: "Experiência incrível! Equipe super atenciosa, quarto maravilhoso com vista para o mar. Voltarei com certeza!",
    sentiment: "positivo",
    issues: [],
    highlights: ["Atendimento", "Vista", "Quarto"]
  },
  {
    id: 4,
    guest: "Carlos Oliveira",
    channel: "Booking.com",
    date: "2024-03-07",
    rating: 3,
    text: "Hotel ok, nada excepcional. Wi-Fi muito lento, dificultou trabalhar remotamente. Café da manhã bom.",
    sentiment: "neutro",
    issues: ["Wi-Fi lento"],
    highlights: ["Café da manhã"]
  }
];

const recurringIssues = [
  { issue: "Ar condicionado", mentions: 12, trend: "up", priority: "alta" },
  { issue: "Wi-Fi lento", mentions: 8, trend: "stable", priority: "média" },
  { issue: "Café da manhã - variedade", mentions: 6, trend: "down", priority: "baixa" },
  { issue: "Barulho externo", mentions: 5, trend: "up", priority: "média" },
  { issue: "Check-in demorado", mentions: 4, trend: "down", priority: "baixa" }
];

const sentimentStats = {
  positive: 68,
  neutral: 20,
  negative: 12,
  avgRating: 4.2,
  totalReviews: 156,
  responseRate: 89
};

export default function SentimentAnalysisModal({ open, onOpenChange }: SentimentAnalysisModalProps) {
  const { toast } = useToast();

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positivo": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "negativo": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positivo": return ThumbsUp;
      case "negativo": return ThumbsDown;
      default: return Minus;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "bg-red-500/20 text-red-400";
      case "média": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-green-500/20 text-green-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-slate-900 border-white/10">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">Análise de Sentimento</DialogTitle>
              <p className="text-sm text-slate-400">Processe reviews e identifique problemas recorrentes</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Star className="h-4 w-4" />
                    Nota Média
                  </div>
                  <p className="text-2xl font-bold text-amber-400">{sentimentStats.avgRating}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <MessageSquare className="h-4 w-4" />
                    Total Reviews
                  </div>
                  <p className="text-2xl font-bold text-white">{sentimentStats.totalReviews}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <ThumbsUp className="h-4 w-4" />
                    Positivos
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{sentimentStats.positive}%</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Taxa Resposta
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{sentimentStats.responseRate}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Sentiment Distribution */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-pink-400" />
                  Distribuição de Sentimentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400 flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" /> Positivo
                      </span>
                      <span className="text-emerald-400">{sentimentStats.positive}%</span>
                    </div>
                    <Progress value={sentimentStats.positive} className="h-2 bg-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-400 flex items-center gap-2">
                        <Minus className="h-4 w-4" /> Neutro
                      </span>
                      <span className="text-yellow-400">{sentimentStats.neutral}%</span>
                    </div>
                    <Progress value={sentimentStats.neutral} className="h-2 bg-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-400 flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4" /> Negativo
                      </span>
                      <span className="text-red-400">{sentimentStats.negative}%</span>
                    </div>
                    <Progress value={sentimentStats.negative} className="h-2 bg-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recurring Issues */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Problemas Recorrentes (Identificados pela IA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recurringIssues.map((issue, idx) => (
                  <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Lightbulb className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{issue.issue}</p>
                        <p className="text-sm text-slate-400">{issue.mentions} menções nos últimos 30 dias</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {issue.trend === "up" && <TrendingUp className="h-4 w-4 text-red-400" />}
                        {issue.trend === "down" && <TrendingDown className="h-4 w-4 text-emerald-400" />}
                        {issue.trend === "stable" && <Minus className="h-4 w-4 text-yellow-400" />}
                      </div>
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                      <Button size="sm" variant="outline" className="border-white/10 text-slate-300 hover:bg-slate-700">
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Reviews Recentes Analisados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review) => {
                  const SentimentIcon = getSentimentIcon(review.sentiment);
                  return (
                    <div key={review.id} className="p-4 bg-slate-700/30 rounded-lg border border-white/5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium">
                            {review.guest.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{review.guest}</p>
                            <p className="text-xs text-slate-400">{review.channel} • {review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                              />
                            ))}
                          </div>
                          <Badge className={getSentimentColor(review.sentiment)}>
                            <SentimentIcon className="h-3 w-3 mr-1" />
                            {review.sentiment}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm mb-3">"{review.text}"</p>
                      <div className="flex flex-wrap gap-2">
                        {review.issues.map((issue, idx) => (
                          <Badge key={idx} variant="outline" className="border-red-500/30 text-red-400 text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            {issue}
                          </Badge>
                        ))}
                        {review.highlights.map((highlight, idx) => (
                          <Badge key={idx} variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
