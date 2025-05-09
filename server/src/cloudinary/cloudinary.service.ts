import { Injectable } from "@nestjs/common";
import { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import extractPublicId from "src/common/helpers/cloudinary.helper";

interface CloudinaryDestroyResponse {
  result: "ok" | "not found";
}

type DeleteImageResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

type UploadImageResult =
  | {
      success: true;
      data: UploadApiResponse[];
    }
  | {
      success: false;
      error: string;
    };

@Injectable()
export class CloudinaryService {
  constructor() {}

  async upload(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadImageResult> {
    const uploadedFiles: UploadApiResponse[] = [];

    try {
      for (const file of files) {
        const base64 = Buffer.from(file.buffer).toString("base64");
        const dataUrl = `data:${file.mimetype};base64,${base64}`;

        const uploadResult = await cloudinary.uploader.upload(dataUrl, {
          folder,
          unique_filename: true,
        });

        uploadedFiles.push(uploadResult);
      }

      return {
        success: true,
        data: uploadedFiles,
      };
    } catch (error: unknown) {
      for (const uploaded of uploadedFiles) {
        await cloudinary.uploader.destroy(uploaded.public_id);
      }
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error occurred while uploading image to Cloudinary",
      };
    }
  }

  async delete(imageUrl: string): Promise<DeleteImageResult> {
    try {
      const publicId = extractPublicId(imageUrl);
      if (!publicId) {
        return {
          success: false,
          error: "Invalid URL",
        };
      }

      const response = (await cloudinary.uploader.destroy(
        publicId,
      )) as CloudinaryDestroyResponse;

      if (response.result === "ok") {
        return {
          success: true,
          message: "Image deleted successfully from Cloudinary.",
        };
      } else if (response.result === "not found") {
        return {
          success: false,
          error: "Image not found on Cloudinary, ensure your url is correct.",
        };
      } else {
        return {
          success: false,
          error: `Unexpected result from Cloudinary. Please try again or contact support if the problem persists. 📩`,
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error occurred while deleting image from Cloudinary",
      };
    }
  }
}
