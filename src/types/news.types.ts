export enum NewsCategory {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
}

export type News = {
  news: NewsItem[];
  total: number;
};

export type NewsItem = {
  uuid: string;
  published: boolean;
  title: string;
  content: string;
  category: NewsCategory;
  external_link: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  AdminNews: Array<{
    created_by: boolean;
    created_at: Date;
    User: {
      email: string;
      full_name: string;
    };
  }>;
};
