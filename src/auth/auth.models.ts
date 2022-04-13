export interface Config {
  rpc: string;
}

export interface PoolResponse {
  pool: {
    config: string;
    stakers: string[];
  };
}
