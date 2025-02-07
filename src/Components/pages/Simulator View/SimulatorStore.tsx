import { StateCreator, create } from 'zustand';
import { Instruction } from '../../../Service/SharedData';

type ProgramState = {
  program: Instruction[];
  setProgram: (program: Instruction[]) => void;
  addInstruction: (instruction: Instruction) => void;
};

export const useProgramStore = create<ProgramState>((set, get) => ({
  program: [],
  setProgram: (program: Instruction[]) => set({ program }),
  addInstruction: (instruction: Instruction) => set((state) => ({ program: [...state.program, instruction] })),
}));