import { create } from 'zustand';

interface InterviewState {
    status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED';
    currentQuestionIndex: number;
    answers: Record<string, string>; // questionId -> answerText
    recordingStatus: 'OFF' | 'LISTENING' | 'PROCESSING';
    plagiarismRisk: 'NONE' | 'LOW' | 'HIGH';

    startInterview: () => void;
    endInterview: () => void;
    nextQuestion: () => void;
    submitAnswer: (questionId: string, answer: string) => void;
    setRecordingStatus: (status: 'OFF' | 'LISTENING' | 'PROCESSING') => void;
    setPlagiarismRisk: (risk: 'NONE' | 'LOW' | 'HIGH') => void;
    resetInterview: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
    status: 'IDLE',
    currentQuestionIndex: 0,
    answers: {},
    recordingStatus: 'OFF',
    plagiarismRisk: 'NONE',

    startInterview: () => set({ status: 'IN_PROGRESS', currentQuestionIndex: 0 }),
    endInterview: () => set({ status: 'COMPLETED' }),
    nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
    submitAnswer: (qId, ans) => set((state) => ({
        answers: { ...state.answers, [qId]: ans }
    })),
    setRecordingStatus: (status) => set({ recordingStatus: status }),
    setPlagiarismRisk: (risk) => set({ plagiarismRisk: risk }),
    resetInterview: () => set({
        status: 'IDLE',
        currentQuestionIndex: 0,
        answers: {},
        recordingStatus: 'OFF',
        plagiarismRisk: 'NONE'
    }),
}));
