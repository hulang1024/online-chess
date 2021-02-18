package io.github.hulang1024.chess.user.avatar;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.UUID;

@Service
public class AvatarFileService {
    @Value("${avatar.path}")
    private String avatarPath;
    @Value("${avatar.dir}")
    private String avatarDir;

    public String saveFileByUrl(String avatarUrl) {
        try {
            Response response = new OkHttpClient().newCall(new Request.Builder().url(avatarUrl).build()).execute();
            String contentType = response.header("content-type");
            String subType = contentType.split("/")[1];
            return saveFile(response.body().byteStream(), subType);
        } catch (Exception e) {
            return null;
        }
    }

    public String saveFile(MultipartFile mFile) {
        if (mFile.isEmpty()) {
            return null;
        }
        int extIndex = mFile.getOriginalFilename().lastIndexOf(".");
        String fileNameExt = extIndex > -1
            ? mFile.getOriginalFilename().substring(extIndex + 1)
            : null;
        try {
            File file = createFile(fileNameExt);
            mFile.transferTo(file);
            return toUrlPath(file);
        } catch (Exception e) {
            return null;
        }
    }

    public String saveFile(InputStream in, String fileNameExt) throws Exception {
        File file = createFile(fileNameExt);
        try (
             FileOutputStream out = new FileOutputStream(file, true);) {
            byte[] bs = new byte[1024];
            for (int len; (len = in.read(bs)) != -1; ) {
                out.write(bs, 0, len);
            }
        }

        return toUrlPath(file);
    }

    private File createFile(String fileNameExt) {
        StringBuilder fileName = new StringBuilder(UUID.randomUUID().toString().replace("-", ""));
        if (StringUtils.isNotBlank(fileNameExt)) {
            fileName.append(".").append(fileNameExt);
        }
        return new File(avatarDir, fileName.toString());
    }

    private String toUrlPath(File file) {
        return avatarPath + "/" + file.getName();
    }
}