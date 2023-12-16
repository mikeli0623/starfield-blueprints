export interface PostResponse {
  confidenceScore: number;
  createdAt: string;
  likes: number;
  description: string;
  about: string;
  title: string;
  imageKeys: string[];
  videos: string[];
  shipParts: { partName: string; amount: number }[];
  userId: {
    id: string;
    iv: string;
  };
  username: string;
  _id: string;
  tags: string[];
}

export interface UserResponse {
  id: string;
  iv: string;
  username: string;
  isAdmin: boolean;
  posts: string[];
  likedPosts: string[];
}

export interface UserPopulateResponse {
  id: string;
  iv: string;
  username: string;
  isAdmin: boolean;
  posts: PostResponse[];
  likedPosts: PostResponse[];
}

export interface TagOptions {
  unmodded: boolean;
  modded: boolean;
  glitched: boolean;
}

export type ImageResponse = string[];

export interface Skills {
  [skill: string]: number;
}

export interface Part {
  partName: string;
  moduleType: string;
  cost: number;
  unlockLevel: number;
  class?: "A" | "B" | "C" | "M";
  skills?: Skills;
}

export interface PreviewPost {
  description: string;
  title: string;
  about: string;
  hasMulterImages: boolean;
  videos: string[];
  shipParts: { part: Part; amount: number }[];
  username: string;
  tags: string[];
  type: string;
  id?: string;
  awsImages?: string[];
  awsImageOrder?: number[];
}
