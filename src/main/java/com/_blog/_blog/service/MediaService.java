package com._blog._blog.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@Service
public class MediaService {

    private final Cloudinary cloudinary;

    public MediaService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    // Upload file to Cloudinary with folder organization and custom naming ( Secure Media Storage)
    public Map uploadFile(MultipartFile file, String folder, String customName) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw new RuntimeException("Invalid file type. Only images and videos are allowed.");
        }

        return cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "public_id", customName,
                        "resource_type", "auto"
                ));
    }

    // Delete file from Cloudinary using publicId (called when post/comment is deleted) ( Secure Media Storage)
    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
