export interface FrameMon {
  tokenId: bigint;
  owner: string;
  name: string;
  birthDate: number;
  moodUpdate: number;
  energyUpdate: number;
  socialUpdate: number;
  mood: number;
  energy: number;
  social: number;
}

export interface MonDataResponse {
  frameMon: FrameMon;
  mood: number;
  energy: number;
  social: number;
}
