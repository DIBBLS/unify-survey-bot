export type SurveyStatus = 'draft' | 'active' | 'closed'
export type QuestionType = 'choice' | 'rating' | 'text' | 'yes_no'

export interface Survey {
  id: string
  user_id: string
  title: string
  description: string | null
  status: SurveyStatus
  created_at: string
  updated_at: string
  questions?: Question[]
  _count?: {
    responses: number
  }
}

export interface Question {
  id: string
  survey_id: string
  text: string
  type: QuestionType
  order: number
  options?: Option[]
}

export interface Option {
  id: string
  question_id: string
  label: string
  value: string
}

export interface Session {
  id: string
  phone_number: string
  survey_id: string
  current_question_index: number
  started_at: string
  completed_at: string | null
}

export interface Response {
  id: string
  session_id: string
  survey_id: string
  phone_number: string
  completed: boolean
  created_at: string
  answers?: Answer[]
}

export interface Answer {
  id: string
  response_id: string
  question_id: string
  option_id: string | null
  text_answer: string | null
  created_at: string
}

export interface DashboardStats {
  total_surveys: number
  total_responses: number
  avg_completion_rate: number
  active_surveys: number
}
