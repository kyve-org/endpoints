export interface Config {
  rpc: string;
}

export interface PoolsResponse {
  pools: {
    id: string;
    config: string;
  }[];
}

export interface StakeInfoResponse {
  current_stake: string;
}
