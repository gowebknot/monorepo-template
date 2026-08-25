export type AuthClientOptions = {
  baseURL: string;
  fetchOptions?: RequestInit;
};

export const authClientOptions = (baseURL: string): AuthClientOptions => ({
  baseURL
});
