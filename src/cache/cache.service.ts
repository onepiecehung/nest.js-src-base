import Cache from 'ioredis';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  constructor(@Inject() private cacheManager: Cache) {}

  private defaultTtl = 3600; // 1 hour

  async reset() {
    await this.cacheManager.reset();
  }

  async get(key: string): Promise<any> {
    const value: any = await this.cacheManager.get(key);

    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  async ttl(key: string): Promise<any> {
    const value: any = await this.cacheManager.ttl(key);

    if (!value) return null;

    try {
      return value;
    } catch (e) {
      return value;
    }
  }

  async set(
    key: string,
    value: string | Record<string, any>,
    ttlInSec?: number,
  ): Promise<any> {
    const ttl = ttlInSec ? ttlInSec : this.defaultTtl;

    if (ttl >= 0)
      await this.cacheManager.set(key, JSON.stringify(value), 'EX', ttl);
    else await this.cacheManager.set(key, JSON.stringify(value));
  }

  async exist(key: string): Promise<boolean> {
    const num = await this.cacheManager.get(key);

    return !!num;
  }

  async del(key: string) {
    return this.cacheManager.del(key);
  }
}
