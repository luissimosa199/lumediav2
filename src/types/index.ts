export interface PostEntryData {
  url: string;
  caption?: string;
  idx: number;
}

export interface PostEntryProps {
  idx: number;
  length: number;
  data: PostEntryData;
}

export interface PostProps {

  title?: string;

  _id: string;
  length: number;
  post?: PostEntryData[];
  text?: string;
  createdAt: string;
  tags: string[];
  authorId: string;
  authorName: string;
  links: InputItem[];
  urlSlug?: string;
}

//

export interface PostFormInputs {

  title?: string;

  _id: string;
  text?: string;
  photo?: PostEntryData[];
  length: number;
  createdAt: string;
  tags: string[];
  authorId: string;
  authorName: string;
  links: InputItem[];
  urlSlug?: string;
}

export interface InputItem {
  value: string;
  caption?: string;
}

export interface User {
  name: string,
  email: string,
  image: string,
  photos: string[],
}
