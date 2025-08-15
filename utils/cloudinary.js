import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOULD_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
});

const uploadOnCloudinary = async (fileBuffer) => {
    if (!fileBuffer) return null;
    try {
        const base64File = `data:application/octet-stream;base64,${fileBuffer.toString("base64")}`;
        return await cloudinary.uploader.upload(base64File, { resource_type: "auto" });
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return null;
    }
};

export { uploadOnCloudinary };
