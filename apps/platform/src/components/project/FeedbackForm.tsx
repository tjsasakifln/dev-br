'use client'

import { useState } from 'react'
import { Star, Send, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface FeedbackFormProps {
  projectId: string
  onFeedbackSubmitted: () => void
}

export default function FeedbackForm({ projectId, onFeedbackSubmitted }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Por favor, selecione uma classificação')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:3002/api/v1/projects/${projectId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          feedback: feedback.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar feedback')
      }

      setIsSubmitted(true)
      onFeedbackSubmitted()
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
      alert('Erro ao enviar feedback. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-green-700">
            <CheckCircle className="h-6 w-6 mr-2" />
            <span className="font-medium">Obrigado pelo seu feedback!</span>
          </div>
          <p className="text-center text-green-600 text-sm mt-2">
            Sua avaliação nos ajuda a melhorar a Dev BR.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Avalie sua experiência
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Como você avalia o código gerado? Seu feedback é muito importante para nós.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Classificação *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <Badge variant="outline" className="ml-3">
                  {rating === 1 && 'Muito ruim'}
                  {rating === 2 && 'Ruim'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bom'}
                  {rating === 5 && 'Excelente'}
                </Badge>
              )}
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Comentários (opcional)
            </label>
            <Textarea
              id="feedback"
              placeholder="Conte-nos mais sobre sua experiência com o código gerado..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {feedback.length}/500 caracteres
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="w-full flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}