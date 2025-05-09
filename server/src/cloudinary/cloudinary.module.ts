import { Module } from "@nestjs/common";
import { CloudinaryProvider } from "./cloudinary.provider";
import { CloudinaryService } from "./cloudinary.service";
import { MulterModule } from "@nestjs/platform-express";

@Module({
  imports: [MulterModule.register()],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
