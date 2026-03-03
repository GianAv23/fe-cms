export enum AdsCategory {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
}

export type Ads = {
  ads: AdsItem[];
  total: number;
};

export type AdsItem = {
  uuid: string;
  published: boolean;
  title: string;
  content: string;
  category: AdsCategory;
  partner_name: string;
  external_link: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
};
