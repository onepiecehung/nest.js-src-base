import { Controller } from "@nestjs/common";
import { RedisCacheService } from "./cache.service";

@Controller("cache")
export class CacheController {
  constructor(private readonly cacheService: RedisCacheService) {}
}
