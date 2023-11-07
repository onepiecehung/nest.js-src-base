import { Module, Global } from "@nestjs/common";
import { CacheController } from "./cache.controller";
import { RedisCacheService } from "./cache.service";

@Global()
@Module({
  controllers: [CacheController],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
