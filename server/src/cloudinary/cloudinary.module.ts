import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";

@Module({
  imports: [MulterModule.register()],
  providers: [],
  exports: [],
})
export class CloudinaryModule {}
