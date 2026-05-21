export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  initialDescription: string;
}

export interface StoryCharacter {
  name: string;
  role: string;
  codeEquivalent: string;
  description: string;
}

export interface ChapterChallenge {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface LineExplanation {
  line: string;
  meaning: string;
}

export interface StoryChapter {
  title: string;
  narrative: string;
  codeSnippet: string;
  explanation: string;
  analogy?: string;
  lineBreakdown?: LineExplanation[];
  challenge: ChapterChallenge;
}

export interface CodeStory {
  title: string;
  setting: string;
  characters: StoryCharacter[];
  chapters: StoryChapter[];
  rawThinking?: string;
}
