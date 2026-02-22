export type AnimationType = 'hearts' | 'sparkles' | 'float' | 'none';
export type OccasionType = 'declaration' | 'proposal' | 'anniversary';

export interface DeclarationState {
  occasion: OccasionType;
  title: string;
  subtitle: string;
  message: string;
  footer: string;
  images: string[];
  backgroundColor: string;
  textColor: string;
  animation: AnimationType;
  buttonTextYes: string;
  buttonTextNo: string;
  showCountdown: boolean;
  startDate: string;
  musicUrl: string;
  musicEnabled: boolean;
  musicStartTime: number;
  musicDuration: number;
}

export const DEFAULT_STATE: DeclarationState = {
  occasion: 'proposal',
  title: "Quer namorar comigo?",
  subtitle: "Você é a melhor coisa que já me aconteceu",
  message: "Desde que te conheci, minha vida ganhou um novo brilho. Você é a pessoa que eu sempre sonhei em ter ao meu lado, compartilhando cada momento, cada risada e cada sonho.",
  footer: "Com todo o meu amor, para sempre seu.",
  images: [
    "https://picsum.photos/seed/love1/800/600",
    "https://picsum.photos/seed/love2/800/600",
    "https://picsum.photos/seed/love3/800/600",
    "https://picsum.photos/seed/love4/800/600",
    "https://picsum.photos/seed/love5/800/600",
  ],
  backgroundColor: "#fff1f2", // rose-50
  textColor: "#9f1239", // rose-800
  animation: 'hearts',
  buttonTextYes: "Sim, eu aceito!",
  buttonTextNo: "Não",
  showCountdown: true,
  startDate: new Date().toISOString().split('T')[0],
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  musicEnabled: false,
  musicStartTime: 0,
  musicDuration: 60,
};
