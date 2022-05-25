export interface Config {
  rpc: string;
}

export interface Pool {
  config: Config;
  stakers: string[];
}

export interface PoolsResponse {
  pools: {
    id: string;
    config: string;
    stakers: string[];
  }[];
}
