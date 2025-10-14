"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Trophy,
    Users,
    Lightbulb,
    Target,
    Gift,
    ArrowRight,
    Loader2,
    CheckCircle,
    Heart,
    Sparkles,
    Mail,
    Share2
} from "lucide-react"
import Image from "next/image"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from 'react-i18next';

interface AnalysisResult {
    precisa_refazer?: boolean
    titulo_personalizado: string
    resumo_motivador: string
    mentores_sugeridos: Array<{
        tipo: string
        razao: string
        disponivel: boolean
        mentor_nome?: string
    }>
    conselhos_praticos: string[]
    proximos_passos: string[]
    areas_desenvolvimento: string[]
    mensagem_final: string
    potencial_mentor?: boolean
    areas_vida_pessoal?: string[]
}

interface QuizResponse {
    id: string
    name: string
    email: string
    score: number
    ai_analysis: AnalysisResult
    processed_at: string
}

export default function QuizResultsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useTranslation('quiz');
    const [loading, setLoading] = useState(true)
    const [response, setResponse] = useState<QuizResponse | null>(null)
    const [selectedGift, setSelectedGift] = useState<"caneta" | "botton" | null>(
        null
    )
    const [sendingEmail, setSendingEmail] = useState(false)

    useEffect(() => {
        loadResults()
    }, [params.id])

    const handleSendEmail = async () => {
        if (!response) return

        setSendingEmail(true)
        try {
            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()

            const { error } = await supabase.functions.invoke("send-quiz-email", {
                body: { responseId: response.id }
            })

            if (error) throw error

            toast({
                title: t('quiz_results.email_sent_toast_title'),
                description: t('quiz_results.email_sent_toast_description')
            })
        } catch (error) {
            console.error("Error sending email:", error)
            toast({
                title: t('quiz_results.error_sending_email_toast_title'),
                description: t('quiz_results.error_sending_email_toast_description'),
                variant: "destructive"
            })
        } finally {
            setSendingEmail(false)
        }
    }

    const handleShareWhatsApp = () => {
        if (!response) return

        const currentUrl = window.location.href
        const text = t('quiz_results.potential_analysis_whatsapp_message', { currentUrl });

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(whatsappUrl, "_blank")
    }

    const handleShareLinkedIn = () => {
        if (!response) return

        const currentUrl = window.location.href
        const text = t('quiz_results.potential_analysis_linkedin_message', { currentUrl });

        const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
            text
        )}`
        window.open(linkedinUrl, "_blank")
    }

    const loadResults = async () => {
        try {
            const { createClient } = await import("@/utils/supabase/client")
            const supabase = createClient()

            const { data, error } = await supabase
                .from("quiz_responses")
                .select("*")
                .eq("id", params.id)
                .single()

            if (error) throw error

            // Wait for processing if not done yet
            if (!data.processed_at) {
                setTimeout(loadResults, 2000) // Retry after 2 seconds
                return
            }

            setResponse(data)
        } catch (error) {
            console.error("Error loading results:", error)
            toast({
                title: t('quiz_results.error_loading_results_toast_title'),
                description: t('quiz_results.error_loading_results_toast_description'),
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading || !response) {
        return (
            <AnimatedBackground>
                <div className="flex items-center justify-center min-h-screen">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center space-y-4">
                                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">
                                        {t('quiz_results.processing_analysis')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {t('quiz_results.ai_is_analyzing')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AnimatedBackground>
        )
    }

    const analysis = response.ai_analysis
    const hasGift = true // Sempre mostrar brinde

    // Se precisa refazer, mostra interface especial
    if (analysis.precisa_refazer) {
        return (
            <AnimatedBackground>
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center space-y-6 mb-8">
                            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full text-orange-700 dark:text-orange-300 text-sm font-medium">
                                <Target className="h-4 w-4" />
                                {t('quiz_results.incomplete_analysis')}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#007585' }}>
                                {analysis.titulo_personalizado}
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                {analysis.resumo_motivador}
                            </p>
                        </div>

                        <Card className="border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-4">
                                    <Target className="h-16 w-16 text-orange-600 mx-auto" />
                                    <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100">
                                        {t('quiz_results.lets_try_again')}
                                    </h3>
                                    <p className="text-orange-800 dark:text-orange-200 max-w-md mx-auto">
                                        {analysis.mensagem_final}
                                    </p>
                                    <div className="pt-4">
                                        <Button
                                            size="lg"
                                            onClick={() => router.push('/quiz')}
                                            className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white"
                                        >
                                            {t('quiz_results.retake_quiz')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dicas para melhorar as respostas */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                                    {t('quiz_results.tips_for_better_analysis')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {analysis.conselhos_praticos.map((conselho, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>{conselho}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AnimatedBackground>
        )
    }

    return (
        <AnimatedBackground>
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header with Score */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 px-4 py-2 rounded-full text-teal-700 dark:text-teal-300 text-sm font-medium">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {t('quiz_results.personalized_analysis')}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold">
                            {analysis.titulo_personalizado}
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {analysis.resumo_motivador}
                        </p>
                    </div>

                    {/* Gift Selection (if score >= 700) */}
                    {hasGift && (
                        <Card className="border-2 border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Gift className="h-6 w-6 text-green-600" />
                                    <CardTitle className="text-green-900 dark:text-green-100">
                                        {t('quiz_results.congratulations_gift')}
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-green-800 dark:text-green-200">
                                    {t('quiz_results.choose_gift')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Button
                                        variant={selectedGift === "caneta" ? "default" : "outline"}
                                        className="h-32 text-lg flex-col p-4"
                                        onClick={() => setSelectedGift("caneta")}
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="relative w-24 h-24">
                                                <Image
                                                    src="/images/menvo-caneta.jpeg"
                                                    alt={t('quiz_results.pen')}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                />
                                            </div>
                                            <span className="font-semibold">{t('quiz_results.pen')}</span>
                                            {selectedGift === "caneta" && (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </Button>
                                    <Button
                                        variant={selectedGift === "botton" ? "default" : "outline"}
                                        className="h-32 text-lg flex-col p-4"
                                        onClick={() => setSelectedGift("botton")}
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="relative w-24 h-24">
                                                <Image
                                                    src="/images/menvo-botton.jpeg"
                                                    alt={t('quiz_results.button')}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                />
                                            </div>
                                            <span className="font-semibold">{t('quiz_results.button')}</span>
                                            {selectedGift === "botton" && (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </Button>
                                </div>
                                <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                                    <p className="text-sm text-center text-green-800 dark:text-green-200 font-medium">
                                        {t('quiz_results.important_gift_choice')}
                                    </p>
                                    {selectedGift && (
                                        <p className="text-sm text-center mt-2 text-green-800 dark:text-green-200">
                                            {t('quiz_results.you_chose')}{" "}
                                            <strong>
                                                {selectedGift === "caneta" ? t('quiz_results.pen') : t('quiz_results.button')}
                                            </strong>
                                            <br />
                                            {t('quiz_results.show_result_at_stand')}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Mentors Suggested */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-6 w-6 text-blue-600" />
                                <CardTitle>{t('quiz_results.suggested_mentors')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('quiz_results.based_on_interests')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-200" dangerouslySetInnerHTML={{ __html: t('quiz_results.mentor_status_tooltip') }} />
                            </div>
                            {analysis.mentores_sugeridos.map((mentor, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg">{mentor.tipo}</h4>
                                            {mentor.mentor_nome && (
                                                <p className="text-sm text-muted-foreground">
                                                    {t('quiz_results.mentor')}: {mentor.mentor_nome}
                                                </p>
                                            )}
                                        </div>
                                        <Badge
                                            variant={mentor.disponivel ? "default" : "secondary"}
                                            className={
                                                mentor.disponivel
                                                    ? "bg-green-600 hover:bg-green-700"
                                                    : "bg-orange-500 text-white"
                                            }
                                        >
                                            <CheckCircle
                                                className={`h-3 w-3 mr-1 ${mentor.disponivel ? "text-white" : "text-white"
                                                    }`}
                                            />
                                            {mentor.disponivel ? t('quiz_results.available') : t('quiz_results.full_schedule')}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {mentor.razao}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Practical Advice */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-6 w-6 text-yellow-600" />
                                <CardTitle>{t('quiz_results.practical_advice')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {analysis.conselhos_praticos.map((conselho, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>{conselho}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Next Steps */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Target className="h-6 w-6 text-purple-600" />
                                <CardTitle>{t('quiz_results.next_steps')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {analysis.proximos_passos.map((passo, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <ArrowRight className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <span>{passo}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Development Areas */}
                    {analysis.areas_desenvolvimento &&
                        analysis.areas_desenvolvimento.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('quiz_results.development_areas')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.areas_desenvolvimento.map((area, index) => (
                                            <Badge key={index} variant="outline" className="text-sm">
                                                {area}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    {/* Final Message */}
                    <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-2 border-teal-200 dark:border-teal-700">
                        <CardContent className="pt-6">
                            <p
                                className="text-center text-lg font-medium mb-4"
                                style={{ color: "#007585" }}
                            >
                                {analysis.mensagem_final}
                            </p>

                            {/* Potential Mentor Section */}
                            {analysis.potencial_mentor && (
                                <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-teal-200 dark:border-teal-700">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 text-teal-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-base text-teal-900 dark:text-teal-100">
                                                {t('quiz_results.final_message_potential_mentor')}
                                            </h4>
                                            <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                                                {t('quiz_results.final_message_potential_mentor_description')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Share Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">
                                {t('quiz_results.share_results')}
                            </CardTitle>
                            <CardDescription className="text-center">
                                {t('quiz_results.share_results_description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={handleSendEmail}
                                    disabled={sendingEmail}
                                    className="w-full"
                                >
                                    {sendingEmail ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('quiz_results.sending')}
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                            {t('quiz_results.send_by_email')}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={handleShareWhatsApp}
                                    className="w-full bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    {t('quiz_results.whatsapp')}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={handleShareLinkedIn}
                                    className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    {t('quiz_results.linkedin')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedBackground>
    )
}
