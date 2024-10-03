import React, { useState } from 'react'
import { Send } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: This is not recommended for production
})

const Chatbot: React.FC = () => {
  const [input, setInput] = useState('')
  const { messages, addMessage } = useChatStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      addMessage({ text: input, sender: 'user' })
      setInput('')
      setIsLoading(true)

      try {
        const botResponse = await getChatGPTResponse(input)
        addMessage({ text: botResponse, sender: 'bot' })
      } catch (error) {
        console.error('Error getting ChatGPT response:', error)
        addMessage({ text: 'Lo siento, hubo un error al procesar tu solicitud.', sender: 'bot' })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              Escribiendo...
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`text-white px-4 py-2 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={isLoading}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

async function getChatGPTResponse(input: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "Eres un asistente de ventas para una tienda de ecommerce. Tu tarea es ayudar a los clientes a encontrar productos, responder preguntas sobre productos y proporcionar recomendaciones. Sé amable, profesional y conciso en tus respuestas." },
      { role: "user", content: input }
    ],
    model: "gpt-3.5-turbo",
  })

  return completion.choices[0].message.content || "Lo siento, no pude generar una respuesta."
}

export default Chatbot