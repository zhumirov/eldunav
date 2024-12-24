import { create } from "zustand";

interface UserState {
  user: {
    userId: string | null;
  };
  updateUser: (newUser: { userId: string | null }) => void;
}

interface QuizState {
  quiz: {
    quizId: string | null;
  };
  updateQuizId: (newQuiz: { quizId: string | null }) => void;
  clearQuiz: () => void;
}

export const userStore = create<UserState>((set) => ({
  user: {
    userId: null,
  },
  updateUser: (newUser: { userId: string | null }) =>
    set((state) => ({ user: { ...state.user, ...newUser } })),
}));

export const quizStore = create<QuizState>((set) => ({
  quiz: {
    quizId: null,
  },
  updateQuizId: (newQuiz: { quizId: string | null }) =>
    set((state) => ({ quiz: { ...state.quiz, ...newQuiz } })),
  clearQuiz: () => set(() => ({ quiz: { quizId: null } })),
}));
