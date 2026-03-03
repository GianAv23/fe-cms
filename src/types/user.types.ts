export enum StatusEnum {
  ACTIVE = "ACTIVE",
  REQUEST = "REQUEST",
  DELETED = "DELETED",
}

export enum UserRole {
  ADMIN = "ADMIN",
  NEWS_EDITOR = "NEWS_EDITOR",
  ADS_EDITOR = "ADS_EDITOR",
  DELETED = "DELETED",
}

export type Users = {
  users: UserData[];
  total: number;
};

export type UserData = {
  uuid: string;
  status: StatusEnum;
  email: string;
  full_name: string;
  password?: string;
  phone_number: string;
  roles: UserRole[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};
