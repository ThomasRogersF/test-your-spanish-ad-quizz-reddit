import { QuizConfig } from "@/types/quiz";

export const sampleQuiz: QuizConfig = {
  id: "spanish-knowledge-quiz",
  title: "Test Your Spanish Knowledge",
  description: "A casual and fun quiz to assess your Spanish language skills",
  logoUrl: "https://lwfiles.mycourse.app/6409eb5798e53550d7acd5f1-public/1bfa7bb23c37499f0d5908f0a004c50e.png",
  introImageUrl: "https://spanishvip.com/wp-content/uploads/2025/04/private-tutoring.jpg",
  introText: "Test your Spanish knowledge with this casual and fun quiz! We'll cover basic greetings, vocabulary, grammar, and everyday phrases. Answer the questions below and check your scoring at the end to see your approximate Spanish level. ¡Buena suerte!",
  estimatedTime: "3-4 minutes",
  primaryColor: "#FF5913",
  secondaryColor: "#1DD3B0",
  webhookUrl: "https://hook.us2.make.com/x9laeetkiiumljb0qi3yo2c7rx3oxafr",
  incentiveEnabled: true,
  incentiveTitle: "Spanish Shortcuts Guide",
  incentiveUrl: "https://spanishvip.com/wp-content/uploads/2022/02/Easy-Spanish-Shortcuts-Updated.pdf",
  externalRedirectUrl: "https://spanishvip.com/",
  questions: [
    // ---------- A1 ----------
    {
      id: "q1",
      type: "mcq",
      title: "Choose the correct response to: ¿Cómo te llamas?",
      required: true,
      options: [
        { id: "a1", text: "Me llama Juan", value: "me_llama_juan" },
        { id: "a2", text: "Se llamo Juan", value: "se_llamo_juan" },
        { id: "a3", text: "Me llamo Sebastian", value: "me_llamo_sebastian" },
        { id: "a4", text: "Soy de Colombia", value: "soy_de_colombia" }
      ]
    },
    {
      id: "q3",
      type: "fill-in-blanks",
      title: "Complete the sentence with the correct form of the verb tener (to have): Ella ______ dos hermanos.",
      required: true
    },
    {
      id: "q5",
      type: "mcq",
      title: "Which one of the following sentences is incorrect?",
      required: true,
      options: [
        { id: "a1", text: "Pablo comprará leche en el supermercado", value: "oracion_a" },
        { id: "a2", text: "¿Tú vas a ir a la casa de María mañana?", value: "oracion_b" },
        { id: "a3", text: "Ella va a ir al supermercado", value: "oracion_c" },
        { id: "a4", text: "Pedro va a leerá un libro mañana", value: "oracion_d" }
      ]
    },

    // ---------- A2 ----------
    {
      id: "q7",
      type: "mcq",
      title: "Complete the following sentence: Ayer en la mañana Luisa _________ por todo el parque.",
      required: true,
      options: [
        { id: "a1", text: "Corrió", value: "corrio" },
        { id: "a2", text: "Correría", value: "correria" },
        { id: "a3", text: "Corró", value: "corro" },
        { id: "a4", text: "Correrá", value: "correra" }
      ]
    },
    {
      id: "q8",
      type: "mcq",
      title: "Complete the sentence by choosing the correct preposition: Este regalo es ___ ti.",
      required: true,
      options: [
        { id: "a1", text: "para", value: "para" },
        { id: "a2", text: "por", value: "por" },
        { id: "a3", text: "con", value: "con" },
        { id: "a4", text: "sin", value: "sin" }
      ]
    },
    {
      id: "q12",
      type: "audio",
      title: "What has Andrea done today?",
      audioUrl: "https://spanishvip.com/wp-content/uploads/2025/07/2-He-comido-he-trabajado-he-respondido-correos.mp3",
      required: true,
      options: [
        { id: "a1", text: "Ha hablado", value: "ha_hablado" },
        { id: "a2", text: "Ha desayunado", value: "ha_desayunado" },
        { id: "a3", text: "Ha dormido", value: "ha_dormido" },
        { id: "a4", text: "Ha trabajado", value: "ha_trabajado" }
      ]
    },

    // ---------- B1 ----------
    {
      id: "q13",
      type: "mcq",
      title: "Nosotros _____ soportando su mal humor mucho tiempo.",
      required: true,
      options: [
        { id: "a1", text: "vamos", value: "vamos" },
        { id: "a2", text: "llevamos", value: "llevamos" },
        { id: "a3", text: "quedamos", value: "quedamos" },
        { id: "a4", text: "dejamos", value: "dejamos" }
      ]
    },
    {
      id: "q15",
      type: "fill-in-blanks",
      title: "No creo que ______ lo que le pasó a mi mamá ayer en el supermercado. (presente de subjuntivo de 'saber', tú)",
      required: true
    },
    {
      id: "q17",
      type: "mcq",
      title: "Which of the following sentences is correct?",
      required: true,
      options: [
        { id: "a1", text: "Quisiera un poca de helado, por favor", value: "poca_helado" },
        { id: "a2", text: "Ojalá que te vaya bien en el examen", value: "ojala_bien" },
        { id: "a3", text: "No creo que tienen miedo", value: "tienen_miedo" },
        { id: "a4", text: "Espero que llueve mañana", value: "llueve_manana" }
      ]
    },

    // ---------- B2 ----------
    {
      id: "q19",
      type: "mcq",
      title: "Which one of the following sentences would express an involuntary or unintentional action?",
      required: true,
      options: [
        { id: "a1", text: "¿Perdiste el control remoto?", value: "perdiste_control" },
        { id: "a2", text: "Se me cayó el plato", value: "se_me_cayo" },
        { id: "a3", text: "No quería hablar con el profesor", value: "no_queria_hablar" },
        { id: "a4", text: "Mira, él no quiso limpiar la alfombra", value: "no_quiso_limpiar" }
      ]
    },
    {
      id: "q20",
      type: "mcq",
      title: "Complete the conditional sentence: 'Si hubiera tenido tu número…'",
      required: true,
      options: [
        { id: "a1", text: "Te habré llamado", value: "habre_llamado" },
        { id: "a2", text: "Te he llamado", value: "he_llamado" },
        { id: "a3", text: "Te llamaría", value: "te_llamaria" },
        { id: "a4", text: "Te habría llamado", value: "habria_llamado" }
      ]
    },
    {
      id: "q25",
      type: "mcq",
      title: "Replace the indirect and direct object in the sentence: 'Ella dijo una mentira a su cuñada'.",
      required: true,
      options: [
        { id: "a1", text: "Ella le la dijo", value: "le_la_dijo" },
        { id: "a2", text: "Ella se la dijo", value: "se_la_dijo" },
        { id: "a3", text: "Ella la dijo a ella", value: "la_dijo_a_ella" },
        { id: "a4", text: "Ella se le dijo", value: "se_le_dijo" }
      ]
    }
  ],
  resultTemplates: [
    {
      id: "a1",
      title: "A1 • Beginner",
      description: "Your approximate level is A1: you can communicate in very basic situations. Keep practicing!",
      conditions: [
        { questionId: "q1", value: "me_llamo_sebastian" },
        { questionId: "q3", value: "tiene" },
        { questionId: "q5", value: "oracion_d" }
      ]
    },
    {
      id: "a2",
      title: "A2 • Elementary",
      description: "Your approximate level is A2: you understand frequently used phrases and expressions.",
      conditions: [
        { questionId: "q7", value: "corrio" },
        { questionId: "q8", value: "para" },
        { questionId: "q12", value: "ha_trabajado" }
      ]
    },
    {
      id: "b1",
      title: "B1 • Intermediate",
      description: "Your approximate level is B1: you can handle most travel situations.",
      conditions: [
        { questionId: "q13", value: "llevamos" },
        { questionId: "q15", value: "sepas" },
        { questionId: "q17", value: "ojala_bien" }
      ]
    },
    {
      id: "b2",
      title: "B2 • Upper-Intermediate",
      description: "Your approximate level is B2: you can interact with fluency and spontaneity with native speakers.",
      conditions: [
        { questionId: "q19", value: "se_me_cayo" },
        { questionId: "q20", value: "habria_llamado" },
        { questionId: "q25", value: "se_la_dijo" }
      ]
    }
  ]
};
